import { Router } from 'express';
import { createConsultation, updateDiagnosis, listConsultations, getConsultationStats } from '../controllers/consultation.controller';
import { authenticate, authorize } from '@phc/common';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), createConsultation);
router.put('/:id/diagnosis', authorize(['DOCTOR']), updateDiagnosis);
router.get('/', authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), listConsultations);
router.get('/stats', authorize(['HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']), getConsultationStats);

export default router;
