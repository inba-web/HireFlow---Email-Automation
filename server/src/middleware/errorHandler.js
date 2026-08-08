import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.isPublic ? err.message : (statusCode === 500 ? 'Internal Server Error' : err.message);

  logger.error(`[${requestId}] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Error: ${err.message}`, {
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    requestId,
  });

  res.status(statusCode).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: message || 'An unexpected error occurred while processing your request.',
    requestId,
    ...(config.NODE_ENV === 'development' && { details: err.message, stack: err.stack }),
  });
}
