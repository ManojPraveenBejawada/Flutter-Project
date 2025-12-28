const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

console.log('--- adminRoutes.js file loaded ---'); // Log when file is loaded

// Add a log within the route definition
router.post('/login', (req, res, next) => {
    console.log('--- Reached POST /login handler in adminRoutes.js ---');
    next(); // Pass control to the actual controller function
} , adminController.loginAdmin);

module.exports = router;

