const express = require("express");
const router = express.Router();
const auth = require("../auth");
const sql = require("mssql");

router.get("/", function (req, res, next) {
  // TODO: Include files auth.jsp and jdbc.jsp

  res.setHeader("Content-Type", "text/html");
  res.write('<link href="/style.css" rel="stylesheet">');
  res.write(`<title>Admin Page</title>`);


  if (!(req.session.user === "admin")) {
    res.write(`
    <body class="bg-slate-600 h-screen">
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
    </body>   
    `);
    res.end();
    return;
  }

  (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      sqlQuery = `
            SELECT orderDate, SUM(totalAmount) as totalAmount
            FROM ordersummary
            GROUP BY orderDate
            ORDER BY orderDate
        `;

      let result = await pool.request().query(sqlQuery);
      res.write(`
          <body class="bg-slate-600 h-screen">
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
                    <p class="text-white px-3 w-full">Hey, <strong>${req.session.user}</strong></p>
                    <a href="/logout" class="opacity-50 p-3 hover:opacity-100 t200e px-10">Logout</a>
                ` : `
                    <a class="opacity-50 p-3 hover:opacity-100 t200e px-10" href="/login">Login</a>
                `}
            </div>
          </nav>
            <!-- Header -->
            <div class="container mx-auto px-4 py-12  opacity-0 animate-fade-in-instant">
              <div class="text-center mb-12">
                <h1 class="title mb-4">Sales Reports</h1>
                <p class="text-slate-300 text-xl">Daily Revenue Overview</p>
              </div>

              <!-- Grid Container -->
              <div class="max-w-6xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <!-- Grid Header -->
                <div class="grid grid-cols-2 gap-4 bg-slate-900 p-6 border-b border-slate-700">
                  <div class="text-lg font-semibold text-white px-6">
                  Order Date (DD-MM-YYYY)
                  </div>
                  <div class="text-lg font-semibold text-white px-6">
                  Total Amount
                  </div>
                </div>

                <!-- Grid Body -->
                <div class="divide-y divide-slate-700">
      `);

      for (let i = 0; i < result.recordset.length; i++) {
        let orderDate = new Date(result.recordset[i].orderDate);
        let day = ("0" + orderDate.getDate()).slice(-2);
        let month = ("0" + (orderDate.getMonth() + 1)).slice(-2);
        let year = orderDate.getFullYear();
        let formattedDate = `${day}-${month}-${year}`;

        res.write(`
          <div class="grid grid-cols-2 gap-4 p-6 hover:bg-slate-700 transition-colors duration-200">
            <div class="text-slate-300 px-6">${formattedDate}</div>
            <div class="text-slate-300 px-6">
              <span class="font-mono bg-slate-900 px-3 py-1 rounded">
                $${result.recordset[i].totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        `);
      }

      res.write(`
                </div>
              </div>

              <!-- Summary Card -->
              <div class="mt-8 text-center">
                <div class="inline-block bg-slate-800 rounded-lg p-6 shadow-lg">
                  <p class="text-slate-300 mb-2">Total Records</p>
                  <p class="text-3xl font-bold text-white">${result.recordset.length}</p>
                </div>
              </div>
            </div>
          </body>
      `);
      res.end();

      return;
    } catch (err) {
      console.dir(err);
      res.write(err + "");
      res.end();
    }
  })();
});

module.exports = router;