import { asyncHandler } from '../utils/response/response.js';

export const validationMiddleware = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const errors = [];
    for (const key in schema) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        errors.push({
          key,
          details: validationResult.error.details.map((obj) => {
            return { message: obj.message, path: obj.path[0] };
          }),
        });
      }
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    return next();
  });
};
