import { exec } from 'child_process';
import util from 'util';
import { managementClient } from '@phc/database';

const execAsync = util.promisify(exec);

export const createTenantSchema = async (slug: string) => {
    try {
        // 1. Create Schema in DB
        await managementClient.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${slug}"`);

        // 2. Run migrations/push for this schema
        // We construct a new DATABASE_URL with the schema param
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL not set');

        const tenantDbUrl = `${dbUrl}?schema=${slug}`;

        // We need to point to the tenant.prisma file which is in packages/database
        // Assuming we are running from apps/tenant-service
        const schemaPath = '../../packages/database/prisma/tenant.prisma';

        console.log(`Deploying schema for tenant: ${slug}`);

        // Using prisma db push to sync the schema
        await execAsync(`npx prisma db push --schema=${schemaPath}`, {
            env: { ...process.env, DATABASE_URL: tenantDbUrl },
        });

        console.log(`Schema deployed for tenant: ${slug}`);
    } catch (error) {
        console.error(`Failed to create schema for tenant ${slug}:`, error);
        throw error;
    }
};
