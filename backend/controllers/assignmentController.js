const db = require('../db');

// --- Admin: Get all registered users ---
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email FROM users ORDER BY name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// --- Get courses assigned to a specific user ---
exports.getAssignedCourses = async (req, res) => {
    const { userId } = req.params;
    try {
        const [assignments] = await db.query(
            `SELECT c.id, c.title, c.description 
             FROM courses c
             JOIN assignments a ON c.id = a.course_id
             WHERE a.user_id = ?`,
            [userId]
        );
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assigned courses', error });
    }
};

// --- Admin: Assign a course to a user ---
exports.assignCourseToUser = async (req, res) => {
    const { user_id, course_id } = req.body;
    try {
        await db.query(
            'INSERT INTO assignments (user_id, course_id) VALUES (?, ?)',
            [user_id, course_id]
        );
        res.status(201).json({ message: 'Course assigned successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This course is already assigned to the user.' });
        }
        res.status(500).json({ message: 'Error assigning course', error });
    }
};

// --- Admin: Unassign a course from a user ---
exports.unassignCourseFromUser = async (req, res) => {
    const { user_id, course_id } = req.body;
    try {
        await db.query(
            'DELETE FROM assignments WHERE user_id = ? AND course_id = ?',
            [user_id, course_id]
        );
        res.status(200).json({ message: 'Course unassigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error unassigning course', error });
    }
};
