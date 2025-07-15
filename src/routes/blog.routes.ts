


import express from 'express';
import blogController from '../controllers/blog.controller';
import authenticateToken from '../middlewares/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', blogController.getAllBlogs);
router.get('/:blogId', blogController.getBlog);

// Protected routes (authentication required)
router.post('/', authenticateToken, blogController.createBlog);
router.put('/:blogId', authenticateToken, blogController.updateBlog);
router.patch('/:blogId', authenticateToken, blogController.updateBlog);
router.delete('/:blogId', authenticateToken, blogController.deleteBlog);

export default router;