import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as authController from './auth.controller.js';
import { Router } from 'express';
import * as authSchemas from './auth.validation.js';
const router = Router();

/**
 *
 PATCH   /auth/forgot-password/request-otp  
PATCH   /auth/forgot-password/confirm-otp  
PATCH   /auth/forgot-password/reset       
 */
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

router.patch(
  '/forgot-password/request-otp',
  validationMiddleware(authSchemas.requestForgotPasswordOTPSchema),
  authController.requestForgotPasswordOTP
);

router.patch(
  '/forgot-password/confirm-otp',
  validationMiddleware(authSchemas.confirmForgotPasswordOTPSchema),
  authController.confirmForgotPasswordOTP
);

router.patch(
  '/forgot-password/reset',
  validationMiddleware(authSchemas.resetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/google',
  validationMiddleware(authSchemas.loginWithGoogleSchema),
  authController.LoginWithGoogle
);
export default router;
