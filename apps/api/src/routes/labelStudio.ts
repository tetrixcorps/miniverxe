import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { LabelStudioService } from '../services/labelStudioService';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const labelStudioService = new LabelStudioService();
const prisma = new PrismaClient();
const LABEL_STUDIO_URL = process.env.LABEL_STUDIO_URL || 'http://label-studio:8080';

// Persist audit log to DB
async function auditLog(userId: string, action: string, targetType: string, targetId: string, details: any) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      details,
    },
  });
}

// Real RBAC/permission check (replace with your actual logic)
function canAccessLabelStudio(user: any, projectId: string, taskId: string): boolean {
  // Example: Only allow users with 'Annotator', 'Admin', 'Reviewer' roles
  const allowedRoles = ['Annotator', 'Admin', 'Reviewer'];
  if (!user?.roles) return false;
  return user.roles.some((role: string) => allowedRoles.includes(role));
}

// Assignment check: ensure user is assigned to the task
async function isUserAssignedToTask(userId: string, projectId: string, taskId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { assignedToId: true, projectId: true },
  });
  return !!task && task.projectId === projectId && task.assignedToId === userId;
}

router.post('/authenticate', authMiddleware, async (req, res) => {
  try {
    const { projectId, taskId } = req.body;
    const user = req.user;
    if (!projectId || !taskId || !user?.id || !user?.email) {
      await auditLog(user?.id || 'unknown', 'label-studio-auth-failed', 'Task', taskId || 'unknown', { reason: 'Missing required fields', user, projectId, taskId });
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // RBAC/permission check
    if (!canAccessLabelStudio(user, projectId, taskId)) {
      await auditLog(user.id, 'label-studio-auth-denied', 'Task', taskId, { reason: 'Insufficient permissions', user, projectId, taskId });
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Assignment check
    const assigned = await isUserAssignedToTask(user.id, projectId, taskId);
    if (!assigned) {
      await auditLog(user.id, 'label-studio-auth-denied', 'Task', taskId, { reason: 'User not assigned', user, projectId, taskId });
      res.status(403).json({ error: 'User not assigned to this task/project' });
      return;
    }

    // 1. Ensure Label Studio user exists
    const lsUser = await labelStudioService.getOrCreateUser(user.id, user.email);

    // 2. Generate a short-lived token for this user (if supported)
    const token = await labelStudioService.getUserToken(lsUser);

    // 3. Compose the secure iframe URL
    const authenticatedUrl = await labelStudioService.generateAuthenticatedUrl(projectId, taskId, lsUser, token);

    await auditLog(user.id, 'label-studio-auth-success', 'Task', taskId, { user, projectId, taskId, lsUser });
    res.json({ authenticatedUrl });
  } catch (error) {
    const err = error as Error;
    await auditLog(req.user?.id || 'unknown', 'label-studio-auth-error', 'Task', req.body?.taskId || 'unknown', { error: err.message, stack: err.stack });
    console.error('Label Studio authenticate error:', error);
    res.status(500).json({ error: 'Failed to generate authenticated URL' });
  }
});

// Reviewer read-only access endpoint
router.post('/review-authenticate', authMiddleware, async (req, res): Promise<void> => {
  const { projectId, taskId, labelId } = req.body;
  const user = req.user;
  if (!user || !user.roles?.includes('Reviewer')) {
    await auditLog(user?.id || 'unknown', 'label-studio-review-auth-denied', 'Label', labelId, { reason: 'Not reviewer', user, projectId, taskId, labelId });
    res.status(403).json({ error: 'Reviewer access required' });
    return;
  }
  const review = await prisma.review.findFirst({ where: { labelId, reviewerId: user.id } });
  if (!review) {
    await auditLog(user.id, 'label-studio-review-auth-denied', 'Label', labelId, { reason: 'Not assigned reviewer', user, projectId, taskId, labelId });
    res.status(403).json({ error: 'Not assigned as reviewer' });
    return;
  }
  const token = await labelStudioService.getUserToken({ id: user.id, email: user.email });
  const params = new URLSearchParams({ embed: '1', readOnly: '1', token });
  const url = `${LABEL_STUDIO_URL}/projects/${projectId}/tasks/${taskId}?${params.toString()}`;
  await auditLog(user.id, 'label-studio-review-auth-success', 'Label', labelId, { user, projectId, taskId, labelId });
  res.json({ authenticatedUrl: url });
});

// Dynamic label config endpoint
router.get('/label-config/:projectId', authMiddleware, async (req, res): Promise<void> => {
  const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  // Add a stub for generateLabelConfig if missing
  const config = typeof labelStudioService.generateLabelConfig === 'function'
    ? labelStudioService.generateLabelConfig(project)
    : '<View></View>';
  res.type('application/xml').send(config);
});

// Event logging endpoint
router.post('/log-event', authMiddleware, async (req, res): Promise<void> => {
  const { event, details } = req.body;
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  await auditLog(user.id, event, details.targetType, details.targetId, details);
  res.json({ ok: true });
});

// Analytics endpoint
router.get('/analytics', authMiddleware, async (req, res): Promise<void> => {
  const user = req.user;
  if (!user || !user.roles?.some((r: string) => ['Admin', 'Reviewer'].includes(r))) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const stats = await prisma.auditLog.groupBy({
    by: ['action', 'userId'],
    _count: { _all: true },
  });
  res.json(stats);
});

// JWT for Label Studio API (example, not used directly in endpoints above)
router.get('/jwt', authMiddleware, (req, res): void => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.roles?.[0] || 'annotator' },
    process.env.LABEL_STUDIO_JWT_SECRET!,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

export default router; 