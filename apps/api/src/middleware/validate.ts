import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Express middleware to validate request bodies (or query/params) with a Zod schema.
 * Usage: router.post('/route', validateBody(schema), handler)
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
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
    (req as any).validatedBody = result.data;
    next();
  };
}

/**
 * Optionally, add similar middleware for query or params validation if needed.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        code: 'invalid_query',
        details: result.error.errors,
      });
      return;
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid route parameters',
        code: 'invalid_params',
        details: result.error.errors,
      });
      return;
    }
    (req as any).validatedParams = result.data;
    next();
  };
} 