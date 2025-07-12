import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error (could be enhanced with a logger)
  console.error('API ERROR:', err);
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Unknown error';
  res.status(status).json({ error: message });
} 