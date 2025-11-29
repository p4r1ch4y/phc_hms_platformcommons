import { Router } from 'express';
import { registerTenant, listTenants } from '../controllers/tenant.controller';
import { seedTenantData } from '../controllers/seed.controller';
import { authenticate, authorize, validateBody, TenantSchema } from '@phc/common';

const router = Router();

// Public route to register a new hospital with input validation
router.post('/', validateBody(TenantSchema), registerTenant);

// Protected route to list tenants (Super Admin only)
router.get('/', authenticate, authorize(['SUPER_ADMIN']), listTenants);

// Protected route to seed data (Admin only)
router.post('/seed', authenticate, seedTenantData);

export default router;
