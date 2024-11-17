const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session')

let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');

const app = express();

app.use(express.static('public'));

// This DB Config is accessible globally
// TODO: THIS GIVES US AN ERROR WHEN VISITING localhost:3000/loaddata gives us this error
// ConnectionError: Failed to connect to cosc304_sqlserver:1433 - getaddrinfo ENOTFOUND cosc304_sqlserver
// CHECK loaddata.js for more info 
dbConfig = {
  server: 'cosc304_sqlserver',
  database: 'orders',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: '304#sa#pw'
    }
  },
  options: {
    encrypt: false,
    enableArithAbort: false,
    database: 'orders'
  }
}

// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 60000,
  }
}))

// Setting up the rendering engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);

// Rendering the main page
app.get('/', function (req, res) {
  res.render('index', {
    title: "PC8th"
  });
})

// Starting our Express app
app.listen(3000)