import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as authService from './auth.service.js';
import { Router } from 'express';
import * as authSchemas from './auth.validation.js';
const router = Router();

router.post(
  '/signup',
  validationMiddleware(authSchemas.signupSchema),
  authService.signup
);

router.post(
  '/login',
  validationMiddleware(authSchemas.loginSchema),
  authService.login
);

router.patch(
  '/confirm-email',
  validationMiddleware(authSchemas.confirmEmailSchema),
  authService.confirmEmail
);

router.post(
  '/google',
  validationMiddleware(authSchemas.loginWithGoogleSchema),
  authService.loginWithGoogle
);
export default router;
