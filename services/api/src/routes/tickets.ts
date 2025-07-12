import { Router } from 'express';
import { db } from '../firebase';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { z } from 'zod';

const router = Router();

// Expanded Zod schemas
const AnnotationSubmitSchema = z.object({
  labels: z.array(z.string()).min(1),
  notes: z.string().optional(),
});
const ReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewComment: z.string().optional(),
});

// List tickets assigned to the authenticated annotator
router.get('/', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const snap = await db.collection('task_items')
    .where('assignedTo', '==', uid)
    .where('status', 'in', ['pending', 'in_progress'])
    .get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// Claim a task item (atomic, max claims per user)
router.post('/:id/claim', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const ref = db.collection('task_items').doc(req.params.id);
  try {
    // Enforce max claims per user (e.g., 5)
    const claimed = await db.collection('task_items')
      .where('assignedTo', '==', uid)
      .where('status', 'in', ['in_progress'])
      .get();
    if (claimed.size >= 5) {
      return res.status(400).json({ error: 'Max claims reached', code: 'max_claims' });
    }
    await db.runTransaction(async t => {
      const doc = await t.get(ref);
      if (!doc.exists || doc.data()?.status !== 'pending') {
        throw new Error('already claimed or not found');
      }
      t.update(ref, { assignedTo: uid, status: 'in_progress' });
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message, code: 'claim_failed' });
  }
});

// Submit annotation for a task item (expanded validation)
router.post('/:id/submit', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  const parseResult = AnnotationSubmitSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid annotation payload',
      code: 'invalid_payload',
      details: parseResult.error.errors,
    });
  }
  const { labels, notes } = parseResult.data;
  const ref = db.collection('task_items').doc(req.params.id);
  try {
    await db.runTransaction(async t => {
      const doc = await t.get(ref);
      if (!doc.exists || doc.data()?.assignedTo !== uid || doc.data()?.status !== 'in_progress') {
        throw new Error('not allowed');
      }
      t.update(ref, {
        status: 'submitted',
        annotation: { labels, notes },
        submittedAt: new Date()
      });
    });
    res.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message, code: 'submit_failed' });
  }
});

// Review annotation (approve/reject) - admin/reviewer only, status check
router.patch('/:id/review', authGuard, requireRole('admin', 'reviewer'), async (req, res) => {
  const parseResult = ReviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid review payload',
      code: 'invalid_payload',
      details: parseResult.error.errors,
    });
  }
  const { status, reviewComment } = parseResult.data;
  const ref = db.collection('task_items').doc(req.params.id);
  try {
    await db.runTransaction(async t => {
      const doc = await t.get(ref);
      if (!doc.exists || doc.data()?.status !== 'submitted') {
        throw new Error('Cannot review: not submitted');
      }
      t.update(ref, {
        status,
        reviewComment: reviewComment || '',
        reviewedAt: new Date()
      });
    });
    res.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message, code: 'review_failed' });
  }
});

export default router; 