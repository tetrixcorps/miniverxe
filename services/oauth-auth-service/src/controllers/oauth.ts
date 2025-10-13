import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock OAuth data store
const oauthClients: any[] = [];
const authorizationCodes: any[] = [];
const accessTokens: any[] = [];

// Register OAuth client
router.post('/client/register', async (req, res) => {
  try {
    const {
      name,
      redirectUri,
      scopes,
      clientType = 'public',
      description
    } = req.body;

    // Validate required fields
    if (!name || !redirectUri || !scopes) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'redirectUri', 'scopes']
      });
    }

    // Generate client credentials
    const clientId = uuidv4();
    const clientSecret = clientType === 'confidential' ? uuidv4() : null;

    // Create OAuth client
    const client = {
      id: clientId,
      secret: clientSecret,
      name,
      redirectUri,
      scopes: Array.isArray(scopes) ? scopes : [scopes],
      clientType,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    oauthClients.push(client);

    res.status(201).json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        redirectUri: client.redirectUri,
        scopes: client.scopes,
        clientType: client.clientType,
        description: client.description,
        status: client.status,
        createdAt: client.createdAt
      },
      credentials: {
        clientId: client.id,
        clientSecret: client.secret
      },
      message: 'OAuth client registered successfully'
    });
  } catch (error) {
    console.error('OAuth client registration error:', error);
    res.status(500).json({
      error: 'Failed to register OAuth client',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Authorize OAuth client
router.post('/authorize', async (req, res) => {
  try {
    const {
      clientId,
      redirectUri,
      responseType,
      scope,
      state
    } = req.body;

    // Validate required fields
    if (!clientId || !redirectUri || !responseType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clientId', 'redirectUri', 'responseType']
      });
    }

    // Find OAuth client
    const client = oauthClients.find(c => c.id === clientId);
    if (!client) {
      return res.status(404).json({
        error: 'OAuth client not found',
        clientId
      });
    }

    // Validate redirect URI
    if (client.redirectUri !== redirectUri) {
      return res.status(400).json({
        error: 'Invalid redirect URI'
      });
    }

    // Generate authorization code
    const authCode = uuidv4();
    const authorizationCode = {
      id: authCode,
      clientId,
      userId: req.headers.userId as string,
      scopes: scope ? scope.split(' ') : client.scopes,
      redirectUri,
      state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      createdAt: new Date().toISOString()
    };

    authorizationCodes.push(authorizationCode);

    res.status(200).json({
      success: true,
      authorizationCode: authCode,
      redirectUri,
      state,
      message: 'Authorization code generated successfully'
    });
  } catch (error) {
    console.error('OAuth authorization error:', error);
    res.status(500).json({
      error: 'Failed to authorize OAuth client',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Exchange authorization code for access token
router.post('/token', async (req, res) => {
  try {
    const {
      grantType,
      code,
      redirectUri,
      clientId,
      clientSecret
    } = req.body;

    // Validate required fields
    if (!grantType || !code || !redirectUri || !clientId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['grantType', 'code', 'redirectUri', 'clientId']
      });
    }

    // Find authorization code
    const authCode = authorizationCodes.find(ac => ac.id === code);
    if (!authCode) {
      return res.status(400).json({
        error: 'Invalid authorization code'
      });
    }

    // Check if code is expired
    if (new Date(authCode.expiresAt) < new Date()) {
      return res.status(400).json({
        error: 'Authorization code expired'
      });
    }

    // Find OAuth client
    const client = oauthClients.find(c => c.id === clientId);
    if (!client) {
      return res.status(404).json({
        error: 'OAuth client not found'
      });
    }

    // Validate client secret for confidential clients
    if (client.clientType === 'confidential' && client.secret !== clientSecret) {
      return res.status(401).json({
        error: 'Invalid client credentials'
      });
    }

    // Generate access token
    const accessToken = uuidv4();
    const refreshToken = uuidv4();

    const token = {
      id: accessToken,
      clientId,
      userId: authCode.userId,
      scopes: authCode.scopes,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      refreshToken,
      createdAt: new Date().toISOString()
    };

    accessTokens.push(token);

    // Remove used authorization code
    const codeIndex = authorizationCodes.findIndex(ac => ac.id === code);
    if (codeIndex !== -1) {
      authorizationCodes.splice(codeIndex, 1);
    }

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: authCode.scopes.join(' ')
    });
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    res.status(500).json({
      error: 'Failed to exchange authorization code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken, clientId, clientSecret } = req.body;

    // Validate required fields
    if (!refreshToken || !clientId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['refreshToken', 'clientId']
      });
    }

    // Find access token
    const token = accessTokens.find(t => t.refreshToken === refreshToken);
    if (!token) {
      return res.status(400).json({
        error: 'Invalid refresh token'
      });
    }

    // Find OAuth client
    const client = oauthClients.find(c => c.id === clientId);
    if (!client) {
      return res.status(404).json({
        error: 'OAuth client not found'
      });
    }

    // Validate client secret for confidential clients
    if (client.clientType === 'confidential' && client.secret !== clientSecret) {
      return res.status(401).json({
        error: 'Invalid client credentials'
      });
    }

    // Generate new access token
    const newAccessToken = uuidv4();
    const newRefreshToken = uuidv4();

    const newToken = {
      id: newAccessToken,
      clientId,
      userId: token.userId,
      scopes: token.scopes,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      refreshToken: newRefreshToken,
      createdAt: new Date().toISOString()
    };

    accessTokens.push(newToken);

    // Remove old token
    const tokenIndex = accessTokens.findIndex(t => t.id === token.id);
    if (tokenIndex !== -1) {
      accessTokens.splice(tokenIndex, 1);
    }

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: token.scopes.join(' ')
    });
  } catch (error) {
    console.error('OAuth token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh access token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Revoke access token
router.post('/revoke', async (req, res) => {
  try {
    const { token, tokenTypeHint = 'access_token' } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing required field: token'
      });
    }

    if (tokenTypeHint === 'access_token') {
      const tokenIndex = accessTokens.findIndex(t => t.id === token);
      if (tokenIndex !== -1) {
        accessTokens.splice(tokenIndex, 1);
      }
    } else if (tokenTypeHint === 'refresh_token') {
      const tokenIndex = accessTokens.findIndex(t => t.refreshToken === token);
      if (tokenIndex !== -1) {
        accessTokens.splice(tokenIndex, 1);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Token revoked successfully'
    });
  } catch (error) {
    console.error('OAuth token revocation error:', error);
    res.status(500).json({
      error: 'Failed to revoke token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get OAuth client info
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = oauthClients.find(c => c.id === clientId);
    
    if (!client) {
      return res.status(404).json({
        error: 'OAuth client not found',
        clientId
      });
    }
    
    res.status(200).json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        redirectUri: client.redirectUri,
        scopes: client.scopes,
        clientType: client.clientType,
        description: client.description,
        status: client.status,
        createdAt: client.createdAt
      }
    });
  } catch (error) {
    console.error('Get OAuth client error:', error);
    res.status(500).json({
      error: 'Failed to retrieve OAuth client',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
