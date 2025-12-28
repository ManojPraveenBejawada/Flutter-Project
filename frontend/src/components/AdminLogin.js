import React, { useState } from 'react';
import axios from 'axios';

function AdminLogin({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const res = await axios.post('http://localhost:5000/api/admins/login', { email, password });
      alert(res.data.message);
      setIsLoggedIn(true); // Update the state in App.js on successful login
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;

