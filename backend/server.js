require('dotenv').config();
const app = require('./app');
const db = require('./db');

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    console.log('Waiting for database connection...');
    let retries = 5;
    while (retries) {
        const isConnected = await db.checkConnection();
        if (isConnected) {
            app.listen(PORT, () => {
                console.log(`✅ Server running on port ${PORT}`);
            });
            return;
        }
        retries -= 1;
        console.log(`Database not ready, retrying... (${retries} attempts left)`);
        await new Promise(res => setTimeout(res, 2000));
    }
    console.error('❌ Could not connect to database after retries. Exiting.');
    process.exit(1);
}

startServer();
