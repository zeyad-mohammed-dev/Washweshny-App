import { findById } from '../DB/db.service.js';
import { UserModel } from '../DB/models/user.model.js';
import { asyncHandler } from '../utils/errors/async-handler.js';
import { UnauthorizedError } from '../utils/errors/errors.js';
import {
  authSchemeEnum,
  decodeToken,
  tokenTypeEnum,
} from '../utils/security/token.security.js';

export const authenticationMiddleware = ({
  tokenType = tokenTypeEnum.access,
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const { user, decoded } = await decodeToken({
      next,
      authorization,
      tokenType,
    });
    if (!user) {
      throw new UnauthorizedError('Un-Authorized');
    }
    req.user = user;
    req.decoded = decoded;
    return next();
  });
};

export const authorizationMiddleware = ({ allowedRoles = [] }) => {
  return asyncHandler(async (req, res, next) => {
    const { user } = req;
    if (!user) {
      throw new UnauthorizedError('Un-Authorized');
    }
    if (!allowedRoles.includes(user.role)) {
      throw new UnauthorizedError('Forbidden');
    }
    return next();
  });
};
