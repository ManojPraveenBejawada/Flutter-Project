const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Get certificate details for a specific quiz attempt by a user
router.get('/user/:userId/quiz/:quizId', certificateController.getCertificate);

module.exports = router;
