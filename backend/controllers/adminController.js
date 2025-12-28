const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Ensure JWT is imported

// Function to handle admin login
exports.loginAdmin = async (req, res) => {
    // --- Start of Function Logging ---
    console.log(`--- New Admin Login Attempt ---`);
    const { email, password } = req.body;
    console.log(`    Attempting login for email: ${email}`);
    // DO NOT log the raw password received from the frontend in production, only for debugging
    console.log(`    Password received from frontend: ${password}`);
    // ---------------------------------

    // Basic validation
    if (!email || !password) {
        console.log(`    Validation Failed: Email or password missing.`);
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find the admin by email
        console.log(`    Querying database for admin with email: ${email}`);
        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        console.log(`    Database query result: ${JSON.stringify(admins)}`);

        // Check if admin exists
        if (admins.length === 0) {
            console.log(`    Login Failed: Admin not found in database.`);
            return res.status(401).json({ message: 'Invalid credentials' }); // Use generic message for security
        }

        const admin = admins[0];
        console.log(`    Admin found in database: ID ${admin.id}, Name ${admin.name}`);
        const storedHashedPassword = admin.password;
        console.log(`    Stored Hashed Password: ${storedHashedPassword}`);

        // Compare the provided password with the stored hash
        console.log(`    Comparing provided password with stored hash using bcrypt...`);
        const isMatch = await bcrypt.compare(password, storedHashedPassword);
        console.log(`    Result of bcrypt password comparison: ${isMatch}`);

        // Check if passwords match
        if (!isMatch) {
            console.log(`    Login Failed: Passwords do not match.`);
            return res.status(401).json({ message: 'Invalid credentials' }); // Generic message
        }

        // If passwords match, generate JWT
        console.log(`    Passwords match. Generating JWT for admin ID: ${admin.id}`);
        // IMPORTANT: Use a secure, environment-variable-based secret key in production!
        const token = jwt.sign({ id: admin.id, role: 'admin' }, 'your_secret_jwt_key', { expiresIn: '1h' });
        console.log(`    JWT generated successfully.`);

        // Send successful response with token
        res.json({ message: 'Admin login successful', token });
        console.log(`    --- Admin Login Succeeded ---`);

    } catch (error) {
        console.error("    Error during admin login:", error); // Log the actual error
        res.status(500).json({ message: 'Server error during login' }); // Generic server error message
    }
    console.log(`    --- Exiting loginAdmin ---`); // Log end of function
};

