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
