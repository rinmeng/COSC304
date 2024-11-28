const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>Product Details</title>');
    res.write('<link href="/style.css" rel="stylesheet">');
    res.write('<body class="text-white text-center bg-slate-600 animate-fall-1">');

    (async function () {
        try {
            let pool = await sql.connect(dbConfig);

            // Get product name to search for
            // TODO: Retrieve and display info for the product
            const productId = req.query.id;
            if (!productId) {
                res.write('<h2 class="text-red-500">No product selected!</h2>');
                res.end();
                return;
            }

            let productQuery = `
                SELECT p.productId, p.productName, p.productPrice, p.productDesc, p.productImageURL, p.productImage, c.categoryName
                FROM product p
                JOIN category c ON p.categoryId = c.categoryId
                WHERE p.productId = @productId
            `;

            let request = pool.request();
            request.input('productId', sql.Int, productId);
            let result = await request.query(productQuery);
            let product = result.recordset[0];

            if (result.recordset.length === 0) {
                res.write('<h2 class="text-red-500">Product not found!</h2>');
                res.end();
                return;
            }


            // Display product details
            res.write(`
                <div class="w-1/2 mx-auto px-4 m-5">
                    <div class="strong-slate rounded-xl p-10">
                        <h1 class="text-5xl font-light my-5">${product.productName}</h1>
            `);

            // TODO: If there is a productImageURL, display using IMG tag
            if (product.productImageURL) {
                res.write(`
                    <div class="my-10">
                        <img src="${product.productImageURL}" alt="${product.productName}" 
                        class="rounded-lg shadow-lg mx-auto w-1/2 h-auto">
                    </div>
                `);
            }

            // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
            if (product.productImage) {
                res.write(`
                    <div class="my-4">
                        <img src="/displayImage?id=${product.productId}" alt="${product.productName}" 
                        class="rounded-lg shadow-lg mx-auto" style="max-width: 300px;">
                    </div>
                `);
            }

            // TODO: Add links to Add to Cart and Continue Shopping
            addToCartURL = `/addcart?id=${product.productId}&name=${encodeURIComponent(product.productName)}&price=${encodeURIComponent(product.productPrice)}`;
            res.write(`
                <div class="text-left mb-10 w-full">
                    <p class="text-xl text-left"><span class="text-gray-400">Category:</span> ${product.categoryName}</p>
                    <p class="text-xl text-left"><span class="text-gray-400">Description:</span> ${product.productDesc}</p>
                    <p class="text-xl text-left "><span class="text-gray-400">Price:</span> 
                        <span class="text-green-400">
                            $${product.productPrice.toFixed(2)}
                        </span>
                    </p>
                </div>
                <div class="flex justify-center mt-5 items-center space-x-2">
                    <div class="">
                        <a href="/listprod" class="btn-red">
                            &larr; Continue Shopping
                        </a>
                    </div>
                    <div>
                        <a href="${addToCartURL}" class="btn ">
                            Add to Cart &rarr;
                       </a>
                    </div>
                </div>
            `);

            res.end()
        } catch (err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
    res.write('</div>');
    res.write('</body>');
});

module.exports = router;
