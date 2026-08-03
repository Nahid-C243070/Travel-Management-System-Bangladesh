import { Router } from 'express';
import { alternativeRoutes, recommendRoute } from '../controllers/routeController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
router.post('/recommend', authenticate, recommendRoute);
router.post('/alternatives', authenticate, alternativeRoutes);
export default router;
