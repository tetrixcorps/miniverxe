"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityConfig = exports.securityMiddleware = exports.securityConfig = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.securityConfig = {
    helmet: (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }),
    rateLimits: {
        general: (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        }),
        auth: (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: {
                error: 'Too many authentication attempts, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        }),
        webhook: (0, express_rate_limit_1.default)({
            windowMs: 1 * 60 * 1000,
            max: 100,
            message: {
                error: 'Too many webhook requests, please try again later.',
                retryAfter: '1 minute'
            },
            standardHeaders: true,
            legacyHeaders: false,
        }),
        voice: (0, express_rate_limit_1.default)({
            windowMs: 1 * 60 * 1000,
            max: 50,
            message: {
                error: 'Too many voice requests, please try again later.',
                retryAfter: '1 minute'
            },
            standardHeaders: true,
            legacyHeaders: false,
        })
    },
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? [process.env.FRONTEND_URL || 'https://tetrix.com']
            : true,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
    },
    inputValidation: {
        maxRequestSize: '10mb',
        maxFileSize: '5mb',
        allowedFileTypes: ['audio/wav', 'audio/mp3', 'audio/mpeg', 'application/json'],
        maxArrayLength: 1000,
        maxStringLength: 10000
    },
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
};
exports.securityMiddleware = {
    validateRequestSize: (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSize = 10 * 1024 * 1024;
        if (contentLength > maxSize) {
            return res.status(413).json({
                error: 'Request entity too large',
                message: 'Request size exceeds maximum allowed limit'
            });
        }
        return next();
    },
    validateFileUpload: (req, res, next) => {
        if (req.file) {
            const allowedTypes = exports.securityConfig.inputValidation.allowedFileTypes;
            const maxSize = 5 * 1024 * 1024;
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    error: 'Invalid file type',
                    message: 'File type not allowed'
                });
            }
            if (req.file.size > maxSize) {
                return res.status(413).json({
                    error: 'File too large',
                    message: 'File size exceeds maximum allowed limit'
                });
            }
        }
        return next();
    },
    validateJsonPayload: (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            const jsonString = JSON.stringify(req.body);
            const maxLength = exports.securityConfig.inputValidation.maxStringLength;
            if (jsonString.length > maxLength) {
                return res.status(413).json({
                    error: 'Payload too large',
                    message: 'JSON payload exceeds maximum allowed size'
                });
            }
        }
        return next();
    },
    addSecurityHeaders: (req, res, next) => {
        Object.entries(exports.securityConfig.securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        next();
    }
};
const getSecurityConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    return {
        isProduction,
        isDevelopment,
        enableDetailedErrors: !isProduction,
        enableRequestLogging: isProduction,
        enableSecurityHeaders: true,
        enableRateLimiting: true,
        enableCORS: true,
        enableHelmet: true,
        maxRequestSize: isProduction ? '10mb' : '50mb',
        rateLimitWindow: isProduction ? 15 * 60 * 1000 : 60 * 1000,
        rateLimitMax: isProduction ? 1000 : 10000
    };
};
exports.getSecurityConfig = getSecurityConfig;
//# sourceMappingURL=security.js.map