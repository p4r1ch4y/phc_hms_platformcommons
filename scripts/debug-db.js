const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/phc_hms'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Check patients in test-phc schema
        const res = await client.query('SELECT * FROM "test-phc"."Patient"');
        console.log('Patients count:', res.rows.length);
        console.log('Patients:', res.rows.map(p => p.firstName + ' ' + p.lastName));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
