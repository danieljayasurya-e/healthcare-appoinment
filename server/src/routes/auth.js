import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { login, me } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
