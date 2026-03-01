const morgan = require('morgan');
const logger = require('../utils/logger');

// Override the stream method to tell Morgan to use our custom logger instead of the console.log
const stream = {
    write: (message) => logger.http(message.trim()),
};

const skip = () => {
    const env = process.env.NODE_ENV || 'development';
    return env !== 'development'; // You can change this to only log errors in production
};

const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream, skip }
);

module.exports = morganMiddleware;
