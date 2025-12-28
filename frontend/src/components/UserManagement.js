import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement({ courses }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [assignedCourses, setAssignedCourses] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        if (user) {
            try {
                const res = await axios.get(`http://localhost:5000/api/assignments/user/${user.id}`);
                setAssignedCourses(res.data.map(c => c.id)); // Store only the IDs for quick lookup
            } catch (error) {
                console.error('Error fetching assigned courses:', error);
                setAssignedCourses([]);
            }
        } else {
            setAssignedCourses([]);
        }
    };

    const handleAssignCourse = async (courseId) => {
        if (!selectedUser) return;
        try {
            await axios.post('http://localhost:5000/api/assignments', {
                user_id: selectedUser.id,
                course_id: courseId
            });
            handleUserSelect(selectedUser); // Refresh assignments
        } catch (error) {
            console.error('Error assigning course:', error);
            alert(error.response?.data?.message || 'Failed to assign course.');
        }
    };

    const handleUnassignCourse = async (courseId) => {
        if (!selectedUser) return;
        try {
            await axios.delete('http://localhost:5000/api/assignments', {
                data: { user_id: selectedUser.id, course_id: courseId }
            });
            handleUserSelect(selectedUser); // Refresh assignments
        } catch (error) {
            console.error('Error unassigning course:', error);
        }
    };

    return (
        <div className="user-management">
            <h2>Users</h2>
            <div className="user-list">
                {users.map(user => (
                    <div
                        key={user.id}
                        className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                        onClick={() => handleUserSelect(user)}
                    >
                        {user.name} ({user.email})
                    </div>
                ))}
            </div>
            {selectedUser && (
                <div className="assignment-manager">
                    <h3>Assign Courses for {selectedUser.name}</h3>
                    <div className="course-assignment-list">
                        {courses.map(course => (
                            <div key={course.id} className="course-assignment-item">
                                <span>{course.title}</span>
                                {assignedCourses.includes(course.id) ? (
                                    <button onClick={() => handleUnassignCourse(course.id)} className="unassign-btn">Unassign</button>
                                ) : (
                                    <button onClick={() => handleAssignCourse(course.id)} className="assign-btn">Assign</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
