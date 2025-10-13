import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Invalid access token',
      });
    }

    // Check if session exists and is active
    const session = await prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'Session not found or expired',
      });
    }

    if (!session.user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled',
      });
    }

    // Add user to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      firstName: session.user.firstName || undefined,
      lastName: session.user.lastName || undefined,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid or malformed token',
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired',
      });
    }

    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication',
    });
  }
};

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first',
      });
    }

    // Check if user is admin (you can implement your own admin logic)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true,
        // Add admin field to your user model if needed
        // isAdmin: true,
      },
    });

    // For now, we'll use a simple check - you can implement proper admin roles
    if (!user) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User not found',
      });
    }

    // TODO: Implement proper admin role checking
    // if (!user.isAdmin) {
    //   return res.status(403).json({
    //     error: 'Access denied',
    //     message: 'Admin privileges required',
    //   });
    // }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(500).json({
      error: 'Authorization failed',
      message: 'An error occurred during authorization',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'access') {
      return next();
    }

    // Check if session exists and is active
    const session = await prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });

    if (session && session.user.isActive) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        firstName: session.user.firstName || undefined,
        lastName: session.user.lastName || undefined,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on errors
    logger.debug('Optional auth error (ignored):', error);
    next();
  }
};
