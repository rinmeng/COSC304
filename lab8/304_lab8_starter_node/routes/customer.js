const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    // Fetch customer data from the database
    (async function () {
        try {
            res.write('<title>PC8th Customer Information</title>');
            res.write('<link href="/style.css" rel="stylesheet">');
            res.write('<body class="text-white bg-slate-600">');

            res.write(`<nav class="z-10 w-full flex justify-around items-center bg-slate-700 p-5 text-2xl ">
                        <!-- Logo -->
                        <a class="opacity-100 p-3 hover:opacity-100 t200e text-center text-6xl w-3/4" href="/">PC8th</a>
    
                        <!-- Navigation Links -->
                        <div class="flex justify-center w-full">
                            <!-- Product List -->
                            <a href="/listprod" class="relative group p-3">
                                <div class="opacity-50 group-hover:opacity-100 t200e">Product List</div>
                                <div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 t200e">
                                </div>
                            </a>
    
                            <!-- Order List -->
                            <a href="/listorder" class="relative group p-3">
                                <div class="opacity-50 group-hover:opacity-100 t200e">Order List</div>
                                <div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 t200e">
                                </div>
                            </a>
    
                            <!-- My Cart -->
                            <a href="/showcart" class="relative group p-3">
                                <div class="opacity-50 group-hover:opacity-100 t200e">My Cart</div>
                                <div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 t200e">
                                </div>
                            </a>
                        </div>
    
                        <!-- Login -->
                        <div class="text-center items-center">
                        <!-- If logged in, show user's name and logout button -->
                        ${req.session.authenticated ? `
                            <p class="text-white px-3 w-full">Hey,
                                <a href="/customer?userid={{userid}}" class="font-bold opacity-50 hover:opacity-100 t200e">
                                    <strong>${req.session.user}</strong>
                                </a>
                            </p>
                            <a href="/logout" class="opacity-50 p-3 hover:opacity-100 t200e px-10">Logout</a>
                        ` : `
                            <a class="opacity-50 p-3 hover:opacity-100 t200e px-10" href="/login">Login</a>
                        `}
                    </div>
                    </nav>`);

            let pool = await sql.connect(dbConfig);

            // Ensure that req.session.userid exists and is valid
            if (!req.session.userid) {
                res.write('<div class="p-4 bg-red-500 text-white"><h3>Error: User not logged in</h3></div>');
                res.end();
                return;
            }

            let result = await pool.request()
                .input('customerId', sql.Int, req.session.userid)
                .query("SELECT * FROM Customer WHERE customerId = @customerId");

            if (result.recordset.length === 0) {
                res.write('<div class="p-4 bg-red-500 text-white"><h3>Error: Customer not found</h3></div>');
                res.end();
                return;
            }

            let customer = result.recordset[0];

            res.write('<div class="opacity-0 animate-fade-in-instant">');
            res.write('<h1 class="text-7xl my-5 font-light text-center">Customer Information</h1>');
            res.write('<div class="container mx-auto px-4 max-w-4xl">');

            // Grid layout for customer information
            res.write('<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">');

            // Displaying customer details in grid format
            res.write(`
                <div class="card">
                    <span class="card-text-gray">Customer ID:</span> <span>${customer.customerId}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">First Name:</span> <span>${customer.firstName}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Last Name:</span> <span>${customer.lastName}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Phone:</span> <span>${customer.phonenum}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Email:</span> <span>${customer.email}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Address:</span> <span>${customer.address}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">City:</span> <span>${customer.city}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">State:</span> <span>${customer.state}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Postal Code:</span> <span>${customer.postalCode}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Country:</span> <span>${customer.country}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">User ID:</span> <span>${customer.userid}</span>
                </div>
                <div class="card">
                    <span class="card-text-gray">Password:</span> <span>${customer.password}</span>
                </div>

            `);

            res.write('</div>'); // End of grid
            res.write('</div>'); // End of container
            res.write('</body>');
            res.end();

        } catch (err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
