import { Router } from 'express';
import { register, login, createStaff, getStaff } from '../controllers/auth.controller';
import { 
    authenticate, 
    authorize, 
    validateBody, 
    LoginSchema, 
    RegisterSchema,
    StaffSchema,
    authRateLimiter,
    registrationRateLimiter,
    writeRateLimiter,
    apiRateLimiter,
    RegisterSchema
} from '@phc/common';

const router = Router();

// Public routes with rate limiting and validation
router.post('/register', registrationRateLimiter, validateBody(RegisterSchema), register);
router.post('/login', authRateLimiter, validateBody(LoginSchema), login);

// Protected routes with rate limiting applied before auth
router.post('/staff', writeRateLimiter, authenticate, authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']), validateBody(StaffSchema), createStaff);
router.get('/staff', apiRateLimiter, authenticate, authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']), getStaff);

export default router;
