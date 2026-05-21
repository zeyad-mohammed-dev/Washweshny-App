import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as userService from './user.service.js';

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.getMyProfile(req.user);
  return successResponse({
    res,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.updateMyProfile(req);
  return successResponse({
    res,
    message: 'Profile updated successfully',
    data: { user },
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await userService.updatePassword(req);
  return successResponse({
    res,
    message: 'password updated successfully',
    data: { user },
  });
});

export const getProfileById = asyncHandler(async (req, res, next) => {
  const user = await userService.getProfileById(req.params.userId);
  return successResponse({
    res,
    message: 'Profile retrieved successfully',
    data: { user },
  });
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  await userService.freezeAccount(req);
  return successResponse({
    res,
    message: 'Account freezed successfully',
  });
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  await userService.restoreAccount(req);
  return successResponse({
    res,
    message: 'Account restored successfully',
  });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  await userService.deleteAccount(req);
  return successResponse({
    res,
    message: 'Account deleted successfully',
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const credentials = await userService.refreshToken(req.user);
  return successResponse({
    res,
    message: 'Token refreshed successfully',
    data: { credentials },
  });
});
