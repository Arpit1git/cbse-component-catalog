import express from 'express';
import { getCategories, getTags, getFrameworks } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/frameworks', getFrameworks);

export default router;
