import joi from 'joi';

export const generalFields = {
  fullName: joi.string().min(3).max(30),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ['com', 'eg', 'net', 'org', 'edu'] },
  }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmPassword: joi.string().valid(joi.ref('password')),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
};
