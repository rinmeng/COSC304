const express = require('express');
const router = express.Router();

// Logout route (had to edit to destroy cookies because otherwise it would not work)
router.get('/', function (req, res, next) {
    // Destroy the session or clear the relevant session data
    req.session.destroy(function (err) {
        if (err) {
            return next(err);  // If there's an error destroying the session, pass it to the next middleware
        }

        // Redirect to the home page (or login page, depending on your preference)
        res.redirect('/');  // Redirecting to home page after logging out
    });
});

module.exports = router;
