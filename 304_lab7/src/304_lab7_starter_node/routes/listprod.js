// const express = require('express');
// const router = express.Router();
// const sql = require('mssql');

// router.get('/', function (req, res, next) {
//     res.setHeader('Content-Type', 'text/html');
//     res.write("<title>PC8th Parts</title>")
//     res.write('<link href="/style.css" rel="stylesheet">');
//     res.write('<body class="text-white text-center bg-slate-600">');
//     // Get the product name to search for
//     //let name = req.query.productName;

//     /** $name now contains the search string the user entered
//      Use it to build a query and print out the results. **/
//     (async function() {
//         try {
//             console.log("Connecting to the database...");
//             let pool = await sql.connect(dbConfig);

//             console.log("Connected. Reading data from the database...");
//             let sqlQuery = "SELECT productName, productPrice FROM product";
//             let results = await pool.request()
//                 .query(sqlQuery);

//             console.log("Data read. Printing results...");
//             res.write("<table><tr><th>Name</th><th>Price</th></tr>");
//             for (let i = 0; i < results.recordset.length; i++) {
//                 let result = results.recordset[i];
//                 res.write("<tr><td>" + result.ename + "</td><td>" + result.salary + "</td></tr>");
//             }
//             res.write("</table>");

//             res.end();
//         } catch(err) {
//             console.dir(err);
//             res.write(JSON.stringify(err));
//             res.end();
//         }
//     })();

//     /** Create and validate connection **/

//     /** Print out the ResultSet **/

//     /** 
//     For each product create a link of the form
//     addcart?id=<productId>&name=<productName>&price=<productPrice>
//     **/

//     /**
//         Useful code for formatting currency:
//         let num = 2.89999;
//         num = num.toFixed(2);
//     **/

//     res.end();
// });

// module.exports = router;


/*

CHAT GPT: Testing queries are working


*/

const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Database configuration (Ensure it matches your dbConfig)
const dbConfig = {
  server: 'cosc304_sqlserver',
  database: 'shop',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: '304#sa#pw'
    }
  },
  options: {
    encrypt: false,
    enableArithAbort: false
  }
};

router.get('/', function (req, res, next) {
  res.setHeader('Content-Type', 'text/html');
  res.write("<title>PC8th Parts</title>");
  res.write('<link href="/style.css" rel="stylesheet">');
  res.write('<body class="text-white text-center bg-slate-600">');

  (async function () {
    try {
      console.log("Connecting to the database...");
      let pool = await sql.connect(dbConfig);

      console.log("Connected. Reading data from the database...");
      // Query to get all products: name and price
      let sqlQuery = "SELECT productName, productPrice FROM product";
      let results = await pool.request().query(sqlQuery);

      console.log("Data read. Printing results...");
      res.write("<h2 class='text-7xl my-5 font-light'>Product List</h2>");
      res.write("<table border='1' cellpadding='5' cellspacing='0' style='margin: 20px auto;'>");
      res.write("<tr><th>Product Name</th><th>Product Price</th></tr>");

      // Loop through results and display product name and price in a table row
      for (let i = 0; i < results.recordset.length; i++) {
        let result = results.recordset[i];
        res.write("<tr><td>" + result.productName + "</td><td>" + result.productPrice.toFixed(2) + "</td></tr>");
      }

      res.write("</table>");
      res.end();
    } catch (err) {
      console.dir(err);
      res.write("<h3>Error: " + JSON.stringify(err) + "</h3>");
      res.end();
    }
  })();
});

module.exports = router;
