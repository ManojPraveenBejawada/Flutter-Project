import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QuizManager from './QuizManager';
import UserManagement from './UserManagement';

// AdminDashboard component receives 'onLogout' as a prop from App.js
function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'users'

    // States for courses
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditingCourse, setIsEditingCourse] = useState(null);
    const [courseFormData, setCourseFormData] = useState({ title: '', description: '' });

    // States for materials
    const [materials, setMaterials] = useState([]);
    const [materialFile, setMaterialFile] = useState(null);
    const fileInputRef = useRef(null);
    
    // State for quiz management
    const [managingQuizFor, setManagingQuizFor] = useState(null);

    // --- Course Functions ---
    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCourseSelect = async (course) => {
        setSelectedCourse(course);
        setManagingQuizFor(null); // Reset quiz view when selecting a new course
        if (course) {
            try {
                const res = await axios.get(`http://localhost:5000/api/materials/course/${course.id}`);
                setMaterials(res.data);
            } catch (error) {
                console.error('Error fetching materials:', error);
                setMaterials([]);
            }
        } else {
            setMaterials([]);
        }
    };

    const handleCourseFormChange = (e) => setCourseFormData({ ...courseFormData, [e.target.name]: e.target.value });

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditingCourse) {
                await axios.put(`http://localhost:5000/api/courses/${isEditingCourse.id}`, courseFormData);
            } else {
                await axios.post('http://localhost:5000/api/courses', courseFormData);
            }
            resetCourseForm();
            fetchCourses();
        } catch (error) { console.error('Error submitting course:', error); }
    };

    const handleEditCourse = (course) => {
        setIsEditingCourse(course);
        setCourseFormData({ title: course.title, description: course.description });
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure? This will delete all its materials and quizzes.')) {
            try {
                await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
                fetchCourses();
                if (selectedCourse && selectedCourse.id === courseId) {
                    setSelectedCourse(null);
                    setMaterials([]);
                }
            } catch (error) { console.error('Error deleting course:', error); }
        }
    };

    const resetCourseForm = () => {
        setIsEditingCourse(null);
        setCourseFormData({ title: '', description: '' });
    };

    // --- Material Functions ---
    const handleFileChange = (e) => setMaterialFile(e.target.files[0]);

    const handleMaterialUpload = async (e) => {
        e.preventDefault();
        if (!materialFile || !selectedCourse) return alert('Please select a course and a file.');
        const formData = new FormData();
        formData.append('material', materialFile);
        formData.append('course_id', selectedCourse.id);

        try {
            await axios.post('http://localhost:5000/api/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            handleCourseSelect(selectedCourse); // Refresh materials
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
            setMaterialFile(null);
        } catch (error) { console.error('Error uploading material:', error); }
    };
    
    const handleDeleteMaterial = async (materialId) => {
        if (window.confirm('Are you sure? This will delete its quiz.')) {
            try {
                await axios.delete(`http://localhost:5000/api/materials/${materialId}`);
                handleCourseSelect(selectedCourse); // Refresh materials
            } catch (error) { console.error('Error deleting material:', error); }
        }
    };
    
    // --- Render Logic ---

    // If we are managing a quiz, render only the QuizManager
    if (managingQuizFor) {
        return <QuizManager material={managingQuizFor} onBack={() => setManagingQuizFor(null)} />;
    }

    // Otherwise, render the main dashboard layout
    return (
        <div className="admin-dashboard">
            {/* Header section with title and Logout button */}
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>
            
            {/* Main content area with sidebar and content panel */}
            <div className="dashboard-content">
                <div className="sidebar">
                    {/* Tabs to switch between Course and User management */}
                    <div className="tabs">
                        <button onClick={() => setActiveTab('courses')} className={activeTab === 'courses' ? 'active' : ''}>Course Management</button>
                        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>User Management</button>
                    </div>

                    {/* Show Course Management content if 'courses' tab is active */}
                    {activeTab === 'courses' && (
                        <>
                            <h2>Courses</h2>
                            <div className="course-list">
                                {courses.map((course) => (
                                    <div key={course.id} className={`course-item ${selectedCourse?.id === course.id ? 'selected' : ''}`} onClick={() => handleCourseSelect(course)}>
                                    <span>{course.title}</span>
                                    <div className="course-actions">
                                            <button onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }} className="edit-btn">Edit</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="delete-btn">Delete</button>
                                    </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleCourseSubmit} className="course-form">
                                <h3>{isEditingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                                <input type="text" name="title" placeholder="Course Title" value={courseFormData.title} onChange={handleCourseFormChange} required />
                                <textarea name="description" placeholder="Course Description" value={courseFormData.description} onChange={handleCourseFormChange} required />
                                <button type="submit">{isEditingCourse ? 'Update Course' : 'Add Course'}</button>
                                {isEditingCourse && <button type="button" onClick={resetCourseForm}>Cancel Edit</button>}
                            </form>
                        </>
                    )}
                    
                    {/* Show User Management content if 'users' tab is active */}
                    {activeTab === 'users' && (
                        <UserManagement courses={courses} />
                    )}
                </div>

                <div className="main-content">
                    {/* Show Material Manager if 'courses' tab is active and a course is selected */}
                    {activeTab === 'courses' && (
                        selectedCourse ? (
                            <div className="course-manager">
                                <h2>Manage Materials for "{selectedCourse.title}"</h2>
                                <form onSubmit={handleMaterialUpload} className="material-form">
                                    <h3>Upload New Material</h3>
                                    <input type="file" onChange={handleFileChange} ref={fileInputRef} required />
                                    <button type="submit">Upload</button>
                                </form>
                                <div className="materials-list">
                                    <h3>Existing Materials</h3>
                                    {materials.length > 0 ? (
                                        materials.map((material) => (
                                            <div key={material.id} className="material-item">
                                                <span>{material.original_name}</span>
                                                <div>
                                                    <button onClick={() => setManagingQuizFor(material)} className="manage-quiz-btn">Manage Quiz</button>
                                                    <button onClick={() => handleDeleteMaterial(material.id)} className="delete-btn">Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : <p>No materials for this course yet.</p>}
                                </div>
                            </div>
                        ) : (
                            // Placeholder if no course is selected
                            <div className="placeholder">
                                <h2>Welcome, Admin!</h2>
                                <p>Select a course to manage its materials, or switch to User Management.</p>
                            </div>
                        )
                    )}
                    
                    {/* Placeholder for when 'users' tab is active */}
                    {activeTab === 'users' && (
                        <div className="placeholder">
                            <h2>User and Course Assignment</h2>
                            <p>Select a user from the list on the left to manage their course assignments.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default AdminDashboard;

