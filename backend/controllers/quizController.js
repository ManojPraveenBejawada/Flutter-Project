const db = require('../db');
const { v4: uuidv4 } = require('uuid'); // Used for generating unique certificate codes

/**
 * Creates a new quiz and links it to a specific training material.
 * Only one quiz can exist per material.
 */
exports.createQuiz = async (req, res) => {
    const { material_id, title } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO quizzes (material_id, title) VALUES (?, ?)',
            [material_id, title]
        );
        res.status(201).json({ message: 'Quiz created successfully', quizId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A quiz already exists for this material.' });
        }
        console.error("Error creating quiz:", error); // Keep essential error log
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
};

/**
 * Adds a single question along with its multiple-choice options to a quiz.
 * Uses a transaction for data integrity.
 */
exports.addQuestion = async (req, res) => {
    const { quizId } = req.params;
    const { question_text, options } = req.body;

    if (!question_text || !options || !Array.isArray(options) || options.length < 2 || !options.some(opt => opt.is_correct)) {
        return res.status(400).json({ message: 'Invalid question data. Requires text, at least two options, and one correct answer.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [questionResult] = await connection.query(
            'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)',
            [quizId, question_text]
        );
        const questionId = questionResult.insertId;

        const optionValues = options.map(opt => [
            questionId,
            opt.option_text,
            opt.is_correct === true || opt.is_correct === 'true' || opt.is_correct === 1
        ]);

        await connection.query(
            'INSERT INTO options (question_id, option_text, is_correct) VALUES ?',
            [optionValues]
        );

        await connection.commit();
        res.status(201).json({ message: 'Question added successfully', questionId });
    } catch (error) {
        await connection.rollback();
        console.error("Error adding question:", error); // Keep essential error log
        res.status(500).json({ message: 'Error adding question', error: error.message });
    } finally {
        connection.release();
    }
};

/**
 * Deletes a question from a quiz. Associated options are deleted via database cascade.
 */
exports.deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    try {
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [questionId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Question deleted successfully' });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error("Error deleting question:", error); // Keep essential error log
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
};

/**
 * Fetches quiz details for a material ID, including the specific user's attempt history.
 * Requires user_id as a query parameter.
 */
exports.getQuizByMaterialId = async (req, res) => {
    const { materialId } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
        // Removed console.log here
        return res.status(400).json({ message: "User ID is required to fetch quiz status." });
    }

    try {
        // Removed console.log here
        const [quizzes] = await db.query('SELECT * FROM quizzes WHERE material_id = ?', [materialId]);
        // Removed console.log here

        if (quizzes.length > 0) {
            const quiz = quizzes[0];
            // Removed console.log here

            // Removed console.log here
            const [attempts] = await db.query(
                'SELECT score, total_questions, passed, attempted_at FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY attempted_at DESC',
                [user_id, quiz.id]
            );
            // Removed console.log here

            const hasPassed = attempts.some(attempt => attempt.passed === 1 || attempt.passed === true);
            const attemptsMade = attempts.length;
            const attemptsRemaining = Math.max(0, 3 - attemptsMade);

            const responseData = {
                ...quiz,
                attempts,
                hasPassed,
                attemptsRemaining,
                attemptsMade,
            };
            // Removed console.log here
            res.json(responseData);

        } else {
            // Removed console.log here
            res.status(404).json({ message: 'Quiz not found for this material' });
        }
    } catch (error) {
        console.error("Error inside getQuizByMaterialId:", error); // Keep essential error log
        res.status(500).json({ message: 'Error fetching quiz details', error: error.message });
    }
    // Removed console.log here
};


/**
 * Fetches all questions for a quiz, excluding the 'is_correct' flag for options.
 */
exports.getQuestionsForQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
        const [questions] = await db.query('SELECT id, question_text FROM questions WHERE quiz_id = ?', [quizId]);

        if (questions.length === 0) {
            return res.json([]);
        }

        const optionPromises = questions.map(question =>
            db.query('SELECT id, option_text FROM options WHERE question_id = ?', [question.id])
        );
        const optionsResults = await Promise.all(optionPromises);

        questions.forEach((question, index) => {
            question.options = optionsResults[index][0];
        });

        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error); // Keep essential error log
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

/**
 * Processes a user's quiz submission, checks attempts, calculates score, determines pass status,
 * records the attempt, and generates/records a certificate if passed.
 */
exports.submitQuiz = async (req, res) => {
    const { quiz_id, user_id, answers } = req.body;

    if (!quiz_id || !user_id || !answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
        return res.status(400).json({ message: 'Missing required quiz ID, user ID, or valid answers.' });
    }

    try {
        const [attemptStatus] = await db.query(
            'SELECT COUNT(id) as attempt_count, MAX(passed) as already_passed FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
            [user_id, quiz_id]
        );
        const attemptsMade = attemptStatus[0].attempt_count;
        const alreadyPassed = attemptStatus[0].already_passed === 1 || attemptStatus[0].already_passed === true;

        if (alreadyPassed) {
             return res.status(403).json({ message: "You have already passed this quiz." });
        }
        if (attemptsMade >= 3) {
            return res.status(403).json({ message: "You have no more attempts for this quiz." });
        }

        const questionIds = Object.keys(answers).map(id => parseInt(id)).filter(id => !isNaN(id));
        if (questionIds.length === 0) {
            return res.status(400).json({ message: 'No valid answers submitted.' });
        }

        const [correctOptions] = await db.query(
            `SELECT id, question_id FROM options WHERE is_correct = TRUE AND question_id IN (?)`,
            [questionIds]
        );
        const correctOptionsMap = new Map(correctOptions.map(opt => [opt.question_id, opt.id]));

        let score = 0;
        let totalQuestionsAnswered = 0;
        for (const questionIdStr in answers) {
            const questionId = parseInt(questionIdStr);
            if (isNaN(questionId)) continue;
            totalQuestionsAnswered++;
            const userOptionId = parseInt(answers[questionIdStr]);
            const correctOptionId = correctOptionsMap.get(questionId);
            if (!isNaN(userOptionId) && userOptionId === correctOptionId) {
                score++;
            }
        }

        const totalQuestionsInQuiz = totalQuestionsAnswered;
        const percentage = totalQuestionsInQuiz > 0 ? (score / totalQuestionsInQuiz) * 100 : 0;
        const passed = percentage >= 75;

        await db.query(
            'INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, passed) VALUES (?, ?, ?, ?, ?)',
            [user_id, quiz_id, score, totalQuestionsInQuiz, passed]
        );

        let certificate = null;
        if (passed) {
            try {
                const [materialInfo] = await db.query(`SELECT tm.course_id FROM quizzes q JOIN training_materials tm ON q.material_id = tm.id WHERE q.id = ?`, [quiz_id]);
                if (materialInfo.length > 0) {
                    const course_id = materialInfo[0].course_id;
                    const certificate_code = uuidv4();
                    await db.query(
                        'INSERT IGNORE INTO certifications (user_id, course_id, quiz_id, certificate_code) VALUES (?, ?, ?, ?)',
                        [user_id, course_id, quiz_id, certificate_code]
                    );
                    const [existingCert] = await db.query('SELECT certificate_code FROM certifications WHERE user_id = ? AND quiz_id = ?', [user_id, quiz_id]);
                    if (existingCert.length > 0) {
                       certificate = { code: existingCert[0].certificate_code };
                    } else {
                         console.error(`Certificate record inconsistency for user ${user_id}, quiz ${quiz_id}`);
                    }
                } else {
                    console.error(`Could not find course_id linked to quiz_id ${quiz_id}`);
                }
            } catch (certError) {
                console.error("Error during certificate generation/saving:", certError); // Keep essential error log
            }
        }

        res.json({
            message: 'Quiz submitted successfully!',
            score,
            totalQuestions: totalQuestionsInQuiz,
            passed,
            certificate
        });

    } catch (error) {
        console.error("Error submitting quiz:", error); // Keep essential error log
        res.status(500).json({ message: 'An unexpected error occurred while submitting the quiz.', error: error.message });
    }
};

