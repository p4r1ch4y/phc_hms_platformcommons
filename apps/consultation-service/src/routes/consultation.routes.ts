import { Router } from 'express';
import { createConsultation, updateDiagnosis, listConsultations, getConsultationStats } from '../controllers/consultation.controller';
import { 
    authenticate, 
    authorize, 
    validateBody, 
    ConsultationSchema, 
    DiagnosisSchema,
    apiRateLimiter,
    writeRateLimiter
} from '@phc/common';

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);

router.post('/', authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), writeRateLimiter, validateBody(ConsultationSchema), createConsultation);
router.put('/:id/diagnosis', authorize(['DOCTOR']), writeRateLimiter, validateBody(DiagnosisSchema), updateDiagnosis);
router.get('/', authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), listConsultations);
router.get('/stats', authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), getConsultationStats);

export default router;
