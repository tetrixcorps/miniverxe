import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.js';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

const router = Router();
const prisma = new PrismaClient();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  userGroup: z.enum(['data-annotator', 'academy', 'enterprise']).optional(),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// POST /api/auth/signup
router.post('/signup', validateBody(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password, userGroup = 'data-annotator' } = req.body;
    const typedUserGroup = userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined;

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: false
      });
    } catch (firebaseError: any) {
      console.error('Firebase user creation error:', firebaseError);
      return res.status(400).json({ 
        error: 'Failed to create user account',
        details: firebaseError.message 
      });
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || name,
        passwordHash: 'firebase-auth', // Firebase handles password
        isActive: true
      }
    });

    // Assign default role based on user group
    const defaultRole = await prisma.role.findFirst({
      where: { name: 'User' }
    });

    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id
        }
      });
    }

    // Generate custom token for immediate sign-in
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid, {
      userGroup: typedUserGroup,
      userId: user.id
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userGroup
      },
      customToken
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signin
router.post('/signin', validateBody(signinSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Note: Firebase handles password verification on the client side
    // This endpoint is for server-side validation and token generation

    // Generate custom token
    const customToken = await admin.auth().createCustomToken(user.id, {
      userGroup: 'data-annotator' as 'data-annotator' | 'academy' | 'enterprise' | undefined, // Default, can be updated
      userId: user.id
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.status(200).json({ 
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.userRoles.map(ur => ur.role.name)
      },
      customToken
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signout
router.post('/signout', async (req, res) => {
  try {
    // Note: Firebase handles token invalidation on the client side
    // This endpoint is for server-side cleanup if needed
    
    res.json({ message: 'Sign out successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

// POST /api/auth/forgot
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ message: 'Password reset email sent' });
    }

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: `${process.env.SITE_URL || 'http://localhost:4323'}/reset-password`,
      handleCodeInApp: false
    });

    // TODO: Send email with reset link
    // For now, just return success
    console.log('Password reset link:', resetLink);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    // Get user from Firebase token (set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
            organization: true
          }
        },
        userOrganizations: {
          include: {
            organization: true
          }
        },
        wallet: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        roles: user.userRoles.map(ur => ur.role.name),
        organizations: user.userOrganizations.map(uo => uo.organization.name),
        wallet: user.wallet ? {
          id: user.wallet.id,
          address: user.wallet.address,
          balance: user.wallet.balance,
          status: user.wallet.status
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', validateBody(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(refreshToken);
    
    // Generate new custom token
    const newCustomToken = await admin.auth().createCustomToken(decodedToken.uid, {
      userGroup: (decodedToken.userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined) || 'data-annotator',
      userId: decodedToken.uid
    });

    res.json({ 
      message: 'Token refreshed successfully',
      customToken: newCustomToken
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate email verification link
    const verificationLink = await admin.auth().generateEmailVerificationLink(email, {
      url: `${process.env.SITE_URL || 'http://localhost:4323'}/email-verified`,
      handleCodeInApp: false
    });

    // TODO: Send verification email
    console.log('Email verification link:', verificationLink);

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// POST /api/auth/update-profile
router.post('/update-profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      }
    });

    // Update Firebase user if email changed
    if (email && email !== updatedUser.email) {
      await admin.auth().updateUser(userId, {
        email,
        emailVerified: false
      });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router; 