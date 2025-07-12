import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { PrismaClient } from '@prisma/client';
// import { authGuard, requireRole } from '../middleware/auth'; // Uncomment and adjust as needed

const router = Router();
const prisma = new PrismaClient();

// --- Zod Schemas ---
const AssignmentSubmitSchema = z.object({
  fileUrl: z.string().url(),
  comment: z.string().optional(),
  assignmentId: z.string(),
});

const ReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewComment: z.string().optional(),
});

// --- Endpoints ---

// Submit assignment
router.post('/assignments', /*authGuard,*/ validateBody(AssignmentSubmitSchema), async (req, res) => {
  const { fileUrl, comment, assignmentId } = (req as any).validatedBody;
  try {
    // Create assignment submission in database
    const assignment = await prisma.academyAssignment.create({
      data: {
        userId: req.user?.id || 'anonymous', // Placeholder for auth
        title: `Assignment ${assignmentId}`,
        description: comment,
        fileUrl,
        status: 'Submitted',
        submittedAt: new Date()
      }
    });

    res.status(201).json({ ok: true, assignmentId: assignment.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message, code: 'internal_error' });
  }
});

// List assignments (for student)
router.get('/assignments', /*authGuard,*/ async (req, res) => {
  try {
    // Get real assignments from database
    const assignments = await prisma.academyAssignment.findMany({
      where: { userId: req.user?.id || 'anonymous' },
      include: {
        user: true,
        reviewer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      fileUrl: assignment.fileUrl,
      status: assignment.status,
      submittedAt: assignment.submittedAt?.toISOString(),
      reviewedAt: assignment.reviewedAt?.toISOString(),
      reviewComment: assignment.reviewComment
    }));

    res.json(formattedAssignments);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message, code: 'internal_error' });
  }
});

// List assignments needing review (for reviewer)
router.get('/review-queue', /*authGuard, requireRole('AcademyReviewer'),*/ async (req, res) => {
  try {
    // Get assignments pending review from database
    const assignments = await prisma.academyAssignment.findMany({
      where: { status: 'Submitted' },
      include: {
        user: true
      },
      orderBy: { submittedAt: 'asc' }
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      fileUrl: assignment.fileUrl,
      submittedBy: assignment.user.name || assignment.user.email,
      submittedAt: assignment.submittedAt?.toISOString()
    }));

    res.json(formattedAssignments);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message, code: 'internal_error' });
  }
});

// Review assignment
router.patch('/review/:id', /*authGuard, requireRole('AcademyReviewer'),*/ validateBody(ReviewSchema), async (req, res) => {
  const { status, reviewComment } = (req as any).validatedBody;
  const { id } = req.params;
  try {
    // Update assignment review status in database
    const assignment = await prisma.academyAssignment.update({
      where: { id },
      data: {
        status: status === 'approved' ? 'Approved' : 'Rejected',
        reviewComment,
        reviewedAt: new Date(),
        reviewerId: req.user?.id || 'anonymous'
      }
    });

    res.json({ ok: true, id, status: assignment.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message, code: 'internal_error' });
  }
});

// List CI results
router.get('/ci', /*authGuard,*/ async (req, res) => {
  try {
    // Get CI results from database (placeholder for now)
    // This would typically come from a CI/CD system integration
    const ciResults = await prisma.analytics.findMany({
      where: {
        userId: req.user?.id,
        period: 'ci'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const formattedResults = ciResults.map(result => ({
      id: result.id,
      metrics: result.metrics,
      trends: result.trends,
      createdAt: result.createdAt.toISOString()
    }));

    res.json(formattedResults);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message, code: 'internal_error' });
  }
});

export default router; 