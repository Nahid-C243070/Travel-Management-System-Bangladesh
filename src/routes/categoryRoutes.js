import { Router } from 'express';
import { createCategory, listCategories } from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();
router.get('/', listCategories);
router.post('/', authenticate, authorize('ADMIN'), createCategory);
export default router;
