import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { DataAnnotatorPermissions } from '@tetrix/rbac';

const prisma = new PrismaClient();
const router = Router();

// Assign reviewer(s) to a task
router.post('/', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskAssign), async (req, res) => {
  try {
    const { taskId, reviewerIds } = req.body; // reviewerIds: string[]
    if (!taskId || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      res.status(400).json({ error: 'taskId and reviewerIds[] are required' });
      return;
    }
    const assignments = await Promise.all(
      reviewerIds.map(reviewerId =>
        prisma.reviewAssignment.upsert({
          where: { taskId_reviewerId: { taskId, reviewerId } },
          update: {},
          create: { taskId, reviewerId },
        })
      )
    );
    res.status(201).json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign reviewers', details: error.message });
  }
});

// List tasks assigned to a reviewer
router.get('/', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskReview), async (req, res) => {
  try {
    const { reviewerId } = req.query;
    if (!reviewerId) {
      res.status(400).json({ error: 'reviewerId is required' });
      return;
    }
    const assignments = await prisma.reviewAssignment.findMany({
      where: { reviewerId: reviewerId as string },
      include: { task: true },
    });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments', details: error.message });
  }
});

// Remove reviewer assignment
router.delete('/:id', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskAssign), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reviewAssignment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove assignment', details: error.message });
  }
});

export default router; 