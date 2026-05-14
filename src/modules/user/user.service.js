import { asyncHandler, successHandler } from '../../utils/response/response.js';
import { decrypt } from '../../utils/Security/encryption.security.js';
import { generateLoginCredentials } from '../../utils/security/token.security.js';

export const getMyProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = await decrypt(req.user.phone);
  return successHandler({ res, data: { user: req.user } });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const credentials = await generateLoginCredentials({ user: req.user });
  return successHandler({ res, data: { credentials } });
});
