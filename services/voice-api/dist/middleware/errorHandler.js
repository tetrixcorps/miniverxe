"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatExternalServiceError = exports.formatDatabaseError = exports.formatValidationError = exports.errorMonitoring = exports.gracefulShutdownHandler = exports.uncaughtExceptionHandler = exports.unhandledRejectionHandler = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.ConfigurationError = exports.DatabaseError = exports.ExternalServiceError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, true, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, true, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, true, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, true, 'NOT_FOUND_ERROR');
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, true, 'CONFLICT_ERROR');
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, true, 'RATE_LIMIT_ERROR');
    }
}
exports.RateLimitError = RateLimitError;
class ExternalServiceError extends AppError {
    constructor(service, message = 'External service error') {
        super(`${service}: ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR', { service });
    }
}
exports.ExternalServiceError = ExternalServiceError;
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, true, 'DATABASE_ERROR');
    }
}
exports.DatabaseError = DatabaseError;
class ConfigurationError extends AppError {
    constructor(message = 'Configuration error') {
        super(message, 500, true, 'CONFIGURATION_ERROR');
    }
}
exports.ConfigurationError = ConfigurationError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_ERROR';
    let details = undefined;
    let isOperational = false;
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        code = error.code || 'APP_ERROR';
        details = error.details;
        isOperational = error.isOperational;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
        details = error.message;
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        code = 'CAST_ERROR';
    }
    else if (error.name === 'MongoError' || error.name === 'MongooseError') {
        statusCode = 500;
        message = 'Database error';
        code = 'DATABASE_ERROR';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'JWT_ERROR';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'JWT_EXPIRED';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        message = 'File upload error';
        code = 'UPLOAD_ERROR';
        details = error.message;
    }
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    const logData = {
        message: error.message,
        stack: error.stack,
        statusCode,
        code,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id'],
        details
    };
    logger_1.default[logLevel]('Error occurred', logData);
    const errorResponse = {
        error: {
            message,
            code,
            statusCode,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            requestId: req.headers['x-request-id'],
            details: process.env.NODE_ENV === 'development' ? details : undefined,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        success: false
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const unhandledRejectionHandler = (reason, promise) => {
    logger_1.default.error('Unhandled Promise Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString()
    });
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
};
exports.unhandledRejectionHandler = unhandledRejectionHandler;
const uncaughtExceptionHandler = (error) => {
    logger_1.default.error('Uncaught Exception', {
        message: error.message,
        stack: error.stack
    });
    process.exit(1);
};
exports.uncaughtExceptionHandler = uncaughtExceptionHandler;
const gracefulShutdownHandler = (signal) => {
    logger_1.default.info(`Received ${signal}. Starting graceful shutdown...`);
    if (global.server) {
        global.server.close(() => {
            logger_1.default.info('HTTP server closed');
            logger_1.default.info('Graceful shutdown completed');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
};
exports.gracefulShutdownHandler = gracefulShutdownHandler;
exports.errorMonitoring = {
    trackError: (error, context = {}) => {
        logger_1.default.error('Error tracked', {
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                stack: error.stack
            },
            context,
            timestamp: new Date().toISOString()
        });
    },
    trackPerformance: (operation, duration, success) => {
        logger_1.default.info('Performance tracked', {
            operation,
            duration,
            success,
            timestamp: new Date().toISOString()
        });
    }
};
const formatValidationError = (error) => {
    if (error.details && Array.isArray(error.details)) {
        const details = error.details.map((detail) => ({
            field: detail.path?.join('.') || 'unknown',
            message: detail.message,
            value: detail.context?.value
        }));
        return new ValidationError('Validation failed', details);
    }
    return new ValidationError(error.message || 'Validation failed');
};
exports.formatValidationError = formatValidationError;
const formatDatabaseError = (error) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        return new ConflictError(`${field} already exists`);
    }
    if (error.name === 'ValidationError') {
        return (0, exports.formatValidationError)(error);
    }
    return new DatabaseError(error.message || 'Database operation failed');
};
exports.formatDatabaseError = formatDatabaseError;
const formatExternalServiceError = (service, error) => {
    let message = 'External service error';
    if (error.response) {
        message = `HTTP ${error.response.status}: ${error.response.statusText}`;
    }
    else if (error.code) {
        message = `${error.code}: ${error.message}`;
    }
    return new ExternalServiceError(service, message);
};
exports.formatExternalServiceError = formatExternalServiceError;
//# sourceMappingURL=errorHandler.js.map