import { Router } from 'express';
import {
  createVehicle,
  deleteVehicle,
  estimateCost,
  listVehicles,
  updateVehicle
} from '../controllers/vehicleController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();
router.get('/', listVehicles);
router.post('/estimate-cost', estimateCost);
router.post('/', authenticate, authorize('ADMIN'), createVehicle);
router.patch('/:id', authenticate, authorize('ADMIN'), updateVehicle);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteVehicle);
export default router;
