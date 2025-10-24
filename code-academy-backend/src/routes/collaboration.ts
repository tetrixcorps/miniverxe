import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all collaborations
router.get('/', async (req, res) => {
  try {
    const collaborations = await prisma.collaboration.findMany({
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
      },
    });
    res.json(collaborations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collaborations' });
  }
});

// Get collaboration by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collaboration = await prisma.collaboration.findUnique({
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
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collaboration' });
  }
});

// Create collaboration
router.post('/', async (req, res) => {
  try {
    const { userId, courseId, type, content, metadata } = req.body;

    const collaboration = await prisma.collaboration.create({
      data: {
        userId,
        courseId,
        type,
        content,
        metadata: metadata || {},
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
      },
    });

    res.status(201).json(collaboration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create collaboration' });
  }
});

// Update collaboration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, metadata } = req.body;

    const collaboration = await prisma.collaboration.update({
      where: { id },
      data: {
        type,
        content,
        metadata: metadata || {},
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
      },
    });

    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update collaboration' });
  }
});

// Delete collaboration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.collaboration.delete({
      where: { id },
    });

    res.json({ message: 'Collaboration deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete collaboration' });
  }
});

export default router;
