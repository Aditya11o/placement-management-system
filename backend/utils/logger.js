const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

// ─── Log directory setup ───────────────────────────────────────
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';

// ─── Rotating file streams ────────────────────────────────────
// Rotates daily, keeps 14 days of logs, compresses old files
const createRotatingStream = (filename) =>
  rfs.createStream(filename, {
    interval: '1d',     // rotate daily
    path: logDirectory,
    maxFiles: 14,       // keep 2 weeks
    compress: 'gzip',   // compress rotated files
  });

const errorStream = createRotatingStream('error.log');
const accessStream = createRotatingStream('access.log');
const combinedStream = createRotatingStream('combined.log');

// ─── Structured JSON format for morgan ─────────────────────────
// Produces one JSON object per request — easy to parse, grep, and ingest
morgan.token('body-size', (req, res) => {
  const cl = res.getHeader('content-length');
  return cl || '0';
});

const jsonFormat = (tokens, req, res) => {
  const entry = {
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res), 10) || 0,
    responseTime: `${tokens['response-time'](req, res)}ms`,
    contentLength: tokens['body-size'](req, res),
    ip: tokens['remote-addr'](req, res),
    userAgent: tokens['user-agent'](req, res),
  };
  // Attach userId if authenticated
  if (req.user?.id) entry.userId = req.user.id;
  return JSON.stringify(entry);
};

// ─── Dev-friendly colored format ───────────────────────────────
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// ─── Morgan middleware factory ─────────────────────────────────
/**
 * Returns an array of morgan middlewares:
 *  1. Console logger (dev-colored in dev, JSON in prod)
 *  2. File logger  (JSON → access.log, rotated daily)
 */
const createRequestLogger = () => {
  const middlewares = [];

  // 1) Console output
  if (isProduction) {
    // Production: structured JSON to stdout (for log aggregators)
    middlewares.push(morgan(jsonFormat, { stream: process.stdout }));
  } else {
    // Development: colorful short format to stdout
    middlewares.push(morgan(devFormat));
  }

  // 2) File output — always JSON for parseability, written to rotating access.log
  middlewares.push(
    morgan(jsonFormat, {
      stream: accessStream,
      // Skip logging for health-check / static assets to reduce noise
      skip: (req) => req.originalUrl === '/' || req.originalUrl.startsWith('/uploads'),
    })
  );

  return middlewares;
};

// ─── Application logger (error, warn, info) ────────────────────
// Replaces the old logger with structured JSON output + rotation
const logger = {
  error: (err, req) => {
    const entry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      method: req?.method || 'N/A',
      url: req?.originalUrl || 'N/A',
      userId: req?.user?.id || null,
      message: err.message || String(err),
      stack: isProduction ? undefined : (err.stack || null),
    };
    const line = JSON.stringify(entry) + '\n';
    errorStream.write(line);
    combinedStream.write(line);
  },

  warn: (message, meta = {}) => {
    const entry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    };
    const line = JSON.stringify(entry) + '\n';
    combinedStream.write(line);
    if (!isProduction) console.warn(`[WARN] ${message}`);
  },

  info: (message, meta = {}) => {
    const entry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    };
    const line = JSON.stringify(entry) + '\n';
    combinedStream.write(line);
    if (!isProduction) console.log(`[INFO] ${message}`);
  },
};

module.exports = logger;
module.exports.createRequestLogger = createRequestLogger;
