import express from 'express';
import {
  getPendingComponents,
  setComponentStatus,
  getCatalogStats,
  getUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authenticated Admin role
router.use(authenticateToken, requireRole(['admin']));

router.get('/pending', getPendingComponents);
router.patch('/components/:id/status', setComponentStatus);
router.get('/stats', getCatalogStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
