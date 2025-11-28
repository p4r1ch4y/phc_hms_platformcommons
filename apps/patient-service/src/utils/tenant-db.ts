import { TenantClient } from '@phc/database';

const clients = new Map<string, TenantClient>();

export const getTenantClient = (tenantSlug: string): TenantClient => {
    if (clients.has(tenantSlug)) {
        return clients.get(tenantSlug)!;
    }

    const databaseUrl = process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/phc_hms';
    const tenantUrl = `${databaseUrl}?schema=${tenantSlug}`;

    const client = new TenantClient({
        datasources: {
            db: {
                url: tenantUrl,
            },
        },
    });

    clients.set(tenantSlug, client);
    return client;
};
