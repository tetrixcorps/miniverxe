import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
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