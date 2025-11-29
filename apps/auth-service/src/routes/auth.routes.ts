import { Router } from 'express';
import { register, login, createStaff, getStaff } from '../controllers/auth.controller';
import { authenticate, authorize, validateBody, LoginSchema, StaffSchema } from '@phc/common';

const router = Router();

router.post('/register', register);
router.post('/login', validateBody(LoginSchema), login);
router.post('/staff', authenticate, authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']), validateBody(StaffSchema), createStaff);
router.get('/staff', authenticate, authorize(['HOSPITAL_ADMIN', 'SUPER_ADMIN']), getStaff);

export default router;
