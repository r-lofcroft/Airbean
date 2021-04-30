const express = require("express");
const lowdb = require("lowdb");
const { nanoid } = require("nanoid");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("accounts.json");
const database = lowdb(adapter);

const app = express();

app.use(express.json());

/*Hämtar menu.JSON*/
app.post("/api/signup", (request, response) => {
  const account = request.body;
  console.log("konto att lägga till:", account);

  const usernameInUse = database
    .get("accounts")
    .find({ username: account.username })
    .value();
  const emailInUse = database
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
    database.get("accounts").push(account).write();
    result.allowed = true;
  }
  response.json(result);
});

app.listen(8001, () => {
  console.log("Server started");
});
