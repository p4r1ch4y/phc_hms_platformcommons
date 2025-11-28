import { PrismaClient } from '@phc/database/generated/pharmacy-client';

const clients: Record<string, PrismaClient> = {};

export const getTenantClient = (tenantSlug: string): PrismaClient => {
    if (!clients[tenantSlug]) {
        // In a real scenario, we would construct the database URL dynamically based on the tenant
        // For this hackathon/MVP, we might use the same DB but different schemas
        // Prisma doesn't support dynamic schema switching easily with one client instance unless using raw queries or middleware
        // BUT, for this project, we are likely using a single DB with schemas like 'tenant_slug'

        // However, the generated client is tied to the connection string in env.
        // We need to append ?schema=tenant_slug to the connection string.

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) throw new Error('DATABASE_URL not found');

        const tenantUrl = `${databaseUrl}?schema=tenant_${tenantSlug}`;

        clients[tenantSlug] = new PrismaClient({
            datasources: {
                db: {
                    url: tenantUrl
                }
            }
        });
    }
    return clients[tenantSlug];
};
