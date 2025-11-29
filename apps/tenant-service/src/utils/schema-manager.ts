import { exec } from 'child_process';
import util from 'util';
import { managementClient } from '@phc/database';

const execAsync = util.promisify(exec);

/**
 * Validates and sanitizes schema name to prevent SQL injection.
 * PostgreSQL schema names must:
 * - Start with a letter or underscore
 * - Contain only letters, numbers, underscores
 * - Be at most 63 characters
 */
const sanitizeSchemaName = (slug: string): string => {
    if (!slug || typeof slug !== 'string') {
        throw new Error('Schema name is required');
    }
    
    const sanitized = slug.toLowerCase().trim();
    
    // Validate format: must start with letter, contain only lowercase alphanumeric and underscores
    if (!/^[a-z][a-z0-9_]*$/.test(sanitized)) {
        throw new Error('Invalid schema name format. Must start with a letter and contain only lowercase letters, numbers, and underscores.');
    }
    
    // PostgreSQL limit for identifiers
    if (sanitized.length > 63) {
        throw new Error('Schema name too long. Maximum 63 characters allowed.');
    }
    
    // Reserved names that should not be used
    const reservedNames = ['public', 'pg_catalog', 'information_schema', 'pg_toast'];
    if (reservedNames.includes(sanitized)) {
        throw new Error('Cannot use reserved schema name');
    }
    
    return sanitized;
};

export const createTenantSchema = async (slug: string) => {
    try {
        // Sanitize the slug before using in SQL
        const safeSlug = sanitizeSchemaName(slug);
        
        // 1. Create Schema in DB - using parameterized approach where possible
        // Note: Schema names can't be parameterized in SQL, so we validate strictly above
        await managementClient.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${safeSlug}"`);

        // 2. Run migrations/push for this schema
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL not set');

        const tenantDbUrl = `${dbUrl}?schema=${safeSlug}`;

        // We need to point to the tenant.prisma file which is in packages/database
        const schemaPath = '../../packages/database/prisma/tenant.prisma';

        console.log(`Deploying schema for tenant: ${safeSlug}`);

        // Using prisma db push to sync the schema
        await execAsync(`npx prisma db push --schema=${schemaPath}`, {
            env: { ...process.env, DATABASE_URL: tenantDbUrl },
        });

        console.log(`Schema deployed for tenant: ${safeSlug}`);
    } catch (error) {
        console.error(`Failed to create schema for tenant ${slug}:`, error);
        throw error;
    }
};
