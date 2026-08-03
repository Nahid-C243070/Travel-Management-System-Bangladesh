import { Router } from 'express';
import {
  bookGuide,
  createGuide,
  deleteGuide,
  listAllBookings,
  listGuides,
  listMyBookings,
  updateBookingStatus,
  updateGuide
} from '../controllers/guideController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();
router.get('/', listGuides);
router.get('/bookings/me', authenticate, listMyBookings);
router.get('/bookings', authenticate, authorize('ADMIN'), listAllBookings);
router.post('/bookings', authenticate, bookGuide);
router.patch('/bookings/:id/status', authenticate, authorize('ADMIN'), updateBookingStatus);
router.post('/', authenticate, authorize('ADMIN'), createGuide);
router.patch('/:id', authenticate, authorize('ADMIN'), updateGuide);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteGuide);
export default router;
