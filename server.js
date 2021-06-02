const express = require("express");
const moment = require("moment");
const lowdb = require("lowdb");
const { nanoid } = require("nanoid");
const FileSync = require("lowdb/adapters/FileSync");

const menuAdapter = new FileSync("menu.json");
const menuDatabase = lowdb(menuAdapter);

const accountAdapter= new FileSync("accounts.json");
const accountDatabase = lowdb(accountAdapter);

const ordersAdapter= new FileSync("orders.json");
const ordersDatabase = lowdb(ordersAdapter);

const app = express();
app.use(express.json());
app.use(express.static('frontend'));

//CORS-solution
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next()
})

/*Hämtar menu.JSON*/
app.get("/api/coffee", (request, response) => {
  response.json(menuDatabase);
});

/*Hämtar orders.JSON*/
app.get('/api/order', (request, response) => {
  response.json(ordersDatabase);
});

/*Lägger till order*/
app.post('/api/order', (request, response) => {
  const orders = request.body;
  console.log("Order att lägga till:", orders);
  const itemOnMenu = menuDatabase
    .get("menu")
    .find({ title: orders.title })
    .value();
    console.log("Item on Menu", itemOnMenu);

  const result = {
    allowed: true,
    itemOnMenu: true,
  };
  if (!itemOnMenu) {
      result.itemOnMenu = false;
      console.log("Sorry, the item you want is not on the menu. Try again.")
    } 
  if (result.itemOnMenu) {
    result.allowed = true;
  
  orders.orderID = nanoid(5); 
  function randomInt(min, max){
    return Math.random() * (min , max)+min;
  }
  let Idag = new Date();
  let date = new Date();
  date.setDate(date.getDate() + randomInt(1, 28));
  orders.eta = moment(date).format('dddd, MMMM Do YYYY, h a')
  orders.date = moment().format('dddd, MMMM Do YYYY, h a')
  /*Hämta activeAccount värde för att tilldela kontoID till beställningar.*/
  orders.userID = JSON.stringify(accountDatabase
    .get("activeAccount")
    .value())

  console.log('Ditt userID är:', orders.userID)
  console.log('Din produkt är:', orders.title);
  console.log('Ditt orderID är:', orders.orderID);
  console.log('Ordern var lagd:', orders.date);
  console.log('ETA:', orders.eta);
  ordersDatabase.get("orders").push(orders).write();
}
  response.json(result);
});


/* Se alla konton */
app.get("/api/account", (request, response) => {
  response.json(accountDatabase);
});

/*Skapa nya konton. {username:value}, {email:value}, {pwd:value}*/ 
app.post("/api/account", (request, response) => {
  const account = request.body;
  if(account.hasOwnProperty("username") && account.hasOwnProperty("email") && account.hasOwnProperty("pwd")){
  console.log("konto att lägga till:", account);

  const usernameInUse = accountDatabase
    .get("accounts")
    .find({ username: account.username })
    .value();
  const emailInUse = accountDatabase
    .get("accounts")
    .find({ email: account.email })
    .value();
  console.log("Email Används", emailInUse);
  console.log("Användarnamn Används:", usernameInUse);

  const result = {
    allowed: false,
    usernameInUse: false,
    emailInUse: false,
  };
  if (usernameInUse) {
    result.usernameInUse = true;
  }
  if (emailInUse) {
    result.emailInUse = true;
  }
  if (!result.usernameInUse && !result.emailInUse ) {
    /*Automatisk inkrement till UserID*/
    const myObject = accountDatabase
    .get("accounts")
    .value();
    let count = Object.keys(myObject).length;
    let int;
    for(int = 0; int < count; int++);
    account.id = int;
    /*Postar till databasen*/
    accountDatabase.get("accounts").push(account).write();


    /* Sätter AccountID till det "aktiva" kontot*/
    accountDatabase.set("activeAccount", account.id).write();
    result.allowed = true;
  } 
  response.json(result);
} else {
  console.log('Incorrect parameter')
  response.json('Incorrect parameter')
}
});

/*Filtrera userID på id params för att hitta alla ordrar på ett konto */
app.get("/api/order/:id", (request, response)=>{
  const filter = request.params.id
  const filterAccounts = ordersDatabase.get('orders').filter({ userID: `${filter}` }).value();
  console.log('FilterAccounts:', JSON.stringify(filterAccounts));
  response.send(filterAccounts)
})


/*Eventuellt LOGIN system för att kontrollera pwd & username funktionalitet*/
// app.post("/api/login", (request, response) => {
//   const loginCred = request.body;
//   console.log("loginCred:", loginCred);

//   const compareCred = accountDatabase.get("accounts")
//     .find({ username: loginCred.username, pwd: loginCred.password })
//     .value();
//   console.log("compareCred:", compareCred);

//   const result = {
//     success: false
//   }

// /* Kontroll */  
// if (compareCred) {
//     result.success = true;
//   }

//   response.json(result);
// });

app.listen(8001, () => {
  console.log("Server started");
});