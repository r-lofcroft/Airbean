const express = require('express');
const lowdb = require('lowdb');
const { nanoid } = require('nanoid');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('menu.json');
const database = lowdb(adapter);

const app = express();

app.use(express.json());

//Initirerar vår databas med en tom array



app.listen(8001, () => {
  console.log('Server started');
});