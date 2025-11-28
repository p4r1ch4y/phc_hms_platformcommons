import { managementClient } from '../packages/database/index';

async function run() {
    try {
        console.log('Connecting...');
        const schemas: any[] = await managementClient.$queryRawUnsafe('SELECT nspname FROM pg_namespace');
        console.log('Schemas:', schemas.map(s => s.nspname));

        const tables: any[] = await managementClient.$queryRawUnsafe(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `);
        console.log('Tables:', tables);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await managementClient.$disconnect();
    }
}
run();
