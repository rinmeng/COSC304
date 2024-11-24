const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
        <title>PC8th Checkout</title>
        <link href="/style.css" rel="stylesheet">
        <body class="min-h-screen bg-slate-600 flex items-center justify-center text-white opacity-0 animate-fade-in-instant">
            <div class="w-1/3 bg-slate-700 p-8 rounded-lg shadow-lg">
                <h1 class="text-4xl font-bold  text-center mb-6">Checkout</h1>
                <p class="text-lg text-gray-300 text-center mb-8">Enter your User ID to complete the transaction</p>
                <form class="space-y-6" method="get" action="order">
                    <div class="flex flex-col space-y-2">
                        <label for="userId" class="text-lg font-medium text-gray-300">User ID:</label>
                        <input 
                            type="text" 
                            name="userId" 
                            id="userId" 
                            placeholder="Enter your User ID" 
                            class="w-full p-3 forms text-white outline-none focus:bg-gray-600 focus:border-slate-900 t200e"
                            required
                        >
                    </div>
                    <div class="flex flex-col space-y-2">
                        <label for="password" class="text-lg font-medium text-gray-300">Password:</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            placeholder="Enter your password" 
                            class="w-full p-3 forms text-white outline-none focus:bg-gray-600 focus:border-slate-900 t200e"
                            required
                        >
                    </div>
                    <div class="flex justify-between space-x-4">
                        <a href="/showcart" class="w-full text-center bg-gray-500 text-lg text-white font-semibold py-3 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none transition">
                            &larr; Cancel
                        </a>
                        <button 
                            type="reset" 
                            class="w-full bg-red-500 text-lg text-white font-semibold py-3 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none transition">
                            Reset
                        </button>
                        <button 
                            type="submit" 
                            class="w-full bg-blue-500 text-lg text-white font-semibold py-3 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition">
                            Submit &rarr;
                        </button>
                    </div>
                </form>
            </div>
        </body>
    `);
    res.end();
});

module.exports = router;
