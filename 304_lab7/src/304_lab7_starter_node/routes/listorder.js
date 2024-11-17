const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');



router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>PC8th Order List</title>');
    res.write('<link href="/style.css" rel="stylesheet">');
    res.write('<body class="text-white text-center bg-slate-600">');
    /** Create connection, and validate that it connected successfully **/
    res.write('<h1 class="text-7xl my-5 font-light">Order List</h1> </body>');

    /**
    Useful code for formatting currency:
        let num = 2.87879778;
        num = num.toFixed(2);
    **/

    (async function () {
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "SELECT * FROM ordersummary";
            let results = await pool.request()
                .query(sqlQuery);


        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();

    /** Write query to retrieve all order headers **/

    /** For each order in the results
            Print out the order header information
            Write a query to retrieve the products in the order

            For each product in the order
                Write out product information 
    **/

    res.end();
});

module.exports = router;