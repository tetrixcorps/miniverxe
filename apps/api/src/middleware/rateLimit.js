"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.rateLimitLogger = exports.taskSubmissionRateLimiter = exports.uploadRateLimiter = exports.authRateLimiter = exports.apiRateLimiter = exports.userRateLimiter = exports.baseRateLimiter = void 0;
exports.createCustomRateLimiter = createCustomRateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
// Initialize Redis connection
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.redis = redis;
// Create Redis store with proper typing
const createRedisStore = () => {
    return new rate_limit_redis_1.default({
        sendCommand: (command, ...args) => {
            return redis.call(command, ...args);
        },
    });
};
// Base rate limiter for all requests
exports.baseRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
});
// User-specific rate limiter based on user group and subscription
exports.userRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
        var _a;
        const user = req.user;
        if (!user)
            return 50; // Default for unauthenticated
        // Customize limits based on user group and subscription
        switch (user.userGroup) {
            case 'enterprise':
                return ((_a = user.metadata) === null || _a === void 0 ? void 0 : _a.rateLimit) || 1000;
            case 'academy':
                return 200;
            case 'data-annotator':
                return 500;
            default:
                return 100;
        }
    },
    keyGenerator: (req) => { var _a; return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || 'unknown'; },
    message: 'Rate limit exceeded for this user',
    standardHeaders: true,
    legacyHeaders: false,
});
// API-specific rate limiter for expensive operations
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore(),
    windowMs: 60 * 1000, // 1 minute
    max: (req) => {
        var _a;
        const user = req.user;
        if (!user)
            return 10;
        // API calls are more expensive
        switch (user.userGroup) {
            case 'enterprise':
                return ((_a = user.metadata) === null || _a === void 0 ? void 0 : _a.apiRateLimit) || 100;
            case 'academy':
                return 20;
            case 'data-annotator':
                return 50;
            default:
                return 10;
        }
    },
    keyGenerator: (req) => { var _a; return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || 'unknown'; },
    message: 'API rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
});
// Authentication rate limiter
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: 'Too many authentication attempts',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
});
// File upload rate limiter
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore(),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: (req) => {
        const user = req.user;
        if (!user)
            return 5;
        switch (user.userGroup) {
            case 'enterprise':
                return 50;
            case 'academy':
                return 10;
            case 'data-annotator':
                return 20;
            default:
                return 5;
        }
    },
    keyGenerator: (req) => { var _a; return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || 'unknown'; },
    message: 'Upload rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
});
// Task submission rate limiter
exports.taskSubmissionRateLimiter = (0, express_rate_limit_1.default)({
    store: createRedisStore(),
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: (req) => {
        const user = req.user;
        if (!user)
            return 5;
        switch (user.userGroup) {
            case 'enterprise':
                return 100;
            case 'academy':
                return 20;
            case 'data-annotator':
                return 50;
            default:
                return 10;
        }
    },
    keyGenerator: (req) => { var _a; return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || 'unknown'; },
    message: 'Task submission rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
});
// Custom rate limiter factory
function createCustomRateLimiter(options) {
    return (0, express_rate_limit_1.default)({
        store: createRedisStore(),
        windowMs: options.windowMs,
        max: options.max,
        keyGenerator: options.keyGenerator || ((req) => { var _a; return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || 'unknown'; }),
        message: options.message || 'Rate limit exceeded',
        standardHeaders: true,
        legacyHeaders: false,
    });
}
// Rate limit monitoring and logging
exports.rateLimitLogger = {
    logRateLimitExceeded: (req, res) => {
        var _a, _b;
        console.log('Rate limit exceeded:', {
            ip: req.ip,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            userGroup: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userGroup,
            endpoint: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
    },
    logRateLimitReset: (req) => {
        var _a, _b;
        console.log('Rate limit reset:', {
            ip: req.ip,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            userGroup: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userGroup,
            endpoint: req.path,
            timestamp: new Date().toISOString(),
        });
    },
};
