import { Router } from 'express';
import {
  createSpot,
  deleteSpot,
  getSpot,
  listSpots,
  rateSpot,
  updateSpot
} from '../controllers/spotController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();
router.get('/', listSpots);
router.get('/:id', getSpot);
router.post('/', authenticate, authorize('ADMIN'), createSpot);
router.patch('/:id', authenticate, authorize('ADMIN'), updateSpot);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSpot);
router.post('/:id/ratings', authenticate, rateSpot);
export default router;
