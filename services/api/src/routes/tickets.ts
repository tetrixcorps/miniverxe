import { Router } from 'express';
import { db } from '../firebase';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// List tickets assigned to the authenticated annotator
router.get('/', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const snap = await db.collection('task_items')
    .where('assignedTo', '==', uid)
    .where('status', 'in', ['pending', 'in_progress'])
    .get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// Claim a task item (atomic)
router.post('/:id/claim', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const ref = db.collection('task_items').doc(req.params.id);
  try {
    await db.runTransaction(async t => {
      const doc = await t.get(ref);
      if (!doc.exists || doc.data()?.status !== 'pending') {
        throw new Error('already claimed or not found');
      }
      // Business logic needed: implement max claims per user limit
      t.update(ref, { assignedTo: uid, status: 'in_progress' });
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

// Submit annotation for a task item
router.post('/:id/submit', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const { ann } = req.body;
  const ref = db.collection('task_items').doc(req.params.id);
  try {
    await db.runTransaction(async t => {
      const doc = await t.get(ref);
      if (!doc.exists || doc.data()?.assignedTo !== uid || doc.data()?.status !== 'in_progress') {
        throw new Error('not allowed');
      }
      // Validate annotation payload structure against project schema
      t.update(ref, {
        status: 'submitted',
        annotation: ann,
        submittedAt: new Date()
      });
    });
    res.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

// Review annotation (approve/reject) - admin/reviewer only
router.patch('/:id/review', authGuard, requireRole('admin', 'reviewer'), async (req, res) => {
  const { status, reviewComment } = req.body;
  const ref = db.collection('task_items').doc(req.params.id);
  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await ref.update({
      status,
      reviewComment: reviewComment || '',
      reviewedAt: new Date()
    });
    res.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

export default router; 