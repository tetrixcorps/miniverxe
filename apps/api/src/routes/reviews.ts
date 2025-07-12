import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { DataAnnotatorPermissions } from '@tetrix/rbac';

const prisma = new PrismaClient();
const router = Router();

// POST /api/reviews - Submit review decision and feedback
router.post('/', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskReview), async (req, res) => {
  try {
    const { taskId, decision, feedback } = req.body;
    const reviewerId = req.user.id;

    if (!taskId || !['approved', 'rejected'].includes(decision)) {
      res.status(400).json({ error: 'taskId and valid decision are required' });
      return;
    }

    // Find the label for this task (assuming one label per task)
    const label = await prisma.label.findFirst({ where: { taskId } });
    if (!label) {
      res.status(404).json({ error: 'No label found for this task' });
      return;
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: { labelId_reviewerId: { labelId: label.id, reviewerId } },
      update: {
        status: decision === 'approved' ? 'Approved' : 'Rejected',
        comment: feedback,
        createdAt: new Date(),
      },
      create: {
        labelId: label.id,
        reviewerId,
        status: decision === 'approved' ? 'Approved' : 'Rejected',
        comment: feedback,
      },
    });

    // Update label status
    await prisma.label.update({
      where: { id: label.id },
      data: { status: decision === 'approved' ? 'Approved' : 'Rejected' },
    });

    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review', details: error.message });
  }
});

export default router; 