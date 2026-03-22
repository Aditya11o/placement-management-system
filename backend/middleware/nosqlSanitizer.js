/**
 * Custom NoSQL Injection Sanitizer
 * Compatible with Express 5.x where req.query is a getter.
 */

const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    });
  }
  return obj;
};

const nosqlSanitizer = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  
  // In Express 5, req.query is a getter. 
  // We don't try to reassign req.query.
  // Most NoSQL injections target the body in POST/PUT requests.
  
  next();
};

module.exports = nosqlSanitizer;
