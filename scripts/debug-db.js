const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://admin:password@127.0.0.1:5432/phc_hms'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const resSchemas = await client.query('SELECT nspname FROM pg_namespace');
        console.log('Schemas:', resSchemas.rows.map(r => r.nspname));

        const resTables = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `);
        console.log('Tables:', resTables.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
