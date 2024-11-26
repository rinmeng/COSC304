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
      let pool = await sql.connect(dbConfig);

      const searchTerm = req.query.search || '';
      const sortBy = req.query.sortBy || 'default';

      // Mapping sort options to SQL ORDER BY clauses
      const sortOptions = {
        'categoryAsc': 'c.categoryName ASC, p.productName ASC',
        'categoryDesc': 'c.categoryName DESC, p.productName DESC',
        'productNameAsc': 'p.productName ASC',
        'productNameDesc': 'p.productName DESC',
        'priceAsc': 'p.productPrice ASC',
        'priceDesc': 'p.productPrice DESC',
        'default': 'c.categoryName, p.productName'
      };

      // Determine the current sort order for each column
      const getCurrentSort = (currentSort) => {
        const sortMap = {
          'default': {
            category: 'categoryAsc',
            productName: 'productNameAsc',
            price: 'priceAsc'
          },
          'categoryAsc': { category: 'categoryDesc', productName: 'productNameAsc', price: 'priceAsc' },
          'categoryDesc': { category: 'default', productName: 'productNameAsc', price: 'priceAsc' },
          'productNameAsc': { category: 'categoryAsc', productName: 'productNameDesc', price: 'priceAsc' },
          'productNameDesc': { category: 'categoryAsc', productName: 'default', price: 'priceAsc' },
          'priceAsc': { category: 'categoryAsc', productName: 'productNameAsc', price: 'priceDesc' },
          'priceDesc': { category: 'categoryAsc', productName: 'productNameAsc', price: 'default' }
        };
        return sortMap[currentSort] || sortMap['default'];
      };

      const currentSorts = getCurrentSort(sortBy);

      let sqlQuery = `
        SELECT p.productId, p.productName, p.productPrice, p.productDesc, c.categoryName 
        FROM product p 
        JOIN category c ON p.categoryId = c.categoryId
        ${searchTerm ? "WHERE p.productName LIKE @searchTerm" : ""}
        ORDER BY ${sortOptions[sortBy]}
      `;

      let request = pool.request();
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
                            <div class="a
                            bsolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-50 group-hover:scale-x-100 t200e">
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

                    <!-- if login, show logout -->
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
                </nav>`);
      res.write("<div class='opacity-0 animate-fade-in-instant'>");

      res.write("<h2 class='title my-5'>Product List</h2>");

      res.write(`
        <form method="get" class="flex flex-col items-center justify-center space-y-6">
            <input class='forms w-1/3 text-white' type="text" name="search"
              placeholder="Search for PC parts"
              value="${searchTerm}"
            >
          <div>
            <button class='btn mx-2' type="submit">Search</button>
            <a href="/listprod" class='btn-red mx-2'>Reset</a>
          </div>
        </form>
      `);

      // Show search results count
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
            <div class="flex items-center">
              <a class="flex justify-center items-center" href="/listprod?sortBy=${currentSorts.category}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}">
                Category 
                ${sortBy === 'categoryAsc' ? '&uarr;' : ''}
                ${sortBy === 'categoryDesc' ? '&darr;' : ''}
                ${!['categoryAsc', 'categoryDesc'].includes(sortBy) ? '&darr;&uarr;' : ''}
              </a>
            </div>
            <div class="flex items-center">
              <a href="/listprod?sortBy=${currentSorts.productName}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}">
                Product Name
                ${sortBy === 'productNameAsc' ? '&uarr;' : ''}
                ${sortBy === 'productNameDesc' ? '&darr;' : ''}
                ${!['productNameAsc', 'productNameDesc'].includes(sortBy) ? '&darr;&uarr;' : ''}
              </a>
            </div>
            <div class="flex items-center justify-center">
              <a href="/listprod?sortBy=${currentSorts.price}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}">
                Price
                ${sortBy === 'priceAsc' ? '&uarr;' : ''}
                ${sortBy === 'priceDesc' ? '&darr;' : ''}
                ${!['priceAsc', 'priceDesc'].includes(sortBy) ? '&darr;&uarr;' : ''}
              </a>
            </div>
        <div>Add to Cart</div>
          </div>
          
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
        </div >
      `);

      res.write("</div>");
      res.write("</body>");
      res.end();
    } catch (err) {
      console.dir(err);
      res.write(`
      < div class= "p-4 bg-red-500 text-white" >
        <h3>Error: ${JSON.stringify(err)}</h3>
        </div >
      `);
      res.end();
    }
  })();
});

module.exports = router;