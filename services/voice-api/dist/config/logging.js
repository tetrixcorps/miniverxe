"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.errorLogger = exports.systemLogger = exports.businessLogger = exports.securityLogger = exports.performanceLogger = exports.createContextLogger = exports.morganStream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const transports = [];
transports.push(new winston_1.default.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
}));
if (process.env.NODE_ENV === 'production') {
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }));
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }));
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'access.log'),
        level: 'http',
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }));
}
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    transports,
    exitOnError: false,
});
exports.morganStream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
const createContextLogger = (context) => {
    return {
        error: (message, meta) => logger.error(`[${context}] ${message}`, meta),
        warn: (message, meta) => logger.warn(`[${context}] ${message}`, meta),
        info: (message, meta) => logger.info(`[${context}] ${message}`, meta),
        http: (message, meta) => logger.http(`[${context}] ${message}`, meta),
        debug: (message, meta) => logger.debug(`[${context}] ${message}`, meta),
    };
};
exports.createContextLogger = createContextLogger;
exports.performanceLogger = {
    startTimer: (operation) => {
        const start = Date.now();
        return {
            end: (success = true, meta) => {
                const duration = Date.now() - start;
                logger.info(`Performance: ${operation}`, {
                    duration: `${duration}ms`,
                    success,
                    ...meta,
                });
                return duration;
            },
        };
    },
};
exports.securityLogger = {
    authAttempt: (ip, user, success, reason) => {
        logger.warn('Authentication attempt', {
            ip,
            user,
            success,
            reason,
            timestamp: new Date().toISOString(),
        });
    },
    suspiciousActivity: (ip, activity, details) => {
        logger.error('Suspicious activity detected', {
            ip,
            activity,
            details,
            timestamp: new Date().toISOString(),
        });
    },
    rateLimitExceeded: (ip, endpoint, limit) => {
        logger.warn('Rate limit exceeded', {
            ip,
            endpoint,
            limit,
            timestamp: new Date().toISOString(),
        });
    },
};
exports.businessLogger = {
    callStarted: (callId, tenantId, phoneNumber) => {
        logger.info('Call started', {
            callId,
            tenantId,
            phoneNumber,
            timestamp: new Date().toISOString(),
        });
    },
    callEnded: (callId, duration, status) => {
        logger.info('Call ended', {
            callId,
            duration,
            status,
            timestamp: new Date().toISOString(),
        });
    },
    tenantCreated: (tenantId, plan, industry) => {
        logger.info('Tenant created', {
            tenantId,
            plan,
            industry,
            timestamp: new Date().toISOString(),
        });
    },
    paymentProcessed: (tenantId, amount, currency, status) => {
        logger.info('Payment processed', {
            tenantId,
            amount,
            currency,
            status,
            timestamp: new Date().toISOString(),
        });
    },
};
exports.systemLogger = {
    serviceStarted: (service, port) => {
        logger.info('Service started', {
            service,
            port,
            timestamp: new Date().toISOString(),
        });
    },
    serviceStopped: (service, reason) => {
        logger.info('Service stopped', {
            service,
            reason,
            timestamp: new Date().toISOString(),
        });
    },
    databaseConnected: (database) => {
        logger.info('Database connected', {
            database,
            timestamp: new Date().toISOString(),
        });
    },
    databaseDisconnected: (database, reason) => {
        logger.warn('Database disconnected', {
            database,
            reason,
            timestamp: new Date().toISOString(),
        });
    },
    redisConnected: () => {
        logger.info('Redis connected', {
            timestamp: new Date().toISOString(),
        });
    },
    redisDisconnected: (reason) => {
        logger.warn('Redis disconnected', {
            reason,
            timestamp: new Date().toISOString(),
        });
    },
};
exports.errorLogger = {
    logError: (error, context = {}) => {
        logger.error('Error occurred', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            context,
            timestamp: new Date().toISOString(),
        });
    },
    logValidationError: (field, value, message) => {
        logger.warn('Validation error', {
            field,
            value,
            message,
            timestamp: new Date().toISOString(),
        });
    },
    logExternalServiceError: (service, error, request) => {
        logger.error('External service error', {
            service,
            error: error.message || error,
            request,
            timestamp: new Date().toISOString(),
        });
    },
};
exports.requestLogger = {
    logRequest: (req, res, responseTime) => {
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length'),
            timestamp: new Date().toISOString(),
        };
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        }
        else {
            logger.http('HTTP Request', logData);
        }
    },
};
exports.default = logger;
//# sourceMappingURL=logging.js.map