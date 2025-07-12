import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { DataAnnotatorPermissions } from '@tetrix/rbac';

const prisma = new PrismaClient();
const router = Router();

// GET /api/review-queue - List all tasks assigned to the current reviewer and pending review
router.get('/', authMiddleware, requirePermission(DataAnnotatorPermissions.TaskReview), async (req, res) => {
  try {
    const reviewerId = req.user.id;
    // Find all review assignments for this reviewer
    const assignments = await prisma.reviewAssignment.findMany({
      where: { reviewerId },
      include: {
        task: true,
      },
    });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review queue', details: error.message });
  }
});

export default router; 