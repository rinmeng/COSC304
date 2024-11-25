const express = require("express");
const router = express.Router();
const auth = require("../auth");
const sql = require("mssql");

router.get("/", function (req, res, next) {
  // TODO: Include files auth.jsp and jdbc.jsp

  res.setHeader("Content-Type", "text/html");
  res.write('<link href="/style.css" rel="stylesheet">');

  if (!req.session.authenticated) {
    res.write(`
    <body class="bg-slate-600">
        <div class="flex font-bold justify-center text-center p-8">
            <h1 class="text-5xl text-white">Administration</h1>
        </div>
        <div class="flex justify-center text-center m-10 p-10">
            <form action="/login" method="get">
                <button class="bg-slate-900 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
                    Login
                </button>
            </form>
        </div>  
    </body>    
    `);
    res.end();
    return;
}
  (async function () {
    try {
      let pool = await sql.connect(dbConfig);

      // TODO: Write SQL query that prints out total order amount by day
      sqlQuery = `
            SELECT orderDate, SUM(totalAmount) as totalAmount
            FROM ordersummary
            GROUP BY orderDate
            ORDER BY orderDate
        `;

      let result = await pool.request().query(sqlQuery);
      res.write(`
  <body class="bg-slate-600">
    <div class="flex font-bold justify-center text-center p-8">
      <h1 class="text-5xl text-white">Administration Sales Reports by Day</h1>
    </div>
    <div class="flex justify-center text-center m-10 p-10">
      <!-- Table with more width -->
      <table class="min-w-full max-w-7xl bg-white rounded-lg shadow-lg overflow-hidden">
        <thead>
          <tr class="bg-slate-900 text-white">
            <th class="px-10 py-6 text-lg font-semibold">Order Date</th>
            <th class="px-10 py-6 text-lg font-semibold">Total Amount</th>
          </tr>
        </thead>
        <tbody>
`);

      for (let i = 0; i < result.recordset.length; i++) {
        let orderDate = new Date(result.recordset[i].orderDate);

        // Format the date as DD-MM-YYYY
        let day = ("0" + orderDate.getDate()).slice(-2);
        let month = ("0" + (orderDate.getMonth() + 1)).slice(-2);
        let year = orderDate.getFullYear();
        let formattedDate = `${day}-${month}-${year}`;

        // Write each row with added styling
        res.write(`
    <tr class="border-b border-slate-400">
      <td class="px-10 py-6 text-sm text-slate-200 bg-slate-800">${formattedDate}</td>
      <td class="px-10 py-6 text-sm text-slate-200 bg-slate-800">$${result.recordset[i].totalAmount}</td>
    </tr>
  `);
      }

      res.write(`
        </tbody>
      </table>
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
