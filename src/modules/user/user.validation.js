import joi from 'joi';
import { Types } from 'mongoose';
import { generalFields } from '../../common/validation/general-fields.validation.js';
import { logoutEnum } from '../../utils/security/token.security.js';
import { allowedMimeTypes } from '../../utils/upload/cloud.multer.js';

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

export const uploadProfileImageSchema = {
  file: joi
    .object()
    .keys({
      ...generalFields.file.BaseFields,
      fieldname: generalFields.file.FilterFields.fieldname.valid('image'),
      mimetype: generalFields.file.FilterFields.mimetype.valid(
        ...Object.values(allowedMimeTypes.image)
      ),
    })
    .required()
    .options({ abortEarly: false }),

  body: joi.object({}).options({ abortEarly: false }),
  params: joi.object({}).options({ abortEarly: false }),
  query: joi.object({}).options({ abortEarly: false }),
};

export const uploadCoverImagesSchema = {
  files: joi
    .array()
    .items(
      joi
        .object()
        .keys({
          ...generalFields.file.BaseFields,
          fieldname: generalFields.file.FilterFields.fieldname.valid('images'),
          mimetype: generalFields.file.FilterFields.mimetype.valid(
            ...Object.values(allowedMimeTypes.image)
          ),
        })
        .required()
    )
    .min(1)
    .max(2)
    .required()
    .options({ abortEarly: false }),
  body: joi.object({}).options({ abortEarly: false }),
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
