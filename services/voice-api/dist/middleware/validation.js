"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validateQuery = exports.validateParams = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../utils/logger"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            logger_1.default.warn('Validation failed:', { errors: validationErrors, body: req.body });
            res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
            return;
        }
        req.body = value;
        next();
    };
};
exports.validateRequest = validateRequest;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            logger_1.default.warn('Parameter validation failed:', { errors: validationErrors, params: req.params });
            res.status(400).json({
                error: 'Invalid parameters',
                details: validationErrors
            });
            return;
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            logger_1.default.warn('Query validation failed:', { errors: validationErrors, query: req.query });
            res.status(400).json({
                error: 'Invalid query parameters',
                details: validationErrors
            });
            return;
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
exports.commonSchemas = {
    id: joi_1.default.string().uuid().required(),
    phoneNumber: joi_1.default.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
    email: joi_1.default.string().email().required(),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10)
    }),
    dateRange: joi_1.default.object({
        startDate: joi_1.default.date().iso(),
        endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate'))
    })
};
//# sourceMappingURL=validation.js.map