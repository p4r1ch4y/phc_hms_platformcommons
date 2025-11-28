import { Router } from 'express';
import { addMedicine, addBatch, getInventory } from '../controllers/pharmacy.controller';
import { authenticate, authorize } from '@phc/common';

const router = Router();

router.use(authenticate);

router.post('/medicines', authorize(['HOSPITAL_ADMIN', 'PHARMACIST']), addMedicine);
router.post('/batches', authorize(['HOSPITAL_ADMIN', 'PHARMACIST']), addBatch);
router.get('/inventory', authorize(['HOSPITAL_ADMIN', 'PHARMACIST', 'DOCTOR']), getInventory);

export default router;
