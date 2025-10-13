import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock user data store (shared with auth controller)
const users: any[] = [];

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { userId } = req.headers;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { firstName, lastName, phone, company } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = users[userIndex];
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    
    user.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Failed to update user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['currentPassword', 'newPassword']
      });
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = users[userIndex];
    
    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid current password'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { role, status, limit = 50, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    // Check if user is admin
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    let filteredUsers = users;
    
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }
    
    const paginatedUsers = filteredUsers.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      users: paginatedUsers.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: u.status,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      })),
      total: filteredUsers.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user status (admin only)
router.put('/:targetUserId/status', async (req, res) => {
  try {
    const { userId } = req.headers;
    const { targetUserId } = req.params;
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User ID required'
      });
    }

    // Check if user is admin
    const user = users.find(u => u.id === userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    const targetUserIndex = users.findIndex(u => u.id === targetUserId);
    if (targetUserIndex === -1) {
      return res.status(404).json({
        error: 'Target user not found'
      });
    }

    const targetUser = users[targetUserIndex];
    targetUser.status = status;
    targetUser.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role,
        status: targetUser.status,
        emailVerified: targetUser.emailVerified,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt
      },
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
