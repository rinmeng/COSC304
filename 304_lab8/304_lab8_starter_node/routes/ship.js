const express = require("express");
const router = express.Router();
const sql = require("mssql");

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "text/html");
  res.write('<link href="/style.css" rel="stylesheet">');
  res.write('<body class="text-white bg-slate-600">');

  // Navigation
  res.write(`
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

  // Authorization check for admin
  if (req.session.user !== "admin") {
    res.write(`
        <div class="text-center mp5 opacity-0 animate-fade-in-instant">
          <!-- Header Section -->
          <div class="text-center space-y-4">
              <h1 class="text-7xl font-extralight text-white tracking-tight">Administration</h1>
              <h1 class="text-4xl font-extrabold text-red-400">
                You do not have permission to view this page.
              </h1>
              ${req.session.authenticated ? `
                <p class="text-lg text-slate-300">You are logged in as <strong>${req.session.user}</strong></p>
                <p class="text-lg text-slate-300">Please log in as an admin to view this page.</p>
              ` : `
              <p class="text-lg text-slate-300">Please log in as an admin to view this page.</p>
              `}
          </div>
          
          <!-- Login Button -->
          <div class="flex justify-center">
              <form action="/login" method="get">
                  <button class="btn">
                      Login &rarr;
                  </button>
              </form>
          </div>
        </div>
        `)
    return; // End the response here
  } else {
    // Display "Process Order" form (only if user is admin)
    res.write(`
    <main class="container mx-auto p-8">
      <h1 class="title text-center my-5">Process Order</h1>
      <div class="flex justify-center items-center m-auto w-1/2 glass-slate rounded-xl ">
        <form action="/ship" method="get" 
        class="flex flex-col p-6 rounded-lg w-full">
            <input 
              type="text" 
              name="orderId" 
              placeholder="Order ID" 
              class="inner-forms text-center text-white"
              required
            />
          <button type="submit" class="btn-green">
            Process Order &rarr;
          </button>
        </form>
      </div>
  `);

    // Transaction logic
    if (req.query.orderId) {
      (async function () {
        try {
          let pool = await sql.connect(dbConfig);

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
            res.write(`
            <div class="text-center mt-8 text-red-400">
              <p>Invalid Order ID or no products found for the order ${req.query.orderId}.</p>
              <a href="/ship" class="text-blue-400 hover:underline">Try again</a>
            </div>
          `);
            res.end();
            return;
          }

          let sufficientInventory = true;

          // Display order details
          res.write(`
          <section class="mt-8">
            <h2 class="text-2xl font-semibold">Order Details</h2>
            <table class="table-auto w-full mt-4 border-collapse border border-gray-700">
              <thead>
                <tr class="bg-gray-700 text-white">
                  <th class="p-3 border border-gray-600">Product Name</th>
                  <th class="p-3 border border-gray-600">Product ID</th>
                  <th class="p-3 border border-gray-600">Ordered Quantity</th>
                  <th class="p-3 border border-gray-600">Previous Inventory</th>
                  <th class="p-3 border border-gray-600">New Inventory</th>
                  <th class="p-3 border border-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
        `);

          let newInventories = [];
          let productIds = [];
          for (let row of result.recordset) {
            const newInventory = row.totalAvailableQuantity - row.orderedQuantity;
            const status = newInventory < 0 ? "Unavailable" : "Available";
            if (newInventory < 0) sufficientInventory = false;

            newInventories.push(newInventory);
            productIds.push(row.productId);

            res.write(`
            <tr class="text-center border border-gray-600">
              <td class="p-3">${row.productName}</td>
              <td class="p-3">${row.productId}</td>
              <td class="p-3">${row.orderedQuantity}</td>
              <td class="p-3">${row.totalAvailableQuantity}</td>
              <td class="p-3">${newInventory >= 0 ? newInventory : "N/A"}</td>
              <td class="p-3 text-${status === "Unavailable" ? "red" : "green"}-500">${status}</td>
            </tr>
          `);
          }

          res.write("</tbody></table></section>");

          // Shipment Status
          if (!sufficientInventory) {
            res.write(`
            <p class="text-center mt-8 text-red-500 text-2xl">
              Shipment not fulfilled due to insufficient inventory.
            </p>
          `);
          } else {
            await pool.request()
              .input("orderId", sql.Int, req.query.orderId)
              .query(`
              INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId)
              VALUES (GETDATE(), 'Shipment for order @orderId', 1);
            `);

            const updateInventoryQuery = `
            UPDATE productinventory 
            SET quantity = @newInventory
            WHERE productId = @productId
            AND warehouseId = 1;
          `;

            for (let i = 0; i < newInventories.length; i++) {
              await pool.request()
                .input("newInventory", sql.Int, newInventories[i])
                .input("productId", sql.Int, productIds[i])
                .query(updateInventoryQuery);
            }

            res.write(`
            <p class="text-center mt-8 text-green-500 text-2xl">
              Shipment fulfilled successfully.
            </p>
          `);
          }

          res.write("</main></body>");
          res.end();
        } catch (err) {
          console.error(err);
          res.write(`<p>Error occurred: ${err.message}</p>`);
          res.end();
        }
      })();
    } else {
      res.write("</main></body>");
      res.end();
    }
  }
});

module.exports = router;
