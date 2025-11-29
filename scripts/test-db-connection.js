const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5434/phc_hms',
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

testConnection();
