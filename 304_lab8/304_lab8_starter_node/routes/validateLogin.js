const express = require("express");
const router = express.Router();
const auth = require("../auth");
const sql = require("mssql");

router.post("/", function (req, res) {
  // Have to preserve async context since we make an async call
  // to the database in the validateLogin function.
  (async () => {
    let authenticatedUser = await validateLogin(req, res);
    if (authenticatedUser) {
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  })();
});

async function validateLogin(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return false;
  }

  let username = req.body.username;
  let password = req.body.password;
  let authenticatedUser = await (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      // TODO: Check if userId and password match some customer account.
      // If so, set authenticatedUser to be the username.
      let result = await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, password)
        .query(
          "SELECT * FROM Customer WHERE userId = @username AND password = @password"
        );
      if (result.recordset.length > 0) {
        // Redirect to admin
        req.session.authenticated = true;
        req.session.user = username;
        res.redirect("/admin");
      } 
      else {
        // TODO: error handling if wrong, tell user it incorrect
        res.send("Incorrect username or password");
      }

      return false;
    } catch (err) {
      console.dir(err);
      return false;
    }
  })();

  return authenticatedUser;
}

module.exports = router;
