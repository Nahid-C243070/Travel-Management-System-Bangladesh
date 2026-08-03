import { Router } from 'express';
import { listDistricts, listDivisions } from '../controllers/locationController.js';
const router = Router();
router.get('/divisions', listDivisions);
router.get('/districts', listDistricts);
export default router;
