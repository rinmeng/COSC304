const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    // Get the product list from session
    let productList = false;
    if (!req.session.productList) {
        // If no product list exists, redirect back to products
        res.redirect("/listprod");
        return;
    } else {
        productList = req.session.productList;
    }

    // Get product information from query parameters
    let id = false;
    let name = false;
    let price = false;
    if (req.query.id && req.query.name && req.query.price) {
        id = req.query.id;
        name = req.query.name;
        price = req.query.price;
    } else {
        res.redirect("/listprod");
        return;
    }

    // Check if product exists in cart
    if (productList[id]) {
        // Decrease quantity by 1
        productList[id].quantity = productList[id].quantity - 1;

        // If quantity reaches 0, remove the item completely
        if (productList[id].quantity <= 0) {
            delete productList[id];
        }
    }

    // Update session and redirect back to cart
    req.session.productList = productList;
    res.redirect("/showcart");
});

module.exports = router;