/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP
 * 
 * Note: For production, consider using express-rate-limit package
 * This is a simple implementation
 */

import { config } from '../config/index.js';

const requestCounts = new Map();
const RATE_LIMIT_WINDOW = config.rateLimit.windowMs;
const MAX_REQUESTS = config.rateLimit.maxRequests;

export const rateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  // Clean up old entries
  if (requestCounts.has(clientIp)) {
    const { count, resetTime } = requestCounts.get(clientIp);
    if (now > resetTime) {
      requestCounts.delete(clientIp);
    }
  }

  // Check rate limit
  if (requestCounts.has(clientIp)) {
    const { count, resetTime } = requestCounts.get(clientIp);
    if (count >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((resetTime - now) / 1000),
        },
      });
    }
    requestCounts.set(clientIp, { count: count + 1, resetTime });
  } else {
    requestCounts.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
  }

  next();
};

