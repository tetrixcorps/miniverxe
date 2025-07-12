import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import type { Request } from 'express';

// Initialize Redis connection with error handling
let redis: Redis | null = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.warn('Redis connection error:', err.message);
    redis = null;
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });
} catch (error) {
  console.warn('Failed to initialize Redis:', error);
  redis = null;
}

// Helper function to create a unique Redis store
const createRedisStore = (prefix: string) => {
  if (!redis) {
    return undefined; // falls back to in-memory
  }
  
  return new RedisStore({
    sendCommand: (command: string, ...args: any[]) => {
      if (!redis) {
        throw new Error('Redis not available');
      }
      return redis.call(command, ...args) as any;
    },
    prefix: prefix,
  });
};

// Base rate limiter for all requests
export const baseRateLimiter = rateLimit({
  store: createRedisStore('base'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
});

// User-specific rate limiter based on user group and subscription
export const userRateLimiter = rateLimit({
  store: createRedisStore('user'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    const user = req.user;
    if (!user) return 50; // Default for unauthenticated
    
    // Customize limits based on user group and subscription
    switch (user.userGroup) {
      case 'enterprise':
        return user.metadata?.rateLimit || 1000;
      case 'academy':
        return 200;
      case 'data-annotator':
        return 500;
      default:
        return 100;
    }
  },
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: 'Rate limit exceeded for this user',
  standardHeaders: true,
  legacyHeaders: false,
});

// API-specific rate limiter for expensive operations
export const apiRateLimiter = rateLimit({
  store: createRedisStore('api'),
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    const user = req.user;
    if (!user) return 10;
    
    // API calls are more expensive
    switch (user.userGroup) {
      case 'enterprise':
        return user.metadata?.apiRateLimit || 100;
      case 'academy':
        return 20;
      case 'data-annotator':
        return 50;
      default:
        return 10;
    }
  },
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: 'API rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiter
export const authRateLimiter = rateLimit({
  store: createRedisStore('auth'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
});

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  store: createRedisStore('upload'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    const user = req.user;
    if (!user) return 5;
    
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
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: 'Upload rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
});

// Task submission rate limiter
export const taskSubmissionRateLimiter = rateLimit({
  store: createRedisStore('task'),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req) => {
    const user = req.user;
    if (!user) return 5;
    
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
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: 'Task submission rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter factory
export function createCustomRateLimiter(options: {
  windowMs: number;
  max: number | ((req: Request) => number);
  keyGenerator?: (req: Request) => string;
  message?: string;
  prefix?: string;
}) {
  return rateLimit({
    store: createRedisStore(options.prefix || 'custom'),
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: options.keyGenerator || ((req) => req.user?.id || req.ip || 'unknown'),
    message: options.message || 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Rate limit monitoring and logging
export const rateLimitLogger = {
  logRateLimitExceeded: (req: Request, res: any) => {
    console.log('Rate limit exceeded:', {
      ip: req.ip,
      userId: req.user?.id,
      userGroup: req.user?.userGroup,
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  },
  
  logRateLimitReset: (req: Request) => {
    console.log('Rate limit reset:', {
      ip: req.ip,
      userId: req.user?.id,
      userGroup: req.user?.userGroup,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export Redis instance for other uses
export { redis }; 