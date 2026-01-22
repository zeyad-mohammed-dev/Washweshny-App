import * as authService from './auth.service.js';
import { Router } from 'express';
const router = Router();

router.post('/signup', authService.signup);
export default router;
