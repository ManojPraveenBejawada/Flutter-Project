// backend/routes/materialRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const materialController = require('../controllers/materialController');

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: './uploads/', // Ensure this 'uploads' folder exists in your backend directory
  filename: function (req, file, cb) {
    // Keep original extension, create unique filename
    cb(null, 'material-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable with Multer configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // Example: Limit file size to 100MB
  fileFilter: function (req, file, cb) {
    // Add any specific file type checks here if needed, e.g., only allow PDFs/videos
    cb(null, true); // Accept all files for now
  }
}).single('material'); // <<< This MUST match the name used in the frontend FormData ('material')

// Route to handle file uploads
router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      res.status(400).json({ message: 'Error during file upload', error: err.message });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ message: 'No file selected!' });
      } else {
        // If upload is successful, pass control to the controller to save to DB
        materialController.uploadMaterial(req, res);
      }
    }
  });
});


// Route to get all materials for a specific course
router.get('/course/:courseId', materialController.getMaterialsForCourse);

// Route to delete a specific material
router.delete('/:materialId', materialController.deleteMaterial);

module.exports = router;