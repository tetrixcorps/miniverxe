"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        console.log('VALIDATION DEBUG:', { body: req.body, success: result.success, errors: result.success ? undefined : result.error.errors });
        if (!result.success) {
            res.status(400).json({ error: 'Validation failed', details: result.error.errors });
            return;
        }
        req.body = result.data; // Use parsed data
        next();
    };
}
