const mysql = require('mysql2');

// Create a connection pool. This is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
  host: 'localhost', // Your MySQL host
  user: 'root',      // Your MySQL username
  password: 'manoj', // <<< IMPORTANT: Enter your MySQL password here
  database: 'learning_platform' // The name of your database
});

console.log('MySQL Connection Pool Created.');

// Export the pool with promise support, which allows us to use async/await
module.exports = pool.promise();

