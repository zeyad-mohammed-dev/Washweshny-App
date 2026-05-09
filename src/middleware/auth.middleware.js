import { asyncHandler } from '../utils/response/response.js';

import {
  decodeToken,
  tokenTypeEnum,
} from '../utils/security/token.security.js';

export const authenticationMiddleware = ({
  tokenType = tokenTypeEnum.access,
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodeToken({ next, authorization, tokenType });
    req.user = user;
    return next();
  });
};

export const authorizationMiddleware = ({ allowedRoles = [] }) => {
  return asyncHandler(async (req, res, next) => {
    const { user } = req;
    if (!user) {
      return next(new Error('Un-Authorized', { cause: 401 }));
    }
    if (!allowedRoles.includes(user.role)) {
      return next(new Error('Forbidden', { cause: 403 }));
    }
    return next();
  });
};
