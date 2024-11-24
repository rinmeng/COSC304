const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res, next) {
    try {
        res.setHeader('Content-Type', 'text/html');
        res.write('<title>PC8th Order List</title>');
        res.write('<link href="/style.css" rel="stylesheet">');
        res.write('<body class="text-white bg-slate-600">');
        res.write(`<nav class='flex justify-around items-center bg-slate-700 p-5 text-2xl'>
        <a class='text-center opacity-100 p-3 hover:opacity-100 t200e text-6xl w-3/4' href='/'>PC8th</a>
        <div class="flex justify-center w-full">
            <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/listprod'>Product List</a>
            <a class='opacity-100 p-3 hover:opacity-100 t200e' href='/listorder'>Order List</a>
            <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/showcart'>My Cart</a>
        </div>
    </nav>`);
        res.write('<h1 class="text-7xl my-5 font-light text-center">Order List</h1>');

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

        res.write('<div class="max-w-5xl mx-auto p-4">');

        if (results.recordset.length > 0) {
            for (const order of results.recordset) {
                let productsQuery = `
                    SELECT op.productId, op.quantity, op.price,
                           p.productName
                    FROM orderproduct op
                    JOIN product p ON op.productId = p.productId
                    WHERE op.orderId = ${order.orderId}
                `;
                let productResults = await pool.request().query(productsQuery);

                res.write(`
                    <div class="mb-8 bg-slate-800 p-6 rounded-lg shadow-md">
                        <div>
                            <h2 class="text-2xl font-semibold ">Order ID: ${order.orderId}</h2>
                            <p class="text-gray-400">Placed by: <span class="text-white">${order.firstName} ${order.lastName}</span> (ID: <span class='text-white'>${order.customerId}</span>)</p>
                            <p class="text-gray-400">Placed on: <span class="text-white">${moment(order.orderDate).format('YYYY-MM-DD')}</span></p>
                        </div>
                        <div class="mt-6 bg-gray-700 p-4 rounded-md">
                            <h3 class="text-xl font-medium text-blue-300 mb-4">Order Items</h3>
                            <div class="grid grid-cols-5 gap-4 text-gray-300 font-semibold border-b border-gray-600 pb-2">
                                <p>Product Name</p>
                                <p>Product ID</p>
                                <p>Quantity</p>
                                <p>Price</p>
                                <p>Subtotal</p>
                            </div>
                `);

                productResults.recordset.forEach(product => {
                    res.write(`
                        <div class="grid grid-cols-5 gap-4 text-gray-300 items-center mt-2 border-b border-gray-600 py-2">
                            <p>${product.productName}</p>
                            <p>${product.productId}</p>
                            <p>${product.quantity}</p>
                            <p>$${product.price.toFixed(2)}</p>
                            <p class="text-green-400">$${(product.quantity * product.price).toFixed(2)}</p>
                        </div>
                    `);
                });

                res.write(`
                            <div class="mt-4 text-right">
                                <p class="text-lg font-bold text-gray-300">Total Amount:</p>
                                <p class="text-2xl font-bold text-green-400">$${order.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                `);
            }
        } else {
            res.write('<p class="text-center text-gray-400">No orders found.</p>');
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