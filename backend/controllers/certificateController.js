const db = require('../db');

// --- Get certificate for a user and quiz ---
exports.getCertificate = async (req, res) => {
    const { userId, quizId } = req.params;
    try {
        const [certificates] = await db.query(
            `SELECT c.*, u.name as user_name, co.title as course_title, q.title as quiz_title
             FROM certifications c
             JOIN users u ON c.user_id = u.id
             JOIN quizzes q ON c.quiz_id = q.id
             JOIN training_materials tm ON q.material_id = tm.id
             JOIN courses co ON tm.course_id = co.id
             WHERE c.user_id = ? AND c.quiz_id = ?`,
            [userId, quizId]
        );

        if (certificates.length > 0) {
            res.json(certificates[0]);
        } else {
            res.status(404).json({ message: 'Certificate not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching certificate', error });
    }
};
