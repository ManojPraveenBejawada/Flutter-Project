const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Added missing import for login function

exports.registerUser = async (req, res) => {
  console.log('--- New Registration Attempt ---');
  try {
    const { name, email, phone, password } = req.body;
    console.log('Data received from frontend:', { name, email, phone });

    if (!name || !email || !password) {
      console.log('Registration failed: Missing required fields.');
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // 1. Check if user already exists
    console.log(`Checking if user with email ${email} exists...`);
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      console.log('Registration failed: User already exists.');
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    console.log('User does not exist. Proceeding with registration.');

    // 2. Hash the password
    console.log('Hashing the password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully.');

    // 3. Insert the new user into the database
    const newUser = { name, email, phone, password: hashedPassword };
    console.log('Inserting new user into the database...');
    await db.query('INSERT INTO users SET ?', newUser);
    console.log('User inserted successfully!');

    // CORRECTED a probable typo from res.status(21) to res.status(201)
    res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    console.error('SERVER ERROR during registration:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('SERVER ERROR during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

