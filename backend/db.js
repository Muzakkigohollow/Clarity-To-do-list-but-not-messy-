const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clarity_db',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 2000
});

// Simple health check on startup
pool.query('SELECT 1')
    .then(() => console.log('✅ Connected to real MySQL database.'))
    .catch(err => {
        console.error('❌ Database connection failed. Please ensure MySQL is running and credentials in .env are correct.', err.message);
    });

module.exports = pool;
