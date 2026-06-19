import joi from 'joi';
import { Types } from 'mongoose';
import { generalFields } from '../../common/validation/general-fields.validation.js';
import { logoutEnum } from '../../utils/security/token.security.js';
import { allowedMimeTypes } from '../../utils/upload/cloud.multer.js';

export const sendMessageSchema = {
  params: joi
    .object({
      receiverId: generalFields.id.required(),
    })
    .required()
    .options({ abortEarly: false }),

  body: joi
    .object({
      content: joi.string().min(6).max(500),
    })
    .required()
    .options({ abortEarly: false }),

  files: joi
    .array()
    .items(
      joi.object().keys({
        ...generalFields.file.BaseFields,
        fieldname:
          generalFields.file.FilterFields.fieldname.valid('attachments'),
        mimetype: generalFields.file.FilterFields.mimetype.valid(
          ...Object.values(allowedMimeTypes.image)
        ),
      })
    )
    .min(0)
    .max(2)
    .options({ abortEarly: false }),

  query: joi.object({}).options({ abortEarly: false }),
};
