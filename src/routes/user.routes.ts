import { Router } from 'express';
import userController from '../controllers/user.controller';
import authenticateToken from '../middlewares/auth';



const router = Router();

router.patch("/", authenticateToken, userController.updateUser);
router.patch("/password", authenticateToken, userController.updatePassword);
router.get('/blogs', authenticateToken, userController.getUserBlogs);

export default router;

