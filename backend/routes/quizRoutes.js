const express = require('express');
const router = express.Router();
// --- Step 1: Uncomment the controller import ---
const quizController = require('../controllers/quizController');

console.log('--- quizRoutes.js file loaded (Full Version) ---'); // Log confirmation

// --- Step 2: Uncomment all the necessary routes ---

// --- Admin Routes ---
// POST /api/quizzes - Create a new quiz for a material
router.post('/', quizController.createQuiz);
// POST /api/quizzes/:quizId/questions - Add a question with options
router.post('/:quizId/questions', quizController.addQuestion);
// DELETE /api/quizzes/questions/:questionId - Delete a specific question
router.delete('/questions/:questionId', quizController.deleteQuestion);

// --- Shared Routes ---
// GET /api/quizzes/material/:materialId - Get quiz details for a material (requires user_id query param)
router.get('/material/:materialId', quizController.getQuizByMaterialId);
// GET /api/quizzes/:quizId/questions - Get all questions (without answers) for a specific quiz
router.get('/:quizId/questions', quizController.getQuestionsForQuiz);

// --- User Routes ---
// POST /api/quizzes/submit - Submit user's answers and get results
router.post('/submit', quizController.submitQuiz);

// Ensure the router is exported correctly
module.exports = router;

