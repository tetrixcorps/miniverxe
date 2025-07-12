"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
/**
 * Express middleware to validate request bodies (or query/params) with a Zod schema.
 * Usage: router.post('/route', validateBody(schema), handler)
 */
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: 'Invalid request payload',
                code: 'invalid_payload',
                details: result.error.errors,
            });
            return;
        }
        // Attach parsed data for downstream handlers if desired
        req.validatedBody = result.data;
        next();
    };
}
/**
 * Optionally, add similar middleware for query or params validation if needed.
 */
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            res.status(400).json({
                error: 'Invalid query parameters',
                code: 'invalid_query',
                details: result.error.errors,
            });
            return;
        }
        req.validatedQuery = result.data;
        next();
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            res.status(400).json({
                error: 'Invalid route parameters',
                code: 'invalid_params',
                details: result.error.errors,
            });
            return;
        }
        req.validatedParams = result.data;
        next();
    };
}
