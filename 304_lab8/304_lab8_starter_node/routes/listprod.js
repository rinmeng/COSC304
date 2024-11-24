const express = require('express');
const router = express.Router();
const sql = require('mssql');



router.get('/', function (req, res, next) {

  res.setHeader('Content-Type', 'text/html');
  res.write("<title>PC8th Parts</title>");
  res.write('<link href="/style.css" rel="stylesheet">');
  res.write('<body class="text-white text-center bg-slate-600 ">');

  (async function () {
    try {
      console.log("Connecting to the database...");
      let pool = await sql.connect(dbConfig);

      // Get the search term from query parameters, this way we don't need to call another function
      // For example, if the URL is http://yoursite.com/?search=mouse, then req.query.search would be "mouse"
      // If no search parameter exists in the URL, req.query.search would be undefined  
      const searchTerm = req.query.search || '';

      let sqlQuery = `
        SELECT p.productId, p.productName, p.productPrice, p.productDesc, c.categoryName 
        FROM product p 
        JOIN category c ON p.categoryId = c.categoryId
        ${searchTerm ? "WHERE p.productName LIKE @searchTerm" : ""}
        ORDER BY c.categoryName, p.productName
      `;

      let request = pool.request();
      // Prevent SQL Injection
      if (searchTerm) {
        request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
      }
      let results = await request.query(sqlQuery);


      res.write(`<nav class="z-10 w-full flex justify-around items-center bg-slate-700 p-5 text-2xl ">
    <!-- Logo -->
    <a class="opacity-100 p-3 hover:opacity-100 t200e text-6xl w-3/4" href="/">PC8th</a>

    <!-- Navigation Links -->
    <div class="flex justify-center w-full">
        <!-- Product List -->
        <a href="/listprod" class="relative group p-3">
            <div class="opacity-100 group-hover:opacity-100 t200e">Product List</div>
            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-50 group-hover:scale-x-100 t200e">
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
    <div>
        <a class="opacity-50 p-3 hover:opacity-100 t200e px-10" href="/login">Login</a>
    </div>
</nav>`);
      res.write("<div class='opacity-0 animate-fade-in-instant'>");

      res.write("<h2 class='text-7xl my-5 font-light'>Product List</h2>");

      // We don't need to call another function to get the search term, we can just use the query parameter
      res.write(`
        <form method="get" class="my-6">
          <input class='forms w-1/4 text-white outline-none focus:bg-slate-700 focus:border-slate-900 t200e' type="text" name="search" 
            placeholder="Search for PC parts" 
            value="${searchTerm}"
          >
          <button class='btn mx-2' type="submit">Search</button>
          <a href="/listprod" class='btn-red mx-2'>Reset</a>
        </form>
      `);

      // Show search results count if there is a search term
      if (searchTerm) {
        res.write(`
          <div class="text-slate-300 mb-4">
            Found ${results.recordset.length} product${results.recordset.length !== 1 ? 's' : ''} 
            matching "${searchTerm}"
          </div>
        `);
      } else {
        res.write(`
          <div class="text-slate-300 mb-4">
            There are ${results.recordset.length} product${results.recordset.length !== 1 ? 's' : ''} 
            in the store.
          </div>
        `);
      }

      // Container for the grid
      res.write(`
        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-4 gap-4 mb-4 bg-slate-800 p-4 rounded-lg font-bold">
            <div>Category</div>
            <div>Product Name</div>
            <div>Price</div>
            <div>Add to Cart</div>
          </div>
          
          <!-- Grid Body -->
          <div class="space-y-2">
      `);

      // Group products by category for better organization
      let currentCategory = '';

      for (let product of results.recordset) {
        if (currentCategory !== product.categoryName) {
          currentCategory = product.categoryName;
          res.write(`
            <div class="text-left text-xl font-semibold mt-6 mb-2 text-slate-300">
              ${currentCategory}
            </div>
          `);
        }
        const addToCartUrl = `/addcart?id=${encodeURIComponent(product.productId)}&name=${encodeURIComponent(product.productName)}&price=${encodeURIComponent(product.productPrice)}`;

        res.write(`
          <div class="grid grid-cols-4 gap-4 items-center bg-slate-700 p-4 rounded-lg hover:bg-slate-800 t200e">
            <div class="text-left text-slate-300">${product.categoryName}</div>
            <div class="text-left">
              <div class="font-medium">
                <a class="text-blue-400 hover:underline flex" href="/product?id=${encodeURIComponent(product.productId)}">
                ${product.productName}

                <img class="w-3 h-3 ml-1" src="/img/newtab.png">
                </a>
              </div>
              <div class="text-sm text-slate-300">${product.productDesc.substring(0, 50)}${product.productDesc.length > 50 ? '...' : ''}</div>
            </div>
            <div class="text-green-400 font-medium">$${product.productPrice.toFixed(2)}</div>

            <div>
              <a href='${addToCartUrl}' class="btn">
                Add to Cart
              </a>
            </div>
          </div>
        `);
      }

      res.write(`
          </div>
        </div>
      `);

      res.write("</div>");
      res.write("</body>");
      res.end();
    } catch (err) {
      console.dir(err);
      res.write(`
        <div class="p-4 bg-red-500 text-white">
          <h3>Error: ${JSON.stringify(err)}</h3>
        </div>
      `);
      res.end();
    }
  })();
});

module.exports = router;