import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import FirebaseOAuthService from '../services/firebase_oauth_service.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const oauthService = new FirebaseOAuthService();

// Error handler wrapper for async routes
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// GET /api/v1/auth/oauth/authorize/:provider
router.get('/authorize/:provider', 
  authRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const { redirect_uri } = req.query;

      if (!redirect_uri || typeof redirect_uri !== 'string') {
        return res.status(400).json({ 
          error: 'Missing or invalid redirect_uri parameter' 
        });
      }

      const oauthData = await oauthService.initiateOAuthFlow(provider, redirect_uri);
      
      return res.json({
        authorization_url: oauthData.authorization_url,
        state: oauthData.state,
        provider: oauthData.provider,
      });
      
    } catch (error: any) {
      console.error('OAuth initiation error:', error);
      return res.status(400).json({ 
        error: error.message || 'OAuth initiation failed' 
      });
    }
  })
);

// POST /api/v1/auth/oauth/callback/:provider
router.post('/callback/:provider',
  authRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const { authorization_code, redirect_uri, state } = req.body;

      if (!authorization_code || !redirect_uri) {
        return res.status(400).json({ 
          error: 'Missing authorization_code or redirect_uri' 
        });
      }

      // Exchange authorization code for tokens
      const tokenData = await oauthService.exchangeCodeForToken(
        provider,
        authorization_code,
        redirect_uri
      );

      // Authenticate with Firebase
      const firebaseAuth = await oauthService.authenticateWithFirebase(
        tokenData.access_token,
        provider,
        tokenData.user_info
      );

      // Create JWT token for your application (optional - you can use Firebase custom token directly)
      const appToken = {
        access_token: firebaseAuth.firebase_token,
        token_type: 'bearer',
        expires_in: 3600, // 1 hour
        user: firebaseAuth.user_record,
      };

      // Update user's last login
      await oauthService.updateUserLogin(firebaseAuth.user_id);

      return res.json(appToken);
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return res.status(500).json({ 
        error: error.message || 'OAuth callback failed' 
      });
    }
  })
);

// GET /api/v1/auth/oauth/providers
router.get('/providers', asyncHandler(async (req: Request, res: Response) => {
  const supportedProviders = [
    {
      id: 'google.com',
      name: 'Google',
      icon: '/icons/google.svg',
      color: '#4285F4',
    },
    {
      id: 'github.com',
      name: 'GitHub',
      icon: '/icons/github.svg',
      color: '#24292E',
    },
    {
      id: 'microsoft.com',
      name: 'Microsoft',
      icon: '/icons/microsoft.svg',
      color: '#00A4EF',
    },
  ];

  return res.json({ providers: supportedProviders });
}));

// GET /api/v1/auth/oauth/user/:uid
router.get('/user/:uid',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const user = await oauthService.getOAuthUser(uid);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user });
    } catch (error: any) {
      console.error('Get OAuth user error:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to get user' 
      });
    }
  })
);

// POST /api/v1/auth/oauth/logout
router.post('/logout',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // In a real implementation, you might want to:
      // 1. Revoke the OAuth token
      // 2. Clear any server-side sessions
      // 3. Log the logout event
      
      return res.json({ 
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      return res.status(500).json({ 
        error: error.message || 'Logout failed' 
      });
    }
  })
);

export default router; 