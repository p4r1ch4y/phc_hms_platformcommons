import { PrismaClient as ManagementClient } from './generated/management-client';
import { PrismaClient as TenantClient } from './generated/tenant-client';
import { PrismaClient as PharmacyClient } from './generated/pharmacy-client';

export const managementClient = new ManagementClient();
export const tenantClient = new TenantClient();

export { PrismaClient as TenantClient } from './generated/tenant-client';
export * from './generated/management-client';
export { PrismaClient as PharmacyClient } from './generated/pharmacy-client';

