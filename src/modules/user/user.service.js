import { decrypt } from '../../utils/Security/encryption.security.js';
import { generateLoginCredentials } from '../../utils/security/token.security.js';
import * as DbService from '../../db/db.service.js';
import { UserModel } from '../../DB/models/user.model.js';
import { NotFoundError } from '../../utils/errors/errors.js';

export const getMyProfile = async (user) => {
  user.phone = await decrypt(user.phone);
  return user;
};

export const getProfileById = async (userId) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: { _id: userId, confirmEmail: { $exists: true } },
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
