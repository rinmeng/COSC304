const express = require("express");
const router = express.Router();
const sql = require("mssql");
const moment = require("moment");

const dbConfig = {
    server: "cosc304_sqlserver",
    database: "shop",
    authentication: {
        type: "default",
        options: {
            userName: "sa",
            password: "304#sa#pw",
        },
    },
    options: {
        encrypt: false,
        enableArithAbort: false,
    },
};

router.get("/", async function (req, res, next) {
    res.setHeader("Content-Type", "text/html");
    res.write("<title>PC8th Order Processing</title>");
    res.write('<link href="/style.css" rel="stylesheet">');
    res.write('<body class="bg-slate-600">');
    res.write(`<nav class='flex justify-around items-center bg-slate-700 p-5 text-2xl text-white'>
        <a class='text-center opacity-100 p-3 hover:opacity-100 t200e text-6xl w-3/4' href='/'>PC8th</a>
        <div class="flex justify-center w-full">
            <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/listprod'>Product List</a>
            <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/listorder'>Order List</a>
            <a class='opacity-50 p-3 hover:opacity-100 t200e' href='/showcart'>My Cart</a>
        </div>
    </nav>`);
    let productList = req.session.productList || [];

    if (!req.query.userId) {
        res.write(`
      <div class="p-4 bg-red-500 text-white">
        <h3>Error: Invalid User ID</h3>
      </div>
    `);
        res.end();
        return;
    }

    const userId = req.query.userId;
    const inputPassword = req.query.password;
    let userName = "";
    let success = true;
    let pool;

    try {
        pool = await sql.connect(dbConfig);

        // Validate user ID exists and retrieve user name
        const userResult = await pool
            .request()
            .input("userId", sql.VarChar, userId)
            .query(
                "SELECT firstName, lastName, password, customerId FROM Customer WHERE userid = @userId"
            );

        // Invalid user ID
        if (userResult.recordset.length === 0) {
            res.write(`
                <div class="p-4 bg-red-500 text-white">
                <h3>Error: User ID does not exist</h3>
                </div>
            `);
            res.end();
            return;
        }

        if (productList.length === 0) {
            res.write(`
          <div class="p-4 bg-red-500 text-white">
            <h3>Error: Shopping cart is empty</h3>
          </div>
        `);
            res.end();
            return;
        }

        // Getting row
        const { firstName, lastName, password, customerId } = userResult.recordset[0];
        console.log(userResult.recordset[0]);
        userName = `${firstName} ${lastName}`;
        // Validate password
        if (inputPassword !== password) {
            res.write(`
                <div class="p-4 bg-red-500 text-white">
                <h3>Error: Incorrect password</h3>
                </div>
            `);

            res.end();
            return;
        }

        // Insert into OrderSummary table and get auto-generated orderId
        const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");
        const validProducts = productList.filter(
            (product) => product !== null && product !== undefined
        );
        const totalAmount = validProducts.reduce(
            (sum, product) => sum + product.quantity * product.price,
            0
        );
        console.log("Product List:", validProducts);
        const orderInsertResult = await pool
            .request()
            .input("customerId", sql.Int, customerId)
            .input("orderDate", sql.VarChar, orderDate)
            .input("totalAmount", sql.Decimal, totalAmount)
            .query(
                "INSERT INTO OrderSummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES (@customerId, @orderDate, @totalAmount)"
            );
        const orderId = orderInsertResult.recordset[0].orderId;

        // Insert each product into OrderedProduct table
        for (let product of validProducts) {
            console.log("Order ID:", orderId);
            if (!product) {
                console.error(
                    `Error: productList[${product.id}] is null or undefined.`
                );
                success = false;
                continue; // Skip this entry
            }

            console.log("Product name:", product.name);
            try {
                await pool
                    .request()
                    .input("orderId", sql.Int, orderId)
                    .input("productId", sql.Int, product.id)
                    .input("quantity", sql.Int, product.quantity)
                    .input("price", sql.Decimal, product.price)
                    .query(
                        "INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, @productId, @quantity, @price)"
                    );
            } catch (err) {
                console.error(`Error inserting product: `, err);
                success = false;
                throw err; // Re-throw error after logging
            }
        }

        // Update total amount in OrderSummary
        await pool
            .request()
            .input("orderId", sql.Int, orderId)
            .input("totalAmount", sql.Decimal, totalAmount)
            .query(
                "UPDATE OrderSummary SET totalAmount = @totalAmount WHERE orderId = @orderId"
            );

        // Display order summary
        res.write(`
        <div class="my-10 w-1/3 mx-auto bg-white shadow-md rounded-lg p-6 text-gray-800">
          <h1 class="text-2xl font-bold text-center mb-4">Order Receipt</h1>
          <div class="border-b pb-4 mb-4">
            <p class="text-sm"><b>Order Date:</b> ${orderDate}</p>
            <p class="text-sm"><b>Order Reference Number:</b> ${orderId}</p>
            <p class="text-sm"><b>Shipping to:</b> ${userName} (ID: ${customerId})</p>
          </div>
      
          <div class="my-4">
            <h2 class="text-lg font-bold mb-2 border-b pb-2">Order Details</h2>
            
            <!-- Grid Header -->
            <div class="grid grid-cols-4 gap-4 text-sm font-bold mb-2">
              <div class="text-left">Product</div>
              <div class="text-right">Qty</div>
              <div class="text-right">Price</div>
              <div class="text-right">Subtotal</div>
            </div>
            
            <!-- Grid Body -->
            <div class="space-y-1">
              ${validProducts.map((product) => `
                <div class="grid grid-cols-4 gap-4 text-sm py-1 border-b">
                  <div class="text-left">${product.name}</div>
                  <div class="text-right">${product.quantity}</div>
                  <div class="text-right">$${product.price}</div>
                    <div class="text-right">$${(product.quantity * product.price).toFixed(2)}</div>
                </div>
              `).join("")}
            </div>
            <p class="text-sm text-right mt-2"><b>Total Amount:</b> $${totalAmount.toFixed(2)}</p>
          </div>
          <div class="text-center mt-6">
            <p class="text-lg font-bold">Thank you for your order!</p>
            <p class="text-sm text-gray-500">We will ship your purchase out soon.</p>
          </div>
        </div>
    `);


        // Clear shopping cart (session variable)

        if (success) {
           //req.session.productList = [];
        }
    } catch (err) {
        console.log(err);
        res.write(`
      <div class="p-4 bg-red-500 text-white">
        <h3>Error: ${err.message}</h3>
      </div>
    `);
    } finally {
        pool && pool.close();
    }

    res.end();
});

module.exports = router;
