const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>PC8th Checkout</title>");
    res.write('<link href="/style.css" rel="stylesheet">');
    res.write('<body class="text-white text-center bg-slate-600">');

    res.write("<h1 class='text-5xl my-5 font-light'>Enter your customer id to complete the transaction:</h1>");
    res.write('<form class="m-5 py-5 px-10 forms flex flex-col space-y-5" method="get" action="order">');
    res.write('<label class=" text-white text-3xl" for="customerId">Customer ID:</label>');
    res.write('<input class=" text-center inner-forms text-2xl" type="text" name="customerId" size="50">');
    res.write('<input class=" btn point" type="submit" value="Submit">');
    res.write('<input class=" btn-red point" type="reset" value="Reset">');
    res.write('</form>');

    res.write('</body>');
    res.end();
});

module.exports = router;
