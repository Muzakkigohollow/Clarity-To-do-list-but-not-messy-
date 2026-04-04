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

pool.isHealthy = false;

pool.checkConnection = async () => {
    try {
        await pool.query('SELECT 1');
        if (!pool.isHealthy) {
             console.log('✅ Connected to real MySQL database.');
        }
        pool.isHealthy = true;
        return true;
    } catch (err) {
        if (pool.isHealthy) {
             console.error('❌ Database connection lost:', err.message);
        }
        pool.isHealthy = false;
        return false;
    }
};

// Initial health check and interval for circuit breaker
pool.checkConnection();
setInterval(pool.checkConnection, 10000);

module.exports = pool;
