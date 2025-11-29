import { Router } from 'express';
import { addMedicine, addBatch, getInventory } from '../controllers/pharmacy.controller';
import { 
    authenticate, 
    authorize, 
    validateBody, 
    MedicineSchema, 
    BatchSchema,
    apiRateLimiter,
    writeRateLimiter
} from '@phc/common';

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);

router.post('/medicines', authorize(['HOSPITAL_ADMIN', 'PHARMACIST']), writeRateLimiter, validateBody(MedicineSchema), addMedicine);
router.post('/batches', authorize(['HOSPITAL_ADMIN', 'PHARMACIST']), writeRateLimiter, validateBody(BatchSchema), addBatch);
router.get('/inventory', authorize(['HOSPITAL_ADMIN', 'PHARMACIST', 'DOCTOR']), getInventory);

export default router;
