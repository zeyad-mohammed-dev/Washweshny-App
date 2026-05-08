import { OAuth2Client } from 'google-auth-library';
import * as DbService from '../../DB/db.service.js';
import {
  providerEnum,
  roleEnum,
  UserModel,
} from '../../DB/models/user.model.js';
import { decrypt, encrypt } from '../../utils/Security/encryption.security.js';
import {
  compareHash,
  generateHash,
} from '../../utils/Security/hash.security.js';
import { asyncHandler, successHandler } from '../../utils/response/response.js';
import {
  authSchemeEnum,
  generateLoginCredentials,
  generateToken,
  getSecretKey,
} from '../../utils/security/token.security.js';

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
  const [user] = await DbService.create({
    model: UserModel,
    data: [
      { fullName, email, password: hashPassword, phone: await encrypt(phone) },
    ],
  });
  return successHandler({ res, status: 201, data: { user } });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DbService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.system },
  });

  if (!user) {
    return next(new Error('in-valid email or password', { cause: 404 }));
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

export async function verifyIdToken({ idToken } = {}) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_IDs.split(','),
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGoogle = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { name, email, email_verified, picture } = await verifyIdToken({
    idToken,
  });

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
