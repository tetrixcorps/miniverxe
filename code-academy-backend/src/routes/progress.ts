import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all progress records
router.get('/', async (req, res) => {
  try {
    const progress = await prisma.progress.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress records' });
  }
});

// Get progress by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get progress by course ID
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await prisma.progress.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});

// Create or update progress
router.post('/', async (req, res) => {
  try {
    const { userId, courseId, lessonId, status, completedAt, score } = req.body;

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        status,
        completedAt,
        score,
      },
      create: {
        userId,
        courseId,
        lessonId,
        status,
        completedAt,
        score,
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
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update progress' });
  }
});

// Delete progress
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.progress.delete({
      where: { id },
    });

    res.json({ message: 'Progress record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete progress record' });
  }
});

export default router;
