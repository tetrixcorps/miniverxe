import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock token data store
const tokens: any[] = [];

// Generate API token
router.post('/generate', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { name, permissions, expiresIn = '30d' } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Missing required field: name'
      });
    }

    // Generate API token
    const tokenId = uuidv4();
    const apiToken = jwt.sign(
      { 
        tokenId, 
        userId, 
        permissions: permissions || ['read'] 
      },
      process.env.JWT_SECRET || 'tetrix-jwt-secret',
      { expiresIn }
    );

    // Store token metadata
    const token = {
      id: tokenId,
      userId,
      name,
      permissions: permissions || ['read'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      isActive: true
    };

    tokens.push(token);

    res.status(201).json({
      success: true,
      token: {
        id: tokenId,
        name: token.name,
        permissions: token.permissions,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt
      },
      apiToken,
      message: 'API token generated successfully'
    });
  } catch (error) {
    console.error('Generate token error:', error);
    res.status(500).json({
      error: 'Failed to generate API token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List user tokens
router.get('/', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { active, limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    let filteredTokens = tokens.filter(t => t.userId === userId);
    
    if (active !== undefined) {
      filteredTokens = filteredTokens.filter(t => t.isActive === (active === 'true'));
    }
    
    const paginatedTokens = filteredTokens.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      tokens: paginatedTokens.map(t => ({
        id: t.id,
        name: t.name,
        permissions: t.permissions,
        expiresAt: t.expiresAt,
        createdAt: t.createdAt,
        lastUsedAt: t.lastUsedAt,
        isActive: t.isActive
      })),
      total: filteredTokens.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('List tokens error:', error);
    res.status(500).json({
      error: 'Failed to retrieve tokens',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Revoke token
router.post('/:tokenId/revoke', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { tokenId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    const tokenIndex = tokens.findIndex(t => t.id === tokenId && t.userId === userId);
    
    if (tokenIndex === -1) {
      return res.status(404).json({
        error: 'Token not found'
      });
    }

    const token = tokens[tokenIndex];
    token.isActive = false;
    token.revokedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Token revoked successfully'
    });
  } catch (error) {
    console.error('Revoke token error:', error);
    res.status(500).json({
      error: 'Failed to revoke token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update token permissions
router.put('/:tokenId', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { tokenId } = req.params;
    const { name, permissions } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    const tokenIndex = tokens.findIndex(t => t.id === tokenId && t.userId === userId);
    
    if (tokenIndex === -1) {
      return res.status(404).json({
        error: 'Token not found'
      });
    }

    const token = tokens[tokenIndex];
    
    if (name) token.name = name;
    if (permissions) token.permissions = permissions;
    
    token.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      token: {
        id: token.id,
        name: token.name,
        permissions: token.permissions,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt,
        isActive: token.isActive
      },
      message: 'Token updated successfully'
    });
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({
      error: 'Failed to update token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify API token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Missing token'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tetrix-jwt-secret') as any;
    
    // Find token in store
    const tokenRecord = tokens.find(t => t.id === decoded.tokenId);
    if (!tokenRecord || !tokenRecord.isActive) {
      return res.status(401).json({
        error: 'Invalid or inactive token'
      });
    }

    // Update last used timestamp
    tokenRecord.lastUsedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      token: {
        id: tokenRecord.id,
        userId: tokenRecord.userId,
        permissions: tokenRecord.permissions,
        expiresAt: tokenRecord.expiresAt
      },
      valid: true
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get token usage statistics
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.headers;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    const userTokens = tokens.filter(t => t.userId === userId);
    
    const stats = {
      total: userTokens.length,
      active: userTokens.filter(t => t.isActive).length,
      expired: userTokens.filter(t => new Date(t.expiresAt) < new Date()).length,
      recentlyUsed: userTokens.filter(t => 
        t.lastUsedAt && new Date(t.lastUsedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get token stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve token statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
