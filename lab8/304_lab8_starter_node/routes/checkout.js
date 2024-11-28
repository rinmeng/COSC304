const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    (async function () {
        try {
            res.write(`
        <title>PC8th Checkout</title>
        <link href="/style.css" rel="stylesheet">
        <body class="h-screen bg-slate-600  text-white opacity-0 animate-fade-in-instant">
            <nav class="text-white z-10 w-full flex justify-around items-center bg-slate-700 p-5 text-2xl ">
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
            </nav>
                `);

            if (req.session.authenticated) {
                try {

                    const pool = await sql.connect(dbConfig);

                    // Get user details
                    const userResult = await pool
                        .request()
                        .input("userId", sql.VarChar, req.session.user)
                        .query("SELECT firstName, lastName, customerId, password FROM customer WHERE userid = @userId");

                    const user = userResult.recordset[0];
                    const password = user.password;

                    // Write checkout summary
                    res.write(`
                        <div class="w-1/2 bg-slate-700 p-8 m-auto rounded-lg shadow-lg my-5">
                            <h1 class="text-4xl font-bold text-center mb-6">Checkout</h1>
                            <p class="text-lg text-gray-300 text-center mb-8">
                                You are logged in as <strong>${req.session.user}</strong>.
                                <br>Please confirm that you want to submit your order under this account.
                            </p>
                            <div class="flex space-x-4 w-full justify-center mt-4">
                                <a href="/showcart" class="btn-red">
                                    &larr; Cancel
                                </a>
                                <a href="/order?userId=${req.session.user}&password=${password}"
                                class="btn">
                                    Confirm & Submit &rarr;
                                </a>
                            </div>
                        </div>
                    `);
                }
                catch (err) {
                    console.error(err);
                    res.write(`
                        <div class="p-4 bg-red-500 text-white" >
                            <h3>Error: ${err.message}</h3>
                    </div >
                        `);
                    res.end();
                    return;
                }
            } else {
                res.write(`
                        <div class="w-1/3 bg-slate-700 p-8 m-auto rounded-lg shadow-lg space-y-4 my-5" >
                        <h1 class="text-4xl font-bold text-center ">Checkout</h1>
                        <p class="text-lg text-gray-300 text-center ">
                            You are not logged in.
                        </p>
                        <div class="flex justify-center text-center">
                            <a href="/login" class="btn flex-1">
                                Login 
                            </a>
                        </div>
                        <p class="text-lg text-gray-300 text-center">
                            Or enter your Username and Password to proceed to quickly checkout.
                        </p>
                        <form class="space-y-6 justify-center" method="get" action="order">
                            <div class="flex flex-col space-y-2">
                                <input 
                                    type="text" 
                                    name="userId" 
                                    id="userId" 
                                    placeholder="Username" 
                                    class="inner-forms text-center"
                                    required
                                >
                            </div>
                            <div class="flex flex-col space-y-2">
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="Password" 
                                    class="inner-forms text-center"
                                    required
                                >
                            </div>
                            <div class="flex flex-col space-y-4">
                                <div class="flex justify-center space-x-4 text-center ">
                                    <a href="/showcart" class="btn-gray flex-1">
                                        &larr; Cancel
                                    </a>
                                    <button 
                                        type="reset" 
                                        class="btn-red flex-1">
                                        Reset
                                    </button>
                                    <button 
                                        type="submit" 
                                        class="btn-green flex-1">
                                        Submit &rarr;
                                    </button>
                                </div>
                            </div>
                            
                        </form>
                    </div >
                        `);
            }
            res.write(`</body > `);
            res.end();
        } catch (err) {
            console.error(err);
            res.end();
        }
    })();
});

module.exports = router;