import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Validation error:', {
        path: req.path,
        method: req.method,
        errors: errorDetails,
        body: req.body,
      });

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: errorDetails,
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Query validation error:', {
        path: req.path,
        method: req.method,
        errors: errorDetails,
        query: req.query,
      });

      return res.status(400).json({
        error: 'Query validation failed',
        message: 'Please check your query parameters and try again',
        details: errorDetails,
      });
    }

    // Replace req.query with validated and sanitized data
    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Params validation error:', {
        path: req.path,
        method: req.method,
        errors: errorDetails,
        params: req.params,
      });

      return res.status(400).json({
        error: 'Parameter validation failed',
        message: 'Please check your URL parameters and try again',
        details: errorDetails,
      });
    }

    // Replace req.params with validated and sanitized data
    req.params = value;
    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().cuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'title', 'rating').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    category: Joi.string().optional(),
    difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
    language: Joi.string().optional(),
  }),
};

// Sanitization helpers
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Rate limiting validation
export const validateRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This would typically be handled by express-rate-limit middleware
  // but we can add additional validation here if needed
  next();
};
