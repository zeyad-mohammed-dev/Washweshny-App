import jwt from 'jsonwebtoken';
import { roleEnum, UserModel } from '../../DB/models/user.model.js';
import * as DbService from '../../DB/db.service.js';
export const authSchemeEnum = {
  bearer: 'Bearer',
  system: 'System',
};
export const tokenTypeEnum = {
  access: 'access',
  refresh: 'refresh',
};

export const generateToken = async ({
  payload = {},
  secretKey = process.env.JWT_ACCESS_SECRET_BEARER,
  expiresIn = process.env.JWT_ACCESS_EXPIRES_IN,
}) => {
  const token = jwt.sign(payload, secretKey, { expiresIn });
  return token;
};

export const verifyToken = async ({
  token = '',
  secretKey = process.env.JWT_ACCESS_SECRET_BEARER,
}) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded;
};

export const getSecretKey = async ({ authScheme }) => {
  const secrets = { accessSecret: undefined, refreshSecret: undefined };

  switch (authScheme) {
    case authSchemeEnum.bearer:
      secrets.accessSecret = process.env.JWT_ACCESS_SECRET_BEARER;
      secrets.refreshSecret = process.env.JWT_REFRESH_SECRET_BEARER;
      break;
    case authSchemeEnum.system:
      secrets.accessSecret = process.env.JWT_ACCESS_SECRET_SYSTEM;
      secrets.refreshSecret = process.env.JWT_REFRESH_SECRET_SYSTEM;
      break;
    default:
      throw new Error(`Unknown authScheme: ${authScheme}`);
  }
  return secrets;
};

export const decodeToken = async ({
  next,
  authorization = '',
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [authScheme, token] = authorization.split(' ');

  if (!authScheme || !token) {
    return next(new Error('missing authorization parts', { cause: 400 }));
  }
  const secrets = await getSecretKey({ authScheme });
  const secretKey =
    tokenType === tokenTypeEnum.access
      ? secrets.accessSecret
      : secrets.refreshSecret;
  const decoded = await verifyToken({ token, secretKey });

  if (!decoded || !decoded.id) {
    return next(new Error('in-valid token', { cause: 401 }));
  }
  const user = await DbService.findOne({
    model: UserModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    return next(new Error('in-valid token', { cause: 401 }));
  }
  return user;
};

export const generateLoginCredentials = async ({ user }) => {
  const authScheme =
    user.role !== roleEnum.user ? authSchemeEnum.system : authSchemeEnum.bearer;

  const secrets = await getSecretKey({ authScheme });

  const accessToken = await generateToken({
    payload: { id: user._id },
    secretKey: secrets.accessSecret,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
  const refreshToken = await generateToken({
    payload: { id: user._id },
    secretKey: secrets.refreshSecret,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};
