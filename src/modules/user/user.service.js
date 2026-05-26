import { decrypt, encrypt } from '../../utils/Security/encryption.security.js';
import {
  createRevokedToken,
  generateLoginCredentials,
  logoutEnum,
} from '../../utils/security/token.security.js';
import * as DbService from '../../db/db.service.js';
import { roleEnum, UserModel } from '../../DB/models/user.model.js';
import {
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  UnprocessableError,
} from '../../utils/errors/errors.js';
import {
  compareHash,
  generateHash,
} from '../../utils/security/hash.security.js';
import { TokenModel } from '../../db/models/token.model.js';
import { confirmEmail } from '../auth/auth.service.js';

export const getMyProfile = async (user) => {
  user.phone = await decrypt(user.phone);
  return user;
};

export const getProfileById = async (userId) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: { _id: userId, confirmEmail: { $exists: true } },
    select: 'firstName lastName email gender',
  });
  if (!user) {
    throw new NotFoundError('user not exist');
  }
  return user;
};

export const refreshToken = async ({ user, decoded }) => {
  const credentials = await generateLoginCredentials({ user });

  if (!decoded?.jti) {
    throw new UnauthorizedError('invalid refresh token');
  }

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
    throw new ServerError('Failed to refresh token');
  }

  return credentials;
};

export const logout = async ({ user, decoded, body }) => {
  const { flag } = body;
  if (!decoded.jti) {
    throw new UnauthorizedError('invalid token');
  }
  let statusCode = 200;
  switch (flag) {
    case logoutEnum.signoutFromAll:
      const result = await DbService.updateOne({
        model: UserModel,
        filter: { _id: user._id },
        update: {
          changeCredentialsTime: Date.now(),
        },
      });

      if (result.modifiedCount === 0) {
        throw new ServerError('Failed to Logout');
      }
      break;

    default:
      const token = await createRevokedToken({ decoded, user });
      statusCode = 201;
      break;
  }

  return statusCode;
};

export const updateMyProfile = async ({ user, body }) => {
  if (body.phone) {
    body.phone = await encrypt(body.phone);
  }
  const updatedUser = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: user._id },
    data: body,
    select: 'firstName lastName email gender phone',
  });

  if (!updatedUser) {
    throw new NotFoundError('user not exist or something wrong happen');
  }
  return updatedUser;
};

export const updatePassword = async ({ user, body, decoded }) => {
  const { oldPassword, newPassword, flag } = body;

  if (!decoded.jti) {
    throw new UnauthorizedError('invalid token');
  }

  const isPasswordValid = await compareHash({
    plainText: oldPassword,
    hashedText: user.password,
  });
  if (!isPasswordValid) {
    throw new ForbiddenError('Invalid old password');
  }

  let updateData = {};

  switch (flag) {
    case logoutEnum.signoutFromAll:
      updateData.changeCredentialsTime = Date.now();

      break;

    case logoutEnum.signout:
      const token = await createRevokedToken({ decoded, user });
      break;
    default:
      break;
  }

  const hashNewPassword = await generateHash({ plainText: newPassword });
  const updatedUser = await DbService.updateOne({
    model: UserModel,
    filter: { _id: user._id, deletedAt: { $exists: false } },
    update: { password: hashNewPassword, $inc: { __v: 1 }, ...updateData },
  });

  if (!updatedUser.modifiedCount) {
    throw new NotFoundError('user not exist or something wrong happen');
  }

  return;
};

export const restoreAccount = async (req) => {
  const userId = req.params.userId;
  if (userId && req.user.role !== roleEnum.admin) {
    throw new ForbiddenError(
      "You don't have permission to restore this account"
    );
  }

  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      deletedBy: { $ne: userId },
      deletedAt: { $exists: true },
    },
    data: {
      restoredAt: new Date(),
      restoredBy: req.user._id,
      $unset: { deletedAt: 1, deletedBy: 1 },
    },
  });

  if (!user) {
    throw new NotFoundError(
      'user not exist or not freezed or user freezing himself'
    );
  }

  return;
};

export const freezeAccount = async (req) => {
  const userId = req.params.userId;
  if (userId && req.user.role !== roleEnum.admin) {
    throw new ForbiddenError(
      "You don't have permission to freeze this account"
    );
  }
  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: userId || req.user._id, deletedAt: { $exists: false } },
    data: {
      deletedAt: new Date(),
      deletedBy: req.user._id,
      changeCredentialsTime: Date.now(),
      $unset: { restoredAt: 1, restoredBy: 1 },
    },
  });

  if (!user) {
    throw new NotFoundError('user not exist or already freezed');
  }
  return;
};

export const deleteAccount = async (req) => {
  const userId = req.params.userId;

  const user = await DbService.deleteOne({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
    },
  });

  if (user.deletedCount === 0) {
    throw new NotFoundError('user not exist or not freezed ');
  }

  return;
};
