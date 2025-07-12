import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

class OAuthSecurityMiddleware {
  async validateFirebaseToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Missing or invalid authorization header',
      });
      return;
    }

    try {
      const token = authorization.replace('Bearer ', '');
      
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Check token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        res.status(401).json({
          error: 'Token has expired',
        });
        return;
      }

      // Validate issuer and audience
      const expectedIssuer = `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`;
      if (decodedToken.iss !== expectedIssuer) {
        res.status(401).json({
          error: 'Invalid token issuer',
        });
        return;
      }

      // Add decoded token to request for use in other middleware
      (req as any).decodedToken = decodedToken;
      next();
      
    } catch (error: any) {
      console.warn('Invalid Firebase token:', error.message);
      res.status(401).json({
        error: 'Invalid authentication token',
      });
    }
  }

  checkUserPermissions(
    decodedToken: any,
    requiredPermissions: string[]
  ): boolean {
    const userPermissions = decodedToken.permissions || [];
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  checkUserRoles(
    decodedToken: any,
    requiredRoles: string[]
  ): boolean {
    const userRoles = decodedToken.roles || [];
    return requiredRoles.some(role => 
      userRoles.includes(role)
    );
  }

  // Rate limiting for OAuth endpoints
  createOAuthRateLimiter() {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 OAuth attempts per windowMs
      message: 'Too many OAuth attempts from this IP',
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => req.ip || 'unknown',
    };
  }

  // Validate OAuth state parameter
  validateOAuthState(req: Request, res: Response, next: NextFunction): void {
    const { state } = req.query;
    // For now, we'll skip state validation since we don't have session storage set up
    // In production, you should implement proper session storage for state validation
    
    // TODO: Implement proper state validation with session storage
    // const storedState = req.session?.oauthState;
    // if (!state || !storedState || state !== storedState) {
    //   res.status(400).json({
    //     error: 'Invalid state parameter',
    //   });
    //   return;
    // }
    
    next();
  }

  // Log OAuth events for security monitoring
  logOAuthEvent(event: string, data: any): void {
    console.log('OAuth Security Event:', {
      event,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  // Validate OAuth provider
  validateOAuthProvider(provider: string): boolean {
    const supportedProviders = ['google.com', 'github.com', 'microsoft.com'];
    return supportedProviders.includes(provider);
  }

  // Sanitize OAuth callback data
  sanitizeOAuthData(data: any): any {
    return {
      provider: data.provider,
      email: data.email,
      name: data.name,
      picture: data.picture,
      // Remove sensitive data like tokens
    };
  }
}

export default new OAuthSecurityMiddleware(); 