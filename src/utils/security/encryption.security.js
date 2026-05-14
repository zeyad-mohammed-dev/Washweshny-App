import crypto from 'crypto';
import { buffer } from 'stream/consumers';
import { ServerError } from '../errors/errors.js';

// ===================================SYMMETRIC ENCRYPTION===========================================
let cachedEncryptionKey;

const getEncryptionKey = () => {
  if (cachedEncryptionKey) return cachedEncryptionKey;

  const secret = process.env.ENCRYPTION_SECRET_KEY;
  if (!secret) {
    console.error('ENCRYPTION_SECRET_KEY is not set in environment variables');
    throw new ServerError('Server configuration error');
  }

  const keyBuffer = Buffer.from(secret, 'hex');

  if (keyBuffer.length !== 32) {
    console.error('ENCRYPTION_SECRET_KEY must be 32 bytes for aes-256-cbc');
    throw new ServerError('Server configuration error');
  }

  cachedEncryptionKey = keyBuffer;
  return cachedEncryptionKey;
};

export const encrypt = async (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted + ':' + iv.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new ServerError('Something went wrong during encryption');
  }
};

export const decrypt = async (encryptedText) => {
  try {
    const [encrypted, ivHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      getEncryptionKey(),
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new ServerError('Something went wrong during decryption.');
  }
};
