// Import the bcrypt library
const bcrypt = require('bcryptjs');

// Get the password from the command line arguments
// process.argv[0] is node executable path
// process.argv[1] is the script file path
// process.argv[2] will be the first argument provided by the user
const plainPassword = process.argv[2];

// Check if a password was provided
if (!plainPassword) {
  console.error('Usage: node hash_generator.js <your_password>');
  process.exit(1); // Exit with an error code
}

// Generate the salt and hash the password
// 10 is the salt rounds - a good balance between security and performance
bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  } else {
    console.log('Password:', plainPassword);
    console.log('Generated Hash:', hash);
    console.log('\nCopy the Generated Hash and use it in your SQL UPDATE command.');
  }
});

