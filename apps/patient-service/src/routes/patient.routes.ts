import { Router } from 'express';
import { registerPatient, recordVitals, listPatients, getPatientStats, searchGlobal } from '../controllers/patient.controller';
import { 
    authenticate, 
    authorize, 
    validateBody, 
    PatientSchema, 
    VitalsSchema,
    writeRateLimiter,
    apiRateLimiter
} from '@phc/common';

const router = Router();

// Apply general API rate limiting to all routes
router.use(apiRateLimiter);

// Write operations with additional rate limiting
router.post('/', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']), writeRateLimiter, validateBody(PatientSchema), registerPatient);
router.post('/:patientId/vitals', authenticate, authorize(['DOCTOR', 'NURSE']), writeRateLimiter, validateBody(VitalsSchema), recordVitals);

// Read operations
router.get('/', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']), listPatients);
router.get('/stats', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), getPatientStats);
router.get('/search', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), searchGlobal);

export default router;
