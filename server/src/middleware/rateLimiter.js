import rateLimit from 'express-rate-limit';

export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

export const campaignSendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 bulk dispatch calls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'CAMPAIGN_SEND_RATE_LIMITED',
    message: 'Campaign dispatch rate limit reached. Please wait before triggering another bulk send.',
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: {
    success: false,
    code: 'UPLOAD_RATE_LIMITED',
    message: 'Too many file uploads, please try again shortly.',
  },
});
