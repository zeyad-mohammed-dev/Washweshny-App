import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

// allowUnknown: false is set to prevent extra fields from being sent in the request body and its default value is false.

export const loginSchema = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required()
    .options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
  params: joi.object({}).options({ abortEarly: false }),
};

export const signupSchema = {
  body: loginSchema.body
    .append({
      fullName: generalFields.fullName.required(),
      confirmPassword: generalFields.confirmPassword.required(),
      phone: generalFields.phone.required(),
    })
    .required()
    .options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
  params: joi.object({}).options({ abortEarly: false }),
};

export const confirmEmailSchema = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required()
    .options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
  params: joi.object({}).options({ abortEarly: false }),
};

export const loginWithGoogleSchema = {
  body: joi
    .object()
    .keys({
      idToken: joi.string().required(),
    })
    .required()
    .options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
  params: joi.object({}).options({ abortEarly: false }),
};
