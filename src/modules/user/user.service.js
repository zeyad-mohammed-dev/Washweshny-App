import { decrypt } from '../../utils/Security/encryption.security.js';
import { generateLoginCredentials } from '../../utils/security/token.security.js';

export const getMyProfile = async (user) => {
  user.phone = await decrypt(user.phone);
  return user;
};

export const refreshToken = async (user) => {
  const credentials = await generateLoginCredentials({ user });
  return credentials;
};
