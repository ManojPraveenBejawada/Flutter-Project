const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

// Route for user registration
// POST /api/users/register
router.post('/register', registerUser);

// Route for user login
// POST /api/users/login
router.post('/login', loginUser);

module.exports = router;

