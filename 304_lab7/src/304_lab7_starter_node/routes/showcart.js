const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    let productList = false;
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Your Shopping Cart</title>");
    res.write('<link href="/style.css" rel="stylesheet">');
    res.write('<body class="text-white text-center bg-slate-600">');
    res.write(`<nav class='flex justify-around items-center bg-slate-700 p-5 text-2xl'>
        <a class='opacity-50 p-3 hover:opacity-100 t200e ' href='/'>Home</a>
        <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/listprod'>Product List</a>
        <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/listorder'>Order List</a>
        <a class='opacity-100 p-3 hover:opacity-100 t200e' href='/showcart'>Show Cart</a>
        </nav>`);

    if (req.session.productList) {
        productList = req.session.productList;
        res.write("<h1 class='text-4xl my-8 font-light'>Your Shopping Cart</h1>");

        res.write(`
            <div class="container mx-auto px-4 max-w-4xl">
                <!-- Grid Header -->
                <div class="grid grid-cols-6 gap-4 mb-4 bg-slate-800 p-4 rounded-lg font-bold">
                    <div class="text-center">Product ID</div>
                    <div class="text-center">Product Name</div>
                    <div class="text-center">Quantity</div>
                    <div class="text-center">Price</div>
                    <div class="text-center">Subtotal</div>
                    <div class="text-center">Action</div>
                </div>
                
                <!-- Grid Body -->
                <div class="space-y-2">
        `);

        let total = 0;
        for (let i = 0; i < productList.length; i++) {
            let product = productList[i];
            if (!product) {
                continue;
            }

            const subtotal = (Number(product.quantity) * Number(product.price)).toFixed(2);
            total = total + product.quantity * product.price;

            res.write(`
                <div class="grid grid-cols-6 gap-4 items-center bg-slate-700 p-4 rounded-lg hover:bg-slate-900 transition duration-200">
                    
                    <div class="text-center text-slate-300">${product.id}</div>
                    <div class="text-center font-medium">${product.name}</div>
                    <div class="text-center">
                        <span class="bg-slate-600 px-4 py-2 rounded">${product.quantity}</span>
                    </div>
                    <div class="text-center text-green-400">$${Number(product.price).toFixed(2)}</div>
                    <div class="text-center text-green-400 font-medium">$${subtotal}</div>
                    <div class="flex justify-center items-center space-x-2 text-3xl">
                        <a href="/removecart?id=${product.id}&name=${product.name}&price=${product.price}" 
                            class="text-red-400 hover:underline t200e">
                            &minus;
                        </a>
                        <a href="/addcart?id=${product.id}&name=${product.name}&price=${product.price}" 
                            class="text-green-400 hover:underline t200e">
                            &plus;
                        </a>
                        <a href="/removeallcart?id=${product.id}&name=${product.name}&price=${product.price}" 
                            class="text-red-400 text-2xl hover:underline t200e">
                            &cross;
                        </a>
                    </div>
                </div>
            `);
        }

        // Total row with different styling
        res.write(`
                <div class="grid grid-cols-5 gap-4 items-center bg-slate-800 p-4 mt-6 rounded-lg font-bold">
                    <div class="col-span-3"></div>
                    <div class="text-right">Order Total:</div>
                    <div class="text-right text-green-400">$${total.toFixed(2)}</div>
                </div>
            </div>
        </div>
        `);

        // Checkout button
        res.write(`
            <div class="mt-8 space-y-4">
                <a href="/checkout" class="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
                    Proceed to Checkout &rarr;
                </a>
            </div>
        `);
    } else {
        res.write(`
            <div class="container mx-auto px-4 py-16 text-center">
                <h1 class="text-4xl mb-8 font-light">Your shopping cart is empty!</h1>
                <div class="bg-slate-700 p-8 rounded-lg max-w-2xl mx-auto">
                    <p class="text-slate-300 mb-6">Looks like you haven't added any items to your cart yet!</p>
                </div>
            </div>
        `);
    }

    // Continue shopping button
    res.write(`
        <div class="mt-6 mb-12">
            <a href="/listprod" class="inline-block bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
                &larr; Continue Shopping
            </a>
        </div>
    `);

    res.write("</body>");
    res.end();
});

module.exports = router;