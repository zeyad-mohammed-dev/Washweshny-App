import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as authController from './auth.controller.js';
import { Router } from 'express';
import * as authSchemas from './auth.validation.js';
const router = Router();

router.post(
  '/signup',
  validationMiddleware(authSchemas.signupSchema),
  authController.signup
);

router.post(
  '/login',
  validationMiddleware(authSchemas.loginSchema),
  authController.login
);

router.patch(
  '/confirm-email',
  validationMiddleware(authSchemas.confirmEmailSchema),
  authController.confirmEmail
);

router.post(
  '/google',
  validationMiddleware(authSchemas.loginWithGoogleSchema),
  authController.LoginWithGoogle
);
export default router;
