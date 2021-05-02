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


let orders = [];
let accounts = [];

/*Hämtar menu.JSON*/
app.get("/api/coffee", (request, response) => {
  response.json(menuDatabase);
});

/*Hämtar orders.JSON*/
app.get('/api/order', (request, response) => {
  response.json(orders);
});

/*Lägger till order*/
app.post('/api/order', (request, response) => {
  const orderItem = request.body;
  console.log("Order att lägga till:", orderItem);
  const itemOnMenu = menuDatabase
    .get("menu")
    .find({ title: orderItem.title })
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
    ordersDatabase.get("orders").push(orderItem.title).write();
    result.allowed = true;
  
  orderItem.orderID = nanoid(5); 
  function randomInt(min, max){
    return Math.random() * (min , max)+min;
  }
  let Idag = new Date();
  let date = new Date();
  date.setDate(date.getDate() + randomInt(1, 28));
  orderItem.eta = moment(date).format('dddd, MMMM Do YYYY, h a')
  orderItem.date = moment().format('dddd, MMMM Do YYYY, h a')

  console.log('Din produkt är:', orderItem.title);
  console.log('Ditt orderID är:', orderItem.orderID);
  console.log('Ordern var lagd:', orderItem.date);
  console.log('ETA:', orderItem.eta);
  orders.push(orderItem);
}
  //Vad ska vi skicka tillbaka för svar?
  response.json(orderItem);
});


/* Se alla konton */
app.get("/api/account", (request, response) => {
  response.json(accountDatabase);
});

/*Skapa nya konton*/ 
app.post("/api/account", (request, response) => {
  const account = request.body;
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
  if (!result.usernameInUse && !result.emailInUse) {
    accountDatabase.get("accounts").push(account).write();
    result.allowed = true;
  }
  response.json(result);
});

app.listen(8001, () => {
  console.log("Server started");
});