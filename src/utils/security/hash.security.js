import { compareSync, hashSync } from 'bcryptjs';

export const generateHash = async ({
  plainText = '',
  saltRounds = process.env.SALT_ROUNDS,
} = {}) => {
  return hashSync(plainText, parseInt(saltRounds));
};

export const compareHash = async ({ plainText = '', hashedText = '' } = {}) => {
  return compareSync(plainText, hashedText);
};
