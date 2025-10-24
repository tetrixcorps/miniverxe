import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Create exercise
router.post('/', async (req, res) => {
  try {
    const { title, description, lessonId, type, difficulty, points, testCases } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        lessonId,
        type,
        difficulty,
        points,
        testCases: testCases || [],
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// Update exercise
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, difficulty, points, testCases } = req.body;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        title,
        description,
        type,
        difficulty,
        points,
        testCases: testCases || [],
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    });

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// Delete exercise
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.exercise.delete({
      where: { id },
    });

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

export default router;
