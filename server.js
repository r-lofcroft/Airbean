const express = require('express');
const lowdb = require('lowdb');
const { nanoid } = require('nanoid');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('menu.json');
const database = lowdb(adapter);

const app = express();

app.use(express.json());

/*Hämtar menu.JSON*/
app.get('/api/coffee', (request, response) => {
  response.json(database);
});

app.listen(8001, () => {
  console.log('Server started');
});