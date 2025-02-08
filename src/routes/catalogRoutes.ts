import { Router } from 'express';
import { createServiceOffering, submitServiceRequest } from '../controller/catalogController';
import { validateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/offerings', createServiceOffering);
// router.get('/offerings', validateJWT, listServiceOfferings);

router.post('/requests', submitServiceRequest);
// router.patch('/requests/:id/approve', validateJWT, approveServiceRequest);

export default router;