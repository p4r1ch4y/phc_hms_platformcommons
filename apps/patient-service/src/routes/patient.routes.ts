import { Router } from 'express';
import { registerPatient, recordVitals, listPatients, getPatientStats, searchGlobal, getPatient, updatePatient, getHighRiskPatients } from '../controllers/patient.controller';
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
router.post('/:patientId/vitals', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']), writeRateLimiter, validateBody(VitalsSchema), recordVitals);
router.put('/:id', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'ASHA']), writeRateLimiter, validateBody(PatientSchema), updatePatient);

// Read operations
router.get('/', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'ASHA', 'PHARMACIST']), listPatients);
router.get('/stats', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'ASHA', 'PHARMACIST']), getPatientStats);
router.get('/search', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'ASHA', 'PHARMACIST']), searchGlobal);
router.get('/high-risk', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'ASHA']), getHighRiskPatients);
router.get('/:id', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'ASHA', 'PHARMACIST']), getPatient);

export default router;
