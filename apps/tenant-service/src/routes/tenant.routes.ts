import { Router } from 'express';
import { registerTenant, listTenants } from '../controllers/tenant.controller';
import { authenticate, authorize } from '@phc/common';

const router = Router();

// Public route to register a new hospital (for hackathon simplicity)
// In real world, this might be protected or have a separate super-admin flow
router.post('/', registerTenant);

// Protected route to list tenants (Super Admin only)
router.get('/', authenticate, authorize(['SUPER_ADMIN']), listTenants);

export default router;
