import { Router } from 'express';
import { approveServiceRequestController, createServiceOfferingController, listServiceOfferingsController, searchServiceOfferingsController, submitServiceRequestController } from '../controller/catalogController';
import { validateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/create-catalog-item', createServiceOfferingController);
router.get('/get-all-catalog-items', listServiceOfferingsController);
router.get('/search-catalog-items', searchServiceOfferingsController);

router.post('/create-catalog-item-request', validateJWT, submitServiceRequestController);
router.patch('/requests/:id/approve', validateJWT, approveServiceRequestController);

export default router;