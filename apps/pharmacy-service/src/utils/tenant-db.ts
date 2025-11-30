import { PrismaClient as PharmacyClient } from '@phc/database';

const clients: Record<string, PharmacyClient> = {};

export const getTenantClient = (tenantSlug: string): PharmacyClient => {
    if (!clients[tenantSlug]) {
        // In a real scenario, we would construct the database URL dynamically based on the tenant
        // For this hackathon/MVP, we might use the same DB but different schemas
        // Prisma doesn't support dynamic schema switching easily with one client instance unless using raw queries or middleware
        // BUT, for this project, we are likely using a single DB with schemas like 'tenant_slug'

        // However, the generated client is tied to the connection string in env.
        // We need to append ?schema=tenant_slug to the connection string.

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) throw new Error('DATABASE_URL not found');

        const tenantUrl = `${databaseUrl}?schema=${tenantSlug}`;
        console.log(`[Pharmacy] Initializing client for tenant: ${tenantSlug}`);
        console.log(`[Pharmacy] DB URL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`); // Hide password
        console.log(`[Pharmacy] Tenant URL: ${tenantUrl.replace(/:[^:@]*@/, ':****@')}`);

        clients[tenantSlug] = new PharmacyClient({
            datasources: {
                db: {
                    url: tenantUrl
                }
            }
        });
    }
    return clients[tenantSlug];
};
