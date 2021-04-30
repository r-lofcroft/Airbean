const express = require("express");
const moment = require("moment");
const lowdb = require("lowdb");
const { nanoid } = require("nanoid");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("menu.json");
const database = lowdb(adapter);

const app = express();
app.use(express.json());
app.use(express.static('frontend'));


let orders = [];

/*Hämtar menu.JSON*/
app.get("/api/coffee", (request, response) => {
  response.json(database);
});

app.get('/api/order', (request, response) => {
  response.json(orders);
});

/*Lägger till order*/
app.post('/api/order', (request, response) => {
  const orderItem = request.body;
  orderItem.id = nanoid(5); 
  orderItem.eta =  moment().format("ddd, hA" ); 
  console.log('Ditt orderID är:', orderItem.id);
  console.log('ETA:', orderItem.eta);
  orders.push(orderItem);

  //Vad ska vi skicka tillbaka för svar?
  response.json(orderItem);
});


app.listen(8001, () => {
  console.log("Server started");
});