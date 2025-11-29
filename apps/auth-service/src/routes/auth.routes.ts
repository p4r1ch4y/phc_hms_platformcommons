import { Router } from 'express';
import { register, login, createStaff, getStaff } from '../controllers/auth.controller';
import { 
    authenticate, 
    authorize, 
    validateBody, 
    LoginSchema, 
    StaffSchema,
    authRateLimiter,
    registrationRateLimiter,
    writeRateLimiter
} from '@phc/common';

const router = Router();

// Public routes with rate limiting
router.post('/register', registrationRateLimiter, register);
router.post('/login', authRateLimiter, validateBody(LoginSchema), login);

// Protected routes with write rate limiting
router.post('/staff', authenticate, authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']), writeRateLimiter, validateBody(StaffSchema), createStaff);
router.get('/staff', authenticate, authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']), getStaff);

export default router;
