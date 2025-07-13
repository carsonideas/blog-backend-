import { Router } from 'express';
import blogController from '../controllers/blog.controller';
import authenticateToken from '../middlewares/auth';


const router = Router();

router.get('/', blogController.getAllBlogs);
router.get('/:blogId', blogController.getBlog);
router.post("/", authenticateToken, blogController.createBlog);
router.patch("/:blogId", authenticateToken, blogController.updateBlog);
router.delete('/:blogId', authenticateToken, blogController.deleteBlog);

export default router;

