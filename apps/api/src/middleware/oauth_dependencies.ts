import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  userGroup?: 'data-annotator' | 'academy' | 'enterprise';
  metadata?: {
    rateLimit?: number;
    apiRateLimit?: number;
    features?: string[];
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function getCurrentUserOAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const credentialsException = {
    statusCode: 401,
    detail: 'Could not validate credentials',
    headers: { 'WWW-Authenticate': 'Bearer' },
  };

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Try to verify as Firebase ID token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get user from Firestore
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email || '',
          roles: userData?.roles || ['Customer'],
          permissions: userData?.permissions || [],
          userGroup: (userData?.userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined) || 'enterprise',
          metadata: userData?.metadata || {},
        };
        next();
        return;
      }
    } catch (firebaseError) {
      console.warn('Firebase token verification failed:', firebaseError);
    }

    // If Firebase verification fails, try custom JWT (if you have one)
    // This is optional and depends on your JWT implementation
    res.status(401).json({ error: 'Invalid or expired token' });
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireOAuthPermissions(requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userPermissions = req.user.permissions || [];
    
    for (const requiredPermission of requiredPermissions) {
      if (!userPermissions.includes(requiredPermission)) {
        res.status(403).json({
          error: `Insufficient permissions. Required: ${requiredPermission}`,
        });
        return;
      }
    }
    
    next();
  };
}

export function requireOAuthRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRoles = req.user.roles || [];
    
    if (!userRoles.includes(requiredRole)) {
      res.status(403).json({
        error: `Insufficient role. Required: ${requiredRole}`,
      });
      return;
    }
    
    next();
  };
}

export function requireOAuthUserGroup(requiredUserGroup: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.userGroup !== requiredUserGroup) {
      res.status(403).json({
        error: `Insufficient user group. Required: ${requiredUserGroup}`,
      });
      return;
    }
    
    next();
  };
}

// Middleware to extract user from Firebase token
export const firebaseAuthMiddlewareOAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user data from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        roles: userData?.roles || ['Customer'],
        permissions: userData?.permissions || [],
        userGroup: (userData?.userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined) || 'enterprise',
        metadata: userData?.metadata || {},
      };
      next();
    } else {
      res.status(401).json({ error: 'User not found in database' });
    }
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}; 