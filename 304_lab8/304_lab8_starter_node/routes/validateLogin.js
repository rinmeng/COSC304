const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Handle POST request for login
router.post("/", async function (req, res) {
  let authenticatedUser = await validateLogin(req, res);

  if (authenticatedUser) {
    res.redirect("/"); // Redirect to homepage after successful login
  } else {
    res.redirect("/login"); // Redirect back to login page if authentication fails
  }
});

// The function that checks credentials
async function validateLogin(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return false;
  }

  let username = req.body.username;
  let password = req.body.password;

  try {
    // Connect to the database
    let pool = await sql.connect(dbConfig);

    // Query the database to check if user exists with the provided username and password
    let result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query("SELECT * FROM Customer WHERE userId = @username AND password = @password");

    // If a matching user is found, authenticate them
    if (result.recordset.length > 0) {
      req.session.authenticated = true;
      req.session.user = username; // Store username in session
      req.session.userid = result.recordset[0].customerId; // Store userId in session
      return true; // Return true to indicate successful login
    } else {
      // If credentials are incorrect, set an error message and redirect back to login
      req.session.loginMessage = "Invalid username or password. Please try again.";
      return false; // Return false to indicate failed login
    }
  } catch (err) {
    console.error(err);
    req.session.loginMessage = "An error occurred while processing your login request. Please try again later.";
    return false;
  }
}

module.exports = router;
