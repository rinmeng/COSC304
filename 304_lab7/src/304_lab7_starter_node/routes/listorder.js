const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res, next) {
    try {
        res.setHeader('Content-Type', 'text/html');
        res.write('<title>PC8th Order List</title>');
        res.write('<link href="/style.css" rel="stylesheet">');
        res.write('<body class="text-white text-center bg-slate-600">');
        res.write(`<nav class='flex justify-around items-center bg-slate-700 p-5 text-2xl'>
        <a class='opacity-50 p-3 hover:opacity-100 t200e ' href='/'>Home</a>
        <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/listprod'>Product List</a>
        <a class='opacity-100 p-3 hover:opacity-100 t200e' href='/listorder'>Order List</a>
        <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/showcart'>Show Cart</a>
        </nav>`);
        res.write('<h1 class="text-7xl my-5 font-light">Order List</h1>');

        let pool = await sql.connect(dbConfig);
        console.log('Connection successful! Executing query...');

        let sqlQuery = `
            SELECT o.orderId, o.orderDate, o.totalAmount, 
                   c.customerId, c.firstName, c.lastName
            FROM ordersummary o 
            JOIN customer c 
            ON o.customerId = c.customerId
            ORDER BY o.orderId ASC
        `;
        let results = await pool.request().query(sqlQuery);

        res.write('<div class="container mx-auto">');

        if (results.recordset.length > 0) {
            // Using for...of loop to handle async operations properly
            for (const order of results.recordset) {
                // Query to get products for this order
                let productsQuery = `
                    SELECT op.productId, op.quantity, op.price,
                           p.productName
                    FROM orderproduct op
                    JOIN product p ON op.productId = p.productId
                    WHERE op.orderId = ${order.orderId}
                `;
                let productResults = await pool.request().query(productsQuery);

                res.write(`
                    <div class="mb-4 p-4 bg-slate-700 rounded-lg">
                        <div class='border-slate-400 border-2 p-5 rounded-lg'>
                            <div><h1 class='text-5xl'>Order ID: ${order.orderId}</h1></div>
                            <div class='flex items-center justify-between'>
                                <p>Customer ID: ${order.customerId}</p>
                                <p>Customer Name: ${order.firstName} ${order.lastName}</p>
                                <p>Order Date: ${moment(order.orderDate).format('YYYY-MM-DD')}</p>
                                <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
                            </div>

                            <div class='border-slate-400 border-2 p-5 mt-4 rounded-lg'>
                                <div><h1 class='text-3xl mb-4'>Order Items</h1></div>
                                <div class='grid grid-cols-4 gap-4 font-bold mb-2'>
                                    <p>Product Name</p>
                                    <p>Product ID</p>
                                    <p>Quantity</p>
                                    <p>Price</p>
                                </div>
                `);

                // Write each product in the order
                productResults.recordset.forEach(product => {
                    res.write(`
                        <div class='grid grid-cols-4 gap-4 '>
                            <p>${product.productName}</p>
                            <p>${product.productId}</p>
                            <p>${product.quantity}</p>
                            <p>$${product.price.toFixed(2)}</p>
                        </div>
                    `);
                });

                res.write(`
                            </div>
                        </div>
                    </div>
                `);
            }
        } else {
            res.write('<p>No orders found.</p>');
        }

        res.write('</div></body>');
        res.end();

    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send('An error occurred while fetching orders');
    } finally {
        console.log('Closing database connection...');
        sql.close();
    }
});

module.exports = router;