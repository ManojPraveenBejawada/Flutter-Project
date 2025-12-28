const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // Assuming db.js handles connection pool

// --- Step 1: Import ALL Route Handlers ---
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const materialRoutes = require('./routes/materialRoutes');
const quizRoutes = require('./routes/quizRoutes'); 
const assignmentRoutes = require('./routes/assignmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

// --- Step 2: Create Express App ---
const app = express();

// --- Step 3: Core Middleware ---
app.use(cors());         // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable JSON body parsing

// --- Step 4: Request Logger Middleware (Optional: for debugging) ---
// We can keep this minimal version to see traffic
app.use((req, res, next) => {
  console.log(`>>> ${req.method} ${req.originalUrl}`);
  next(); // Continue to the next middleware or route
});

// --- Step 5: Static File Serving ---
// Serve files from the 'uploads' directory under the '/uploads' URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Step 6: Root Route for Status Check ---
app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running successfully!" });
});

// --- Step 7: API Route Registration ---
// Make sure the base paths and the router variables match exactly
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);

// --- Step 8: Define Port and Start Server ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Optional: Check DB connection after server starts
  db.query('SELECT 1')
    .then(() => console.log('Database connection successful.'))
    .catch(err => console.error('Database connection failed:', err));
});

