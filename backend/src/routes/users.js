// backend/src/routes/users.js
import express from 'express';
import { getUsers, updateStatus } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.put('/status', protect, updateStatus);

export default router;