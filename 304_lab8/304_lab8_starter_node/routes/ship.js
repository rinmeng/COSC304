// Get order id
// Check if valid order id
// Start a transaction
// Retrieve all items in order with given id
// Create a new shipment record.
// For each item verify sufficient quantity available in warehouse 1.
// If any item does not have sufficient inventory, cancel transaction and rollback. Otherwise, update inventory for each item.
const express = require("express");
const router = express.Router();
const sql = require("mssql");

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html");
  res.write('<link href="/style.css" rel="stylesheet">');
  res.write('<body class="text-white  bg-slate-600">');
  // Check if admin is logged in
  res.write(
    '<nav class="z-10 w-full flex justify-around items-center bg-slate-700 p-5 text-2xl">'
  );
  res.write(
    '<a class="opacity-100 p-3 hover:opacity-100 t200e text-center text-6xl w-3/4" href="/">PC8th</a>'
  );
  res.write('<div class="flex justify-center w-full">');
  res.write('<a href="/listprod" class="relative group p-3">');
  res.write(
    '<div class="opacity-50 group-hover:opacity-100 t200e">Product List</div>'
  );
  res.write(
    '<div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 t200e"></div>'
  );
  res.write("</a>");
  res.write('<a href="/listorder" class="relative group p-3">');
  res.write(
    '<div class="opacity-100 group-hover:opacity-100 t200e">Order List</div>'
  );
  res.write(
    '<div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-50 group-hover:scale-x-100 t200e"></div>'
  );
  res.write("</a>");
  res.write('<a href="/showcart" class="relative group p-3">');
  res.write(
    '<div class="opacity-50 group-hover:opacity-100 t200e">My Cart</div>'
  );
  res.write(
    '<div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 t200e"></div>'
  );
  res.write("</a>");
  res.write("</div>");
  res.write('<div class="text-center items-center">');
  res.write(
    `${
      req.session.authenticated
        ? `
        <p class="text-white px-3 w-full">Hey,
            <a href="/customer?userid={{userid}}" class="font-bold opacity-50 hover:opacity-100 t200e">
                <strong>${req.session.user}</strong>
            </a>
        </p>
        <a href="/logout" class="opacity-50 p-3 hover:opacity-100 t200e px-10">Logout</a>
    `
        : `
        <a class="opacity-50 p-3 hover:opacity-100 t200e px-10" href="/login">Login</a>
    `
    }`
  );
  res.write("</div>");
  res.write("</nav>");
  if (req.session.user !== "admin") {
    res.write(`<div class="text-center space-y-4">
              <h1 class="text-7xl font-extralight text-white tracking-tight">Administration</h1>
              <h1 class="text-4xl font-extrabold text-red-400">
                You do not have permission to view this page.
              </h1>
              ${
                req.session.authenticated
                  ? `
                <p class="text-lg text-slate-300">You are logged in as <strong>${req.session.user}</strong></p>
                <p class="text-lg text-slate-300">Please log in as an admin to view this page.</p>
              `
                  : `
              <p class="text-lg text-slate-300">Please log in as an admin to view this page.</p>
              `
              }
          </div>
          <div class="flex justify-center">
              <form action="/login" method="get">
                  <button class="btn">
                      Login &rarr;
                  </button>
              </form>
          </div>
          `);
    res.end();
    return;
  }

  // Getting order id
  res.write(`
    <h1 class="text-3xl text-center p-4">Process Order</h1>
        <div class="flex-col w-1/3 bg-red-400 justify-center">
            <form action="/ship" method="get">
                <input type="number" name="orderId" placeholder="Order ID" 
                class="t200e text-center w-8 p-1 forms text-white outline-none focus:bg-gray-600 focus:border-slate-900 t200e" required>
                <button type="submit" class="btn">Process Order</button>
            </form>
        </div>
     `);

  // Starting transaction
  if (req.query.orderId) {
    (async function () {
      try {
        let pool = await sql.connect(dbConfig);

        // Checking if valid order id
        let sqlQuery = `
                SELECT 
                    p.productName, 
                    op.productId, 
                    op.quantity AS orderedQuantity, 
                    SUM(pi.quantity) AS totalAvailableQuantity 
                FROM orderproduct op
                JOIN product p ON op.productId = p.productId
                JOIN productinventory pi ON p.productId = pi.productId
                WHERE op.orderId = @orderId
                AND pi.warehouseId = 1
                GROUP BY p.productName, op.productId, op.quantity;
              `;

        const result = await pool
          .request()
          .input("orderId", sql.Int, req.query.orderId)
          .query(sqlQuery);

        if (result.recordset.length === 0) {
          res.write(
            `<p>Invalid Order ID or no products found for the order ${orderId}.</p>
                    <a href="/ship">Try again</a>
             `
          );
          res.end();
          return;
        }

        let sufficientInventory = true;

        // Display table of order details
        res.write("<h2>Order Details</h2>");
        res.write('<table class="self-center">');
        res.write(`
                <tr>
                  <th>Product Name</th>
                  <th>Product ID</th>
                  <th>Ordered Quantity</th>
                  <th>Previous Inventory</th>
                  <th>New Inventory</th>
                  <th>Status</th>
                </tr>
              `);

        // Process each product in the order
        let newInventories = [];
        let productIds = [];
        for (let row of result.recordset) {
          const newInventory = row.totalAvailableQuantity - row.orderedQuantity;

          let status;
          if (newInventory < 0) {
            status = "Unavailable";
            sufficientInventory = false;
          } else {
            status = "Available";
          }
          newInventories.push(newInventory);
          productIds.push(row.productId);
          res.write(`
                  <tr>
                    <td>${row.productName}</td>
                    <td>${row.productId}</td>
                    <td>${row.orderedQuantity}</td>
                    <td>${row.totalAvailableQuantity}</td>
                    <td>${newInventory >= 0 ? newInventory : "N/A"}</td>
                    <td>${status}</td>
                  </tr>
                `);
        }

        res.write("</table>");

        // Display overall shipment status
        if (!sufficientInventory) {
          res.write(
            '<p class="text-2xl p-8 text-red-500">Shipment not fulfilled due to insufficient inventory.</p>'
          );
        } else {
          // Create a new shipment record
          sqlQuery = `
                INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId)
                VALUES (GETDATE(), 'Shipment for order @orderId', 1);
              `;
          await pool
            .request()
            .input("orderId", sql.Int, req.query.orderId)
            .query(sqlQuery);

          // Update inventory
          sqlQuery = `
        UPDATE productinventory 
        SET quantity = @newInventory
        WHERE productId = @productId
        AND warehouseId = 1;
        `;
          for (let i = 0; i < newInventories.length; i++) {
            await pool
              .request()
              .input("newInventory", sql.Int, newInventories[i])
              .input("productId", sql.Int, productIds[i])
              .query(sqlQuery);
          }
          newInventories = []; // Reset new inventories
          productIds = []; // Reset product IDs
          res.write(
            '<p class="text-2xl p-8 text-green-500">Shipment fulfilled successfully.</p>'
          );
        }
        res.write("</body>");
        res.end();
      } catch (err) {
        console.error(err);
        res.write(`<p>Invalid entry, please try again. </p> ${err}`);
        res.end();
      }
    })();
  } else {
    res.end(); // End response if no Order ID is provided
  }
});

module.exports = router;
