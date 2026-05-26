import joi from 'joi';
import { Types } from 'mongoose';
import { generalFields } from '../../common/validation/general-fields.validation.js';
import { logoutEnum } from '../../utils/security/token.security.js';

export const logoutSchema = {
  body: joi
    .object()
    .keys({
      flag: joi.string().valid(...Object.values(logoutEnum)),
    })
    .required()
    .options({ abortEarly: false }),

  params: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const getProfileByIdSchema = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id.required(),
    })
    .required()
    .options({ abortEarly: false }),

  body: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const updateMyProfileSchema = {
  body: joi
    .object()
    .keys({
      firstName: generalFields.firstName,
      lastName: generalFields.lastName,
      gender: generalFields.gender,
      phone: generalFields.phone,
      age: generalFields.age,
    })
    .required()
    .options({ abortEarly: false }),

  params: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const updatePasswordSchema = {
  body: logoutSchema.body
    .append({
      oldPassword: generalFields.password.required(),
      newPassword: generalFields.password
        .not(joi.ref('oldPassword'))
        .required(),
      confirmPassword: joi.string().valid(joi.ref('newPassword')).required(),
    })
    .required()
    .options({ abortEarly: false }),

  params: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const freezeAccountSchema = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id,
    })
    .required()
    .options({ abortEarly: false }),

  body: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const restoreAccountSchema = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id.required(),
    })
    .required()
    .options({ abortEarly: false }),

  body: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const deleteAccountSchema = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id.required(),
    })
    .required()
    .options({ abortEarly: false }),

  body: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};
