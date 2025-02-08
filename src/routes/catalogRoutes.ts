import { Router } from 'express';
import { createServiceOffering, submitServiceRequestController } from '../controller/catalogController';
import { validateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/create-catalog-item', createServiceOffering);
// router.get('/offerings', validateJWT, listServiceOfferings);

router.post('/create-catalog-item-request', validateJWT, submitServiceRequestController);
// router.patch('/requests/:id/approve', validateJWT, approveServiceRequest);

export default router;