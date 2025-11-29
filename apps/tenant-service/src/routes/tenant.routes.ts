import { Router } from 'express';
import { registerTenant, listTenants } from '../controllers/tenant.controller';
import { seedTenantData } from '../controllers/seed.controller';
import { 
    authenticate, 
    authorize, 
    validateBody, 
    TenantSchema,
    registrationRateLimiter,
    writeRateLimiter
} from '@phc/common';

const router = Router();

// Public route to register a new hospital with input validation and rate limiting
router.post('/', registrationRateLimiter, validateBody(TenantSchema), registerTenant);

// Protected route to list tenants (Super Admin only)
router.get('/', authenticate, authorize(['SUPER_ADMIN']), listTenants);

// Protected route to seed data (Admin only) with rate limiting
router.post('/seed', authenticate, writeRateLimiter, seedTenantData);

export default router;
