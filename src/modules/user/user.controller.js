import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as userService from './user.service.js';

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.getMyProfile(req.user);
  return successResponse({
    res,
    message: 'Profile retrieved successfully',
    data: { user: req.user },
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
