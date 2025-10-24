import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            lessonId: true,
          },
        },
      },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submission by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            lessonId: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Get submissions by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            lessonId: true,
          },
        },
      },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user submissions' });
  }
});

// Create submission
router.post('/', async (req, res) => {
  try {
    const { userId, exerciseId, code, language, status, score, feedback } = req.body;

    const submission = await prisma.submission.create({
      data: {
        userId,
        exerciseId,
        code,
        language,
        status,
        score,
        feedback,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            lessonId: true,
          },
        },
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Update submission
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        score,
        feedback,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
            lessonId: true,
          },
        },
      },
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// Delete submission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.submission.delete({
      where: { id },
    });

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export default router;
