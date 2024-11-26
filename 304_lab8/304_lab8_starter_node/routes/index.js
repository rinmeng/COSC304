const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = false;

    // TODO: Display user name that is logged in (or nothing if not logged in)	
    res.render('index', {
        title: "PC8th Parts Store",
        username: req.session.user || null,
        // pass user id to the view
        userid: req.session.userid || null,
        // pass admin status to the view
        admin: req.session.user === "admin",
        // HINT: Look at the /views/index.handlebars file
        // to get an idea of how the index page is being rendered
    });
})

module.exports = router;
