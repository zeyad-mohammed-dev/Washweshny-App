import { OAuth2Client } from 'google-auth-library';
import * as DbService from '../../DB/db.service.js';
import { providerEnum, UserModel } from '../../DB/models/user.model.js';
import { decrypt, encrypt } from '../../utils/security/encryption.security.js';
import {
  compareHash,
  generateHash,
} from '../../utils/security/hash.security.js';
import { successResponse } from '../../utils/response/response.js';
import { asyncHandler } from '../../utils/errors/async-handler.js';

import {
  ConflictError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  UnprocessableError,
  ValidationError,
} from '../../utils/errors/errors.js';

import { generateLoginCredentials } from '../../utils/security/token.security.js';
import { customAlphabet, nanoid } from 'nanoid';
import { sendEmail } from '../../utils/email/email.service.js';
import { verifyEmailTemplate } from '../../utils/email/templates/verify-email.template.js';
import { emailEmitter } from '../../utils/events/email.event.js';

export const generateOTP = customAlphabet('1234567890', 6);

export const signup = async ({
  fullName,
  email,
  password,
  age,
  gender,
  phone,
}) => {
  const checkUserExist = await DbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkUserExist?.provider === providerEnum.google) {
    throw new ConflictError('Email registered with Google');
  }

  if (checkUserExist) {
    throw new ConflictError('Email already registered');
  }
  const hashPassword = await generateHash({ plainText: password });
  const otp = generateOTP();
  const hashOTP = await generateHash({ plainText: otp });
  const confirmEmailOtpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  const [user] = await DbService.create({
    model: UserModel,
    data: [
      {
        fullName,
        age,
        gender,
        email,
        password: hashPassword,
        phone: await encrypt(phone),
        confirmEmailOtp: hashOTP,
        confirmEmailOtpExpiresAt,
      },
    ],
  });

  emailEmitter.emit('sendVerificationEmail', {
    to: user.email,
    firstName: user.firstName,
    otp,
  });

  return;
};
export const login = async ({ email, password }) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new UnauthorizedError('in-valid email or password');
  }

  if (!user.confirmEmail) {
    throw new UnauthorizedError('in-valid email or password');
  }

  const isPasswordMatched = await compareHash({
    plainText: password,
    hashedText: user.password,
  });

  if (!isPasswordMatched) {
    throw new UnauthorizedError('in-valid email or password');
  }

  const credentials = await generateLoginCredentials({ user });
  return credentials;
};

export const confirmEmail = async ({ email, otp }) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmailOtp: { $exists: true },
      confirmEmailOtpExpiresAt: { $exists: true },
      confirmEmail: { $exists: false },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found or email already confirmed');
  }

  const isOTPMatch = await compareHash({
    plainText: otp,
    hashedText: user.confirmEmailOtp,
  });
  if (!isOTPMatch) {
    throw new ValidationError('Invalid OTP');
  }
  if (user.confirmEmailOtpExpiresAt < Date.now()) {
    throw new UnprocessableError('OTP expired , please send it again');
  }

  const updatedUser = await DbService.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    update: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOtp: 1, confirmEmailOtpExpiresAt: 1 },
      $inc: { __v: 1 },
    },
  });
  if (!updatedUser.modifiedCount) {
    throw new ServerError('Failed to confirm email, please try again');
  }

  return;
};

export async function verifyIdToken({ idToken } = {}) {
  const client = new OAuth2Client();
  const googleClientIdsEnv = process.env.GOOGLE_CLIENT_IDs;

  if (!googleClientIdsEnv || !googleClientIdsEnv.trim()) {
    throw new ServerError('Website not configured for Google Sign-In');
  }

  const googleClientIds = googleClientIdsEnv
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean);

  if (googleClientIds.length === 0) {
    throw new ServerError('Website not configured for Google Sign-In');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientIds,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const LoginWithGoogle = async ({ idToken }) => {
  const { name, email, email_verified, picture } =
    (await verifyIdToken({
      idToken,
    })) || {};

  if (!email_verified) {
    throw new UnauthorizedError('Email is not verified');
  }
  const user = await DbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (user) {
    if (user.provider === providerEnum.google) {
      const credentials = await generateLoginCredentials({ user });

      return { credentials, statusCode: 200 };
    }
    throw new ConflictError(
      'Email already exists. Please login with email and password.'
    );
  }

  const [newUser] = await DbService.create({
    model: UserModel,
    data: [
      {
        fullName: name,
        email,
        provider: providerEnum.google,
        confirmEmail: Date.now(),
        picture,
      },
    ],
  });
  const credentials = await generateLoginCredentials({ user: newUser });

  return { credentials, statusCode: 201 };
};
