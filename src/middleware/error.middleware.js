import { errorResponse } from '../utils/response/response.js';

export const globalErrorHandler = (err, req, res, next) => {
  // ── المتغيرات الافتراضية ──────────────────────────
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'SERVER_ERROR';
  let details = err.details || null;

  // ── MongoDB Errors ────────────────────────────────
  // ID بصيغة غلط (مش ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  // Duplicate key (unique field موجود بالفعل)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
    code = 'DUPLICATE_FIELD';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');
    code = 'VALIDATION_ERROR';
  }

  // ── JWT Errors ────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // ── Logging (development فقط) ─────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', { statusCode, message, code, stack: err.stack });
  }

  // ── Response ──────────────────────────────────────
  errorResponse({ res, statusCode, message, code, details });
};

// 404 Handler — أي route مش موجود

export const notFoundHandler = (req, res, next) => {
  errorResponse({
    res,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found ❌`,
    code: 'ROUTE_NOT_FOUND',
  });
};
