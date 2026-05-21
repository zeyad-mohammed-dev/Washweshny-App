import { decrypt, encrypt } from '../../utils/Security/encryption.security.js';
import { generateLoginCredentials } from '../../utils/security/token.security.js';
import * as DbService from '../../db/db.service.js';
import { roleEnum, UserModel } from '../../DB/models/user.model.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors/errors.js';
import {
  compareHash,
  generateHash,
} from '../../utils/security/hash.security.js';

export const getMyProfile = async (user) => {
  user.phone = await decrypt(user.phone);
  return user;
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
export const updatePassword = async ({ user, body }) => {
  const { oldPassword, newPassword } = body;

  const isPasswordValid = await user.compareHash({
    plainText: oldPassword,
    hashedText: user.password,
  });
  if (!isPasswordValid) {
    throw new ForbiddenError('Invalid old password');
  }

  const updatedUser = await DbService.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    data: { password: newPassword },
  });

  if (!updatedUser.modifiedCount) {
    throw new NotFoundError('user not exist or something wrong happen');
  }

  return;
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

export const refreshToken = async (user) => {
  const credentials = await generateLoginCredentials({ user });
  return credentials;
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
      $unset: { restoredAt: 1, restoredBy: 1 },
    },
  });

  if (!user) {
    throw new NotFoundError('user not exist or already freezed');
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
