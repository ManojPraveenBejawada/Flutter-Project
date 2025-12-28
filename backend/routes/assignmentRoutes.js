const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Get all users (for the admin to see who to assign courses to)
router.get('/users', assignmentController.getAllUsers);

// Get courses assigned to a specific user
router.get('/user/:userId', assignmentController.getAssignedCourses);

// Assign a course to a user
router.post('/', assignmentController.assignCourseToUser);

// Unassign a course from a user
router.delete('/', assignmentController.unassignCourseFromUser);

module.exports = router;
