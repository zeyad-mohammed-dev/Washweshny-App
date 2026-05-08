import * as authService from './auth.service.js';
import { Router } from 'express';
const router = Router();

router.post('/signup', authService.signup);
router.post('/login', authService.login);
router.patch('/confirm-email', authService.confirmEmail);
router.post('/google', authService.loginWithGoogle);
export default router;
