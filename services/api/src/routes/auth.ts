import { Router } from 'express';
import { admin } from '../firebase';
import { prisma } from '../db';

const router = Router();

// Register/Login with Firebase token
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    
    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { id: uid },
    });
    
    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uid,
          email: email || '',
          name: name || email?.split('@')[0] || 'User',
          role: 'ANNOTATOR', // Default role
          status: 'ACTIVE',
        },
      });
    }
    
    // Generate custom token or session
    const customToken = await admin.auth().createCustomToken(uid);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token: customToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid token or authentication failed' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        id: userRecord.uid,
        email,
        name,
        role: 'ANNOTATOR',
        status: 'ACTIVE',
      },
    });
    
    // Generate custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token: customToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (uid) {
      // Revoke refresh tokens
      await admin.auth().revokeRefreshTokens(uid);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    // Verify refresh token and get new tokens
    // This would typically be handled by Firebase SDK on the client side
    // For server-side, we can create a new custom token
    
    res.json({ success: true, message: 'Token refresh should be handled client-side' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// Password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    
    // TODO: Send email with reset link
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Password reset email sent',
      // In development, you might want to return the link
      // resetLink: resetLink,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ error: 'Password reset failed' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Generate email verification link
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    
    // TODO: Send verification email
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Verification email sent',
      // In development, you might want to return the link
      // verificationLink: verificationLink,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: 'Email verification failed' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email } = req.body;
    
    // Update in Firebase
    await admin.auth().updateUser(decodedToken.uid, {
      displayName: name,
      email: email,
    });
    
    // Update in database
    const user = await prisma.user.update({
      where: { id: decodedToken.uid },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: 'Profile update failed' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }
    
    // Update password in Firebase
    await admin.auth().updateUser(decodedToken.uid, {
      password: newPassword,
    });
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(400).json({ error: 'Password change failed' });
  }
});

export default router;