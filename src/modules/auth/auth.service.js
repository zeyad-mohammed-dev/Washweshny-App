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
        OtpCounter: 1,
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

   if (user.deletedAt) {
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
      $unset: {
        confirmEmailOtp: 1,
        confirmEmailOtpExpiresAt: 1,
        OtpCounter: 1,
      },
      $inc: { __v: 1 },
    },
  });
  if (!updatedUser.modifiedCount) {
    throw new ServerError('Failed to confirm email, please try again');
  }

  return;
};

export const requestConfirmEmailOTP = async ({ email }) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      confirmEmailOtpExpiresAt: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
  });
  if (!user) {
    throw new NotFoundError('User not exist or already confirmed');
  }

  if (user.confirmEmailOtpExpiresAt > Date.now()) {
    throw new UnprocessableError(
      'OTP not expired yet, please use the previous OTP or wait until it expires to request new one'
    );
  }

  if (user.OtpCounter && user.OtpCounter % 3 == 0 && !user.freezedAt) {
    user.freezedAt = Date.now() + 10 * 60 * 1000;
    user.__v += 1;
    await user.save();
    throw new UnprocessableError(
      'You have requested OTP many times, your account is freezed for 10 minutes'
    );
  } else {
    user.OtpCounter += 1;
  }
  const otp = generateOTP();

  if (user.freezedAt && user.freezedAt < Date.now()) {
    const updatedUser = await DbService.findOneAndUpdate({
      model: UserModel,
      filter: {
        email,
        confirmEmail: { $exists: false },
        confirmEmailOtp: { $exists: true },
        confirmEmailOtpExpiresAt: { $exists: true },
        deletedAt: { $exists: false },
        provider: providerEnum.system,
        freezedAt: { $exists: true },
      },
      data: {
        $unset: { freezedAt: 1 },
        OtpCounter: user.OtpCounter,
        confirmEmailOtp: await generateHash({ plainText: otp }),
        confirmEmailOtpExpiresAt: Date.now() + 10 * 60 * 1000,
      },
    });
    if (!updatedUser) {
      throw new ServerError('Failed to request OTP, please try again');
    }

    emailEmitter.emit('sendVerificationEmail', {
      to: user.email,
      firstName: user.firstName,
      otp,
    });
    return;
  } else if (user.freezedAt) {
    throw new UnprocessableError(
      `Your account is freezed, please wait ${Math.floor((user.freezedAt - Date.now()) / 60000)} minutes before requesting new OTP`
    );
  }

  const hashOTP = await generateHash({ plainText: otp });
  const confirmEmailOtpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  user.confirmEmailOtp = hashOTP;
  user.confirmEmailOtpExpiresAt = confirmEmailOtpExpiresAt;

  await user.save();

  emailEmitter.emit('sendVerificationEmail', {
    to: user.email,
    firstName: user.firstName,
    otp,
  });

  return;
};

export const requestForgotPasswordOTP = async ({ email }) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
  });
  if (!user) {
    throw new NotFoundError('User not exist or not confirmed');
  }

  const otp = generateOTP();
  const hashOTP = await generateHash({ plainText: otp });
  const forgetPasswordOtpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  user.forgetPasswordOtp = hashedOTP;
  user.forgetPasswordOtpExpiresAt = forgetPasswordOtpExpiresAt;

  await user.save();

  emailEmitter.emit('sendPasswordResetEmail', {
    to: user.email,
    firstName: user.firstName,
    otp,
  });

  return;
};

export const confirmForgotPasswordOTP = async ({ email, otp }) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      forgetPasswordOtp: { $exists: true },
      forgetPasswordOtpExpiresAt: { $exists: true },
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found or email not confirmed');
  }

  const isOTPMatch = await compareHash({
    plainText: otp,
    hashedText: user.forgetPasswordOtp,
  });
  if (!isOTPMatch) {
    throw new ValidationError('Invalid OTP');
  }
  if (user.confirmEmailOtpExpiresAt < Date.now()) {
    throw new UnprocessableError('OTP expired , please send it again');
  }

  return;
};

export const resetPassword = async ({ email, otp, password }) => {
  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      forgetPasswordOtp: { $exists: true },
      forgetPasswordOtpExpiresAt: { $exists: true },
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found or email not confirmed');
  }

  const isOTPMatch = await compareHash({
    plainText: otp,
    hashedText: user.forgetPasswordOtp,
  });
  if (!isOTPMatch) {
    throw new ValidationError('Invalid OTP');
  }
  if (user.confirmEmailOtpExpiresAt < Date.now()) {
    throw new UnprocessableError('OTP expired , please send it again');
  }

  const hashPassword = await generateHash({ plainText: password });

  const updatedUser = await DbService.updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: hashPassword,
      changeCredentialsTime: Date.now(),
      $unset: { forgetPasswordOtp: 1, forgetPasswordOtpExpiresAt: 1 },
      $inc: { __v: 1 },
    },
  });
  if (!updatedUser.modifiedCount) {
    throw new ServerError('Failed to reset password, please try again');
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
