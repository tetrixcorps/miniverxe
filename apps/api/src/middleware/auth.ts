import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'

// Replace with your actual secret or public key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export interface AuthUser {
  id: string
  email: string
  roles: string[]
  permissions: string[]
  userGroup?: 'data-annotator' | 'academy' | 'enterprise'
  metadata?: {
    rateLimit?: number
    apiRateLimit?: number
    features?: string[]
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }
  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser
    req.user = payload
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }
}

export function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Call the async logic but do not return a Promise to Express
  (async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = {
        id: decoded.uid,
        email: decoded.email || '',
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        userGroup: decoded.userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined,
        metadata: decoded.metadata || {},
      };
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  })();
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Extract user information from token
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      userGroup: decodedToken.userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined,
      roles: decodedToken.roles as string[]
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        userGroup: decodedToken.userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined,
        roles: decodedToken.roles as string[]
      };
    }

    next();
  } catch (error) {
    // Don't fail the request, just continue without user
    console.error('Optional auth error:', error);
    next();
  }
};

export const requireUserGroup = (requiredGroup: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.userGroup !== requiredGroup) {
      return res.status(403).json({ 
        error: `Access denied. Required user group: ${requiredGroup}` 
      });
    }

    next();
  };
};

export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.roles?.includes(requiredRole)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${requiredRole}` 
      });
    }

    next();
  };
};

export const requireAnyRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRequiredRole = req.user.roles?.some(role => 
      requiredRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        error: `Access denied. Required one of: ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
}; 