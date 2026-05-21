import joi from 'joi';
import { Types } from 'mongoose';
import { generalFields } from '../../common/validation/general-fields.validation.js';

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
