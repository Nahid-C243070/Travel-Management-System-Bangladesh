import { Router } from 'express';
import {
  myMilestones,
  overview,
  routePopularity,
  spotRatings
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();
router.get('/milestones/me', authenticate, myMilestones);
router.get('/overview', authenticate, authorize('ADMIN'), overview);
router.get('/spot-ratings', authenticate, authorize('ADMIN'), spotRatings);
router.get('/route-popularity', authenticate, authorize('ADMIN'), routePopularity);
export default router;
