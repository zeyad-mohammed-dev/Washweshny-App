import { OAuth2Client } from 'google-auth-library';
import * as DbService from '../../DB/db.service.js';
import { providerEnum, UserModel } from '../../DB/models/user.model.js';
import { decrypt, encrypt } from '../../utils/security/encryption.security.js';
import {
  compareHash,
  generateHash,
} from '../../utils/security/hash.security.js';
import { asyncHandler, successHandler } from '../../utils/response/response.js';
import { generateLoginCredentials } from '../../utils/security/token.security.js';
import { customAlphabet, nanoid } from 'nanoid';
import { sendEmail } from '../../utils/email/email.service.js';
import { verifyEmailTemplate } from '../../utils/email/templates/verify-email.template.js';
import { emailEmitter } from '../../utils/events/email.event.js';
import { model } from 'mongoose';
export const generateOTP = customAlphabet('1234567890', 6);

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const checkUserExist = await DbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (checkUserExist) {
    return next(new Error('email already exist', { cause: 409 }));
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
  return successHandler({
    res,
    status: 201,
    message: 'User registered successfully, please check your email to confirm',
    data: { email: user.email },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
    },
  });

  if (!user) {
    return next(new Error('in-valid email or password', { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(
      new Error('Please confirm your email before logging in', { cause: 400 })
    );
  }

  const isPasswordMatched = await compareHash({
    plainText: password,
    hashedText: user.password,
  });

  if (!isPasswordMatched) {
    return next(new Error('in-valid email or password', { cause: 404 }));
  }

  const credentials = await generateLoginCredentials({ user });
  return successHandler({ res, data: { credentials } });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

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
    return next(
      new Error('user not found or email already confirmed', { cause: 404 })
    );
  }

  const isOTPMatch = await compareHash({
    plainText: otp,
    hashedText: user.confirmEmailOtp,
  });
  if (!isOTPMatch) {
    return next(new Error('Invalid OTP', { cause: 400 }));
  }

  if (user.confirmEmailOtpExpiresAt < Date.now()) {
    return next(
      new Error('OTP expired , please send it again', { cause: 400 })
    );
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
    return next(
      new Error('Failed to confirm email, please try again', { cause: 500 })
    );
  }
  return successHandler({
    res,
    data: { message: 'Email confirmed successfully' },
  });
});

export async function verifyIdToken({ idToken } = {}) {
  const client = new OAuth2Client();
  const googleClientIdsEnv = process.env.GOOGLE_CLIENT_IDs;

  if (!googleClientIdsEnv || !googleClientIdsEnv.trim()) {
    throw new Error(
      'No Google Client IDs provides on the env please check it again',
      { cause: 404 }
    );
  }

  const googleClientIds = googleClientIdsEnv
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean);

  if (googleClientIds.length === 0) {
    throw new Error(
      'No Google Client IDs provides on the env please check it again',
      { cause: 404 }
    );
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientIds,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGoogle = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { name, email, email_verified, picture } =
    (await verifyIdToken({
      idToken,
    })) || {};

  if (!email_verified) {
    return next(new Error('Email is not verified', { cause: 400 }));
  }

  const user = await DbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (user) {
    if (user.provider === providerEnum.google) {
      const credentials = await generateLoginCredentials({ user });

      return successHandler({ res, data: { credentials } });
    }
    return next(
      new Error('email already exist please login with email and password', {
        cause: 409,
      })
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

  return successHandler({ res, status: 201, data: { credentials } });
});

// export const loginWithGoogle = asyncHandler(async (req, res, next) => {
//   const { idToken } = req.body;
//   const { email, email_verified } = await verifyIdToken({
//     idToken,
//   });

//   if (!email_verified) {
//     return next(new Error('Email is not verified', { cause: 400 }));
//   }

//   const user = await DbService.findOne({
//     model: UserModel,
//     filter: { email, provider: providerEnum.google },
//   });

//   if (!user) {
//     return next(new Error('in-valid login data or provider', { cause: 404 }));
//   }

//   const credentials = await generateLoginCredentials({ user });
//   return successHandler({ res, data: { credentials } });

// });
