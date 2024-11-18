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
        res.write("<h1>Your Shopping Cart</h1>");
        res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
        res.write("<th>Price</th><th>Subtotal</th></tr>");

        let total = 0;
        for (let i = 0; i < productList.length; i++) {
            product = productList[i];
            if (!product) {
                continue
            }

            res.write("<tr><td>" + product.id + "</td>");
            res.write("<td>" + product.name + "</td>");

            res.write("<td align=\"center\">" + product.quantity + "</td>");

            res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
            res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) + "</td></tr>");
            res.write("</tr>");
            total = total + product.quantity * product.price;
        }
        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");

        res.write("<h2><a href=\"checkout\">Check Out</a></h2>");
    } else {
        res.write("<h1>Your shopping cart is empty!</h1>");
    }
    res.write('<h2><a href="listprod">Continue Shopping</a></h2>');

    res.end();
});

module.exports = router;
