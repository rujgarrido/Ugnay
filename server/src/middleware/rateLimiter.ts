import rateLimit from 'express-rate-limit';

const createRateLimiter = (
  windowMs: number,
  limit: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      status: 429,
      message,
    },
  });
};

// Rate limiter for general API requests, allowing 100 requests per 15 minutes
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests. Please try again later.'
);

// Rate limiter specifically for login attempts, allowing 5 attempts in 15 minutes
export const loginRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many login attempts. Please try again later.'
);

// Rate limiter specifically for registration attempts, allowing 10 attempts in 15 minutes
export const registerRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many registration attempts. Please try again later.'
);