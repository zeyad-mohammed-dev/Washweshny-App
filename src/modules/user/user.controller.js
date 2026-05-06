import * as userService from './user.service.js';
import { Router } from 'express';
import { authenticationMiddleware } from '../../middleware/auth.middleware.js';
import { tokenTypeEnum } from '../../utils/security/token.security.js';
const router = Router();

router.get('/profile', authenticationMiddleware(), userService.profile);
router.post(
  '/refresh-token',
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  userService.refreshToken
);
export default router;
