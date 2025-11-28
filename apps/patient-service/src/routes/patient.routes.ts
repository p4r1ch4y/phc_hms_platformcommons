import { Router } from 'express';
import { registerPatient, recordVitals, listPatients, getPatientStats, searchGlobal } from '../controllers/patient.controller';
import { authenticate, authorize } from '@phc/common';

const router = Router();

router.post('/', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']), registerPatient);
router.get('/', authenticate, authorize(['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']), listPatients);
router.post('/:patientId/vitals', authenticate, authorize(['DOCTOR', 'NURSE']), recordVitals);
router.get('/stats', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), getPatientStats);
router.get('/search', authenticate, authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), searchGlobal);

export default router;
