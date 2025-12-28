import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';

function QuizManager({ material, onBack }) {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for adding a new question
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newOptions, setNewOptions] = useState([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);

    // --- Wrap fetchQuizData in useCallback ---
    // It depends on `material.id`, so add that to useCallback's dependency array.
    const fetchQuizData = useCallback(async () => {
        // Check if material.id is valid before proceeding
        if (!material || !material.id) {
            setIsLoading(false);
            setError("Material data is missing.");
            return; // Exit if no valid material id
        }

        setIsLoading(true);
        setError('');
        try {
            const quizRes = await axios.get(`http://localhost:5000/api/quizzes/material/${material.id}?user_id=1`);
            setQuiz(quizRes.data);

            if (quizRes.data && quizRes.data.id) {
                const questionsRes = await axios.get(`http://localhost:5000/api/quizzes/${quizRes.data.id}/questions`);
                setQuestions(questionsRes.data);
            } else {
                 setQuiz(null);
                 setQuestions([]);
            }
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            if (error.response && error.response.status === 404) {
                setQuiz(null);
                setQuestions([]);
                setError('');
            } else {
                setError('Failed to fetch quiz data. ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsLoading(false);
        }
    }, [material.id]); // <-- Dependency for useCallback

    // --- Update useEffect dependency array ---
    // Now include fetchQuizData in the dependency array.
    useEffect(() => {
        fetchQuizData();
    }, [fetchQuizData]); // <-- Correct dependency

    // --- Handlers for Adding Questions/Options ---
    // (Rest of the handlers remain the same)
    const handleNewQuestionChange = (e) => {
        setNewQuestionText(e.target.value);
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...newOptions];
        updatedOptions[index].option_text = value;
        setNewOptions(updatedOptions);
    };

    const handleCorrectOptionChange = (index) => {
        const updatedOptions = newOptions.map((opt, i) => ({
            ...opt,
            is_correct: i === index,
        }));
        setNewOptions(updatedOptions);
    };

    const addOption = () => {
        setNewOptions([...newOptions, { option_text: '', is_correct: false }]);
    };

    const removeOption = (index) => {
        if (newOptions.length <= 2) return;
        const updatedOptions = newOptions.filter((_, i) => i !== index);
        if (!updatedOptions.some(opt => opt.is_correct) && updatedOptions.length > 0) {
            updatedOptions[0].is_correct = true;
        }
        setNewOptions(updatedOptions);
    };

     const resetNewQuestionForm = () => {
        setNewQuestionText('');
        setNewOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
    };


    // --- API Call Handlers ---
    // (These handlers remain the same)
    const handleCreateQuiz = async () => {
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/quizzes', {
                material_id: material.id,
                title: `${material.original_name} Quiz`
            });
            setQuiz({ id: res.data.quizId, title: `${material.original_name} Quiz`, material_id: material.id });
        } catch (error) {
            console.error('Error creating quiz:', error);
            setError(error.response?.data?.message || 'Failed to create quiz.');
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        setError('');
        if (!quiz) return;

        if (!newQuestionText.trim()) return alert("Question text cannot be empty.");
        if (newOptions.some(opt => !opt.option_text.trim())) return alert("Option text cannot be empty.");
        if (!newOptions.some(opt => opt.is_correct)) return alert("Please mark one option as correct.");
        if (newOptions.length < 2) return alert("You must provide at least two options.");


        try {
            await axios.post(`http://localhost:5000/api/quizzes/${quiz.id}/questions`, {
                question_text: newQuestionText,
                options: newOptions
            });
            fetchQuizData(); // Refresh questions list
            resetNewQuestionForm();
        } catch (error) {
            console.error('Error adding question:', error);
            setError(error.response?.data?.message || 'Failed to add question.');
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        setError('');
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/quizzes/questions/${questionId}`);
            fetchQuizData(); // Refresh questions list
        } catch (error) {
            console.error('Error deleting question:', error);
            setError(error.response?.data?.message || 'Failed to delete question.');
        }
    };

    // --- Render Logic ---
    // (Render logic remains the same)
    if (isLoading) {
        return <div className="placeholder">Loading quiz data...</div>;
    }

    return (
        <div className="quiz-manager">
            <button onClick={onBack} className="back-button">← Back to Materials</button>
            <h2>Manage Quiz for "{material.original_name}"</h2>

             {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}

            {!quiz ? (
                <div>
                    <p>No quiz found for this material.</p>
                    <button onClick={handleCreateQuiz}>Create Quiz</button>
                </div>
            ) : (
                <div>
                    <h3>{quiz.title} (Quiz ID: {quiz.id})</h3>

                    <form onSubmit={handleAddQuestion} className="add-question-form">
                        <h4>Add New Question</h4>
                        <textarea
                            placeholder="Question Text"
                            value={newQuestionText}
                            onChange={handleNewQuestionChange}
                            required
                            rows={3}
                        />
                        <h5>Options (Mark one as correct):</h5>
                        {newOptions.map((opt, index) => (
                            <div key={index} className="option-input">
                                <input
                                    type="radio"
                                    name={`correctOption_${quiz.id}`}
                                    checked={opt.is_correct}
                                    onChange={() => handleCorrectOptionChange(index)}
                                    title="Mark as correct"
                                />
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={opt.option_text}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    required
                                />
                                {newOptions.length > 2 && (
                                     <button type="button" onClick={() => removeOption(index)} className="remove-option-btn" title="Remove Option">X</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="add-option-btn">+ Add Option</button>
                        <button type="submit" style={{marginTop: '15px', width: '100%'}}>Add Question to Quiz</button>
                    </form>

                    <h4>Existing Questions</h4>
                    {questions.length > 0 ? (
                        <div className="questions-list">
                            {questions.map((q, index) => (
                                <div key={q.id} className="question-item" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                                    <p><strong>Q{index + 1}: {q.question_text}</strong></p>
                                    <ul>
                                        {q.options && q.options.map(opt => (
                                            <li key={opt.id}>{opt.option_text}</li>
                                        ))}
                                    </ul>
                                     <button onClick={() => handleDeleteQuestion(q.id)} className="delete-btn">Delete Question</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No questions added to this quiz yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuizManager;

