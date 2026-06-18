import jwt from 'jsonwebtoken';
import { roleEnum, UserModel } from '../../DB/models/user.model.js';
import * as DbService from '../../DB/db.service.js';
import { UnauthorizedError } from '../errors/errors.js';
import { nanoid } from 'nanoid';
import { TokenModel } from '../../db/models/token.model.js';
export const authSchemeEnum = {
  bearer: 'Bearer',
  system: 'System',
};
export const tokenTypeEnum = {
  access: 'access',
  refresh: 'refresh',
};
export const logoutEnum = {
  signout: 'signout',
  signoutFromAll: 'signoutFromAll',
  stayLoggedIn: 'stayLoggedIn',
};

export const generateToken = async ({
  payload = {},
  secretKey = process.env.JWT_ACCESS_SECRET_BEARER,
  expiresIn = process.env.JWT_ACCESS_EXPIRES_IN,
  jti,
}) => {
  const token = jwt.sign(payload, secretKey, { expiresIn, jwtid: jti });
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
      throw new UnauthorizedError(`Un-Authorized`);
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
    throw new UnauthorizedError('Un-Authorized');
  }
  const secrets = await getSecretKey({ authScheme });
  const secretKey =
    tokenType === tokenTypeEnum.access
      ? secrets.accessSecret
      : secrets.refreshSecret;
  const decoded = await verifyToken({ token, secretKey });

  if (!decoded || !decoded.id) {
    throw new UnauthorizedError('Un-Authorized');
  }

  if (decoded.jti) {
    const tokenInBlacklist = await DbService.findOne({
      model: TokenModel,
      filter: { jti: decoded.jti },
    });
    if (tokenInBlacklist) {
      throw new UnauthorizedError('Un-Authorized');
    }
  }

  const user = await DbService.findOne({
    model: UserModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    throw new UnauthorizedError('Un-Authorized');
  }

  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
    throw new UnauthorizedError('Un-Authorized');
  }

  return { user, decoded };
};

export const generateLoginCredentials = async ({ user }) => {
  const authScheme =
    user.role !== roleEnum.user ? authSchemeEnum.system : authSchemeEnum.bearer;

  const secrets = await getSecretKey({ authScheme });
  const jti = nanoid();
  const accessToken = await generateToken({
    payload: { id: user._id },
    secretKey: secrets.accessSecret,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    jti,
  });
  const refreshToken = await generateToken({
    payload: { id: user._id },
    secretKey: secrets.refreshSecret,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    jti,
  });

  return { accessToken, refreshToken };
};

export const createRevokedToken = async ({ decoded, user }) => {
  const [token] = await DbService.create({
    model: TokenModel,
    data: [
      {
        jti: decoded.jti,
        userId: user._id,
        expiresAt: new Date((decoded.iat + 604800) * 1000),
      },
    ],
  });

  if (!token) {
    throw new ServerError('Failed to Logout');
  }

  return token;
};
