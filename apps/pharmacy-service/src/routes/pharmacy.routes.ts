import { Router } from 'express';
import { addMedicine, addBatch, getInventory, getLowStockMedicines } from '../controllers/pharmacy.controller';
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

router.post('/medicines', authorize(['HOSPITAL_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), writeRateLimiter, validateBody(MedicineSchema), addMedicine);
router.post('/batches', authorize(['HOSPITAL_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), writeRateLimiter, validateBody(BatchSchema), addBatch);
router.get('/inventory', authorize(['HOSPITAL_ADMIN', 'PHARMACIST', 'DOCTOR', 'ASHA']), getInventory);
router.get('/low-stock', authorize(['HOSPITAL_ADMIN', 'PHARMACIST', 'DOCTOR', 'ASHA']), getLowStockMedicines);

export default router;
