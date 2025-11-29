import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login, register).
 * More restrictive to prevent brute force attacks.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        error: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for general API endpoints.
 * Less restrictive for normal operations.
 */
export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: 'Too many requests. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for write operations (POST, PUT, DELETE).
 * More restrictive than read operations.
 */
export const writeRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 write requests per minute
    message: {
        error: 'Too many write operations. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for sensitive operations like registration.
 * Very restrictive to prevent abuse.
 */
export const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour
    message: {
        error: 'Too many registration attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
