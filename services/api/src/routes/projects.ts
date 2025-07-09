import { Router } from 'express';
import { db } from '../firebase';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// List all projects (admin/pm)
router.get('/', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  const snap = await db.collection('projects').get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// Create a new project (admin/pm)
router.post('/', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  const { name, description, annotationType, guidelineUrl, dueDate } = req.body;
  // Validate required fields and ensure project name uniqueness
  const doc = await db.collection('projects').add({
    name,
    description,
    annotationType,
    guidelineUrl,
    dueDate: dueDate ? new Date(dueDate) : null,
    status: 'draft',
    createdBy: (req as any).user.uid,
    createdAt: new Date()
  });
  res.status(201).json({ id: doc.id });
});

// Update project (admin/pm)
router.patch('/:id', authGuard, requireRole('admin', 'project_manager'), async (req, res) => {
  const { name, description, status, guidelineUrl, dueDate } = req.body;
  // Validate allowed status transitions and updatable fields
  const ref = db.collection('projects').doc(req.params.id);
  try {
    await ref.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
      ...(guidelineUrl && { guidelineUrl }),
      ...(dueDate && { dueDate: new Date(dueDate) })
    });
    res.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(400).json({ error: message });
  }
});

export default router; 