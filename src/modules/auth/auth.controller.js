import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response/response.js';
import { asyncHandler } from '../../utils/errors/async-handler.js';

export const signup = asyncHandler(async (req, res, next) => {
  await authService.signup(req.body);
  return successResponse({
    res,
    message: 'Signup successful. Please verify your email.',
    statusCode: 201,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const credentials = await authService.login(req.body);
  return successResponse({
    res,
    message: 'Login successful',
    data: { credentials },
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  await authService.confirmEmail(req.body);
  return successResponse({
    res,
    message: 'Email confirmed successfully',
  });
});

export const requestForgotPasswordOTP = asyncHandler(async (req, res, next) => {
  await authService.requestForgotPasswordOTP(req.body);
  return successResponse({
    res,
    message: 'OTP Sended. Please verify your email.',
  });
});

export const confirmForgotPasswordOTPSchema = asyncHandler(
  async (req, res, next) => {
    await authService.confirmForgotPasswordOTPSchema(req.body);
    return successResponse({
      res,
      message: 'Email confirmed successfully',
    });
  }
);

export const resetPassword = asyncHandler(async (req, res, next) => {
  await authService.resetPassword(req.body);
  return successResponse({
    res,
    message: 'Password reset successfully',
  });
});

export const LoginWithGoogle = asyncHandler(async (req, res, next) => {
  const { credentials, statusCode } = await authService.LoginWithGoogle(
    req.body
  );
  return successResponse({
    res,
    message: 'Login with Google successful',
    data: { credentials },
    statusCode,
  });
});
