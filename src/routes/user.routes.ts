

import express from 'express';
import userController from '../controllers/user.controller';
import authenticateToken from '../middlewares/auth';

const router = express.Router();

// Profile routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// Password update route
router.put('/password', authenticateToken, userController.updatePassword);

// User blogs route
router.get('/blogs', authenticateToken, userController.getUserBlogs);

// Legacy route for backward compatibility
router.patch('/', authenticateToken, userController.updateProfile);
router.patch('/password', authenticateToken, userController.updatePassword);

export default router;
