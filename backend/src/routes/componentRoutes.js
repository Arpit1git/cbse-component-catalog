import express from 'express';
import {
  getComponents,
  getComponentById,
  createComponent,
  addVersion,
  updateVersionStatus,
  downloadComponent,
  getMyComponents,
  deleteComponent,
} from '../controllers/componentController.js';
import { addReview, getReviews } from '../controllers/reviewController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getComponents);
router.get('/my', authenticateToken, getMyComponents);
router.get('/:id', getComponentById);
router.post('/:id/download', downloadComponent);
router.get('/:id/reviews', getReviews);

// Protected routes (Reviews)
router.post('/:id/reviews', authenticateToken, addReview);

// Protected routes (Contributor / Admin)
router.post('/', authenticateToken, requireRole(['contributor', 'admin']), createComponent);
router.delete('/:id', authenticateToken, requireRole(['contributor', 'admin']), deleteComponent);
router.post('/:id/versions', authenticateToken, requireRole(['contributor', 'admin']), addVersion);
router.patch('/:id/versions/:versionId/status', authenticateToken, requireRole(['contributor', 'admin']), updateVersionStatus);

export default router;
