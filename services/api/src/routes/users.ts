import { Router } from 'express';
import { db } from '../firebase';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// List all users (admin only)
router.get('/', authGuard, requireRole('admin'), async (req, res) => {
  const snap = await db.collection('users').get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// Get current user profile
router.get('/me', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) return res.status(404).json({ error: 'User not found' });
  res.json({ id: doc.id, ...doc.data() });
});

export default router; 