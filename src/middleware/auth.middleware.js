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
    next();
  });
};
