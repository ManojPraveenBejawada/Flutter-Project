import React, { useState } from 'react';
// Corrected paths: Import from the 'components' subfolder
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './index.css'; // Corrected path: index.css is in the same 'src' folder

function App() {
  // State to track if the admin is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to handle logging out
  // This function is passed down to the AdminDashboard component
  const handleLogout = () => {
    // In a real-world app, you would also clear any stored tokens (e.g., from localStorage)
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {/* Conditionally render the dashboard or the login form based on login state */}
      {isLoggedIn ? (
        // Pass the handleLogout function as a prop to the dashboard
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        // Pass the function to update the login state to the login component
        <AdminLogin setIsLoggedIn={setIsLoggedIn} />
      )}
    </div>
  );
}

export default App;

