/**
 * Custom XSS Sanitizer
 * Compatible with Express 5.x where req.query is a getter.
 */

// Simple function to sanitize strings (can be expanded with a library like 'xss' if needed)
const cleanValue = (val) => {
  if (typeof val !== 'string') return val;
  // Basic HTML tag removal/encoding
  return val
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/on\w+="[^"]*"/gim, "")
    .replace(/on\w+='[^']*'/gim, "");
};

const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      } else {
        obj[key] = cleanValue(obj[key]);
      }
    });
  }
  return obj;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  
  // Skip req.query in Express 5 as it's a getter
  next();
};

module.exports = xssSanitizer;
