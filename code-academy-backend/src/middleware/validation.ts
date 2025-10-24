import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessage,
      });
    }

    req.body = value;
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
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return res.status(400).json({
        error: 'Parameter validation failed',
        details: errorMessage,
      });
    }

    // Replace req.params with validated and sanitized data
    req.params = value;
    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().uuid().required(),
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
    q: Joi.string().min(1).max(100),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

// Auth schemas
export const authSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    username: commonSchemas.username,
    password: commonSchemas.password,
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
  }),
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
  }),
  resetPassword: Joi.object({
    email: commonSchemas.email,
  }),
  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),
};

// Course schemas
export const courseSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(1).max(2000).required(),
    shortDescription: Joi.string().max(500).optional(),
    slug: Joi.string().min(1).max(100).required(),
    thumbnail: Joi.string().uri().optional(),
    price: Joi.number().min(0).optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').required(),
    category: Joi.string().min(1).max(50).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPublished: Joi.boolean().default(false),
    estimatedDuration: Joi.number().min(1).optional(),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().min(1).max(2000).optional(),
    shortDescription: Joi.string().max(500).optional(),
    slug: Joi.string().min(1).max(100).optional(),
    thumbnail: Joi.string().uri().optional(),
    price: Joi.number().min(0).optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
    category: Joi.string().min(1).max(50).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPublished: Joi.boolean().optional(),
    estimatedDuration: Joi.number().min(1).optional(),
  }),
};

// Lesson schemas
export const lessonSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    content: Joi.string().min(1).required(),
    courseId: commonSchemas.id,
    order: Joi.number().integer().min(0).required(),
    type: Joi.string().valid('VIDEO', 'TEXT', 'QUIZ', 'EXERCISE').required(),
    duration: Joi.number().min(0).optional(),
    isPublished: Joi.boolean().default(false),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    content: Joi.string().min(1).optional(),
    order: Joi.number().integer().min(0).optional(),
    type: Joi.string().valid('VIDEO', 'TEXT', 'QUIZ', 'EXERCISE').optional(),
    duration: Joi.number().min(0).optional(),
    isPublished: Joi.boolean().optional(),
  }),
};

// Exercise schemas
export const exerciseSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(1).max(2000).required(),
    lessonId: commonSchemas.id,
    type: Joi.string().valid('CODING', 'QUIZ', 'MULTIPLE_CHOICE', 'FILL_BLANK').required(),
    difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD').required(),
    points: Joi.number().integer().min(1).max(100).required(),
    testCases: Joi.array().items(Joi.object({
      input: Joi.string().required(),
      expectedOutput: Joi.string().required(),
      isHidden: Joi.boolean().default(false),
    })).optional(),
    solution: Joi.string().optional(),
    hints: Joi.array().items(Joi.string()).optional(),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().min(1).max(2000).optional(),
    type: Joi.string().valid('CODING', 'QUIZ', 'MULTIPLE_CHOICE', 'FILL_BLANK').optional(),
    difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD').optional(),
    points: Joi.number().integer().min(1).max(100).optional(),
    testCases: Joi.array().items(Joi.object({
      input: Joi.string().required(),
      expectedOutput: Joi.string().required(),
      isHidden: Joi.boolean().default(false),
    })).optional(),
    solution: Joi.string().optional(),
    hints: Joi.array().items(Joi.string()).optional(),
  }),
};

// Progress schemas
export const progressSchemas = {
  create: Joi.object({
    userId: commonSchemas.id,
    courseId: commonSchemas.id,
    lessonId: commonSchemas.id,
    status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED').required(),
    completedAt: Joi.date().optional(),
    score: Joi.number().min(0).max(100).optional(),
  }),
  update: Joi.object({
    status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED').optional(),
    completedAt: Joi.date().optional(),
    score: Joi.number().min(0).max(100).optional(),
  }),
};

// Submission schemas
export const submissionSchemas = {
  create: Joi.object({
    userId: commonSchemas.id,
    exerciseId: commonSchemas.id,
    code: Joi.string().required(),
    language: Joi.string().min(1).max(50).required(),
    status: Joi.string().valid('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'ERROR').default('PENDING'),
    score: Joi.number().min(0).max(100).optional(),
    feedback: Joi.string().optional(),
  }),
  update: Joi.object({
    status: Joi.string().valid('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'ERROR').optional(),
    score: Joi.number().min(0).max(100).optional(),
    feedback: Joi.string().optional(),
  }),
};