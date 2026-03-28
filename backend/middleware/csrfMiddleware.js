const crypto = require('crypto');

/**
 * CSRF Protection using the Double Submit Cookie pattern.
 *
 * How it works:
 * 1. On every response, the server sets a `XSRF-TOKEN` cookie (readable by JS).
 * 2. The frontend reads this cookie and sends it back as the `x-csrf-token` header.
 * 3. On state-changing requests (POST, PUT, DELETE, PATCH), the server verifies
 *    that the header value matches the cookie value.
 *
 * An attacker on a different origin cannot read the cookie (same-origin policy),
 * so they cannot forge the header — stopping CSRF attacks.
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Routes that are exempt from CSRF checks (public auth endpoints)
const EXEMPT_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

const csrfProtection = (req, res, next) => {
  // Always set/refresh the CSRF token cookie so the frontend can read it
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,       // Must be readable by frontend JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  // Only validate on state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip validation for exempt routes (public auth endpoints)
  if (EXEMPT_ROUTES.some(route => req.originalUrl.startsWith(route))) {
    return next();
  }

  // Validate: the header must match the cookie
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'CSRF token validation failed' });
  }

  next();
};

module.exports = csrfProtection;
