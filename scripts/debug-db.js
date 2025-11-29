const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:vwm6A9xqYTyhKbUo@db.ylqgpvgwjbyghriydrdl.supabase.co:5432/postgres'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase DB');

        // List all schemas
        const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        `);
        console.log('Schemas:', schemas.rows.map(r => r.schema_name));

        // List tables in public schema
        const publicTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Public Tables:', publicTables.rows.map(r => r.table_name));

        // Check for city-hospital schema tables if it exists
        if (schemas.rows.find(r => r.schema_name === 'city-hospital')) {
            const tenantTables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'city-hospital'
            `);
            console.log('City Hospital Tables:', tenantTables.rows.map(r => r.table_name));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
