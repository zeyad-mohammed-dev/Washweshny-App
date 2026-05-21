import joi from 'joi';
import { Types } from 'mongoose';

export const generalFields = {
  fullName: joi
    .string()
    .pattern(new RegExp(/^[A-Z][a-z]{1,19}\s{1}[A-Z][a-z]{1,19}$/)),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ['com', 'eg', 'net', 'org', 'edu'] },
  }),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-])[A-Za-z\d@$!%*?&#^()_+=\-]{8,30}$/
      )
    ),
  confirmPassword: joi.string().valid(joi.ref('password')),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  otp: joi.string().pattern(new RegExp(/^\d{6}$/)),

  id: joi.string().custom((value, helpers) => {
    return Types.ObjectId.isValid(value) || helpers.message('in-valid Id');
  }, 'mongoDB Id Validation'),
};
