const db = require('../db');

// @desc    Get all courses
// @route   GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.status(200).json(courses);
  } catch (err) {
    console.error('SERVER ERROR getting courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide a title and description.' });
    }
    const newCourse = { title, description };
    const [result] = await db.query('INSERT INTO courses SET ?', newCourse);
    const [createdCourse] = await db.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
    res.status(201).json(createdCourse[0]);
  } catch (err) {
    console.error('SERVER ERROR creating course:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide a title and description.' });
    }
    const updatedCourse = { title, description };
    await db.query('UPDATE courses SET ? WHERE id = ?', [updatedCourse, id]);
    res.status(200).json({ id, ...updatedCourse });
  } catch (err) {
    console.error('SERVER ERROR updating course:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM courses WHERE id = ?', [id]);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('SERVER ERROR deleting course:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

