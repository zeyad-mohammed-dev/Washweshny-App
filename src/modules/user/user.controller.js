import * as userService from './user.service.js';
import { Router } from 'express';
const router = Router();

router.get('/user', userService.getUser);
export default router;
