const logger = require('../utils/logger');
const config = require('../config/config');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Intercept Soft Delete "Aborted" success message from plugin
    if (err.message === 'SOFT_DELETE_TRIGGERED_SUCCESSFULLY') {
        return res.status(200).json({
            success: true,
            message: 'Resource deleted and moved to archive successfully'
        });
    }

    // Log for dev using Winston (always log the full error)
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.path });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new Error(message);
        error.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new Error(message);
        error.statusCode = 400;
    }

    // Determine the status code
    const statusCode = error.statusCode || 500;

    // Redaction for production environment
    // Only return the actual message if it's a client error (4xx) or if in development
    let responseMessage = error.message || 'Server Error';
    if (config.get('env') === 'production' && statusCode >= 500) {
        responseMessage = 'Internal Server Error';
    }

    res.status(statusCode).json({
        success: false,
        error: responseMessage
    });
};

module.exports = errorHandler;
