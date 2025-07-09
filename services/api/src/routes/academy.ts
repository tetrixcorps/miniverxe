import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// Get all academy assignments for the current user
router.get('/assignments', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const { status, limit = 20, offset = 0 } = req.query;
    
    const assignments = await prisma.academyAssignment.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching academy assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get a specific assignment
router.get('/assignments/:id', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const assignmentId = req.params.id;
    
    const assignment = await prisma.academyAssignment.findUnique({
      where: { id: assignmentId },
    });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Check if user owns this assignment or has admin privileges
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (assignment.userId !== userId && user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to view this assignment' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Create a new assignment (admin only)
router.post('/assignments', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { userId, title, description, content } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'User ID and title are required' });
    }
    
    const assignment = await prisma.academyAssignment.create({
      data: {
        userId,
        title,
        description,
        content,
        status: 'ASSIGNED',
        progress: 0,
      },
    });
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment progress
router.patch('/assignments/:id/progress', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const assignmentId = req.params.id;
    const { progress, status } = req.body;
    
    const assignment = await prisma.academyAssignment.findUnique({
      where: { id: assignmentId },
    });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    if (assignment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this assignment' });
    }
    
    const updatedAssignment = await prisma.academyAssignment.update({
      where: { id: assignmentId },
      data: {
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(status && { status }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment progress:', error);
    res.status(500).json({ error: 'Failed to update assignment progress' });
  }
});

// Submit assignment
router.post('/assignments/:id/submit', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    const assignmentId = req.params.id;
    const { submission } = req.body;
    
    const assignment = await prisma.academyAssignment.findUnique({
      where: { id: assignmentId },
    });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    if (assignment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to submit this assignment' });
    }
    
    if (assignment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Assignment already completed' });
    }
    
    const updatedAssignment = await prisma.academyAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        content: {
          ...(assignment.content as any),
          submission,
        },
        completedAt: new Date(),
      },
    });
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// Get learning materials/courses
router.get('/courses', authGuard, async (req, res) => {
  try {
    // For now, return static course data
    // In a real implementation, this would come from a courses table
    const courses = [
      {
        id: '1',
        title: 'Introduction to Data Annotation',
        description: 'Learn the basics of data annotation and labeling',
        difficulty: 'Beginner',
        duration: '2 hours',
        modules: [
          { id: '1', title: 'What is Data Annotation?', duration: '30 min' },
          { id: '2', title: 'Types of Annotation', duration: '45 min' },
          { id: '3', title: 'Quality Standards', duration: '45 min' },
        ],
      },
      {
        id: '2',
        title: 'Advanced Image Annotation',
        description: 'Master advanced techniques for image annotation',
        difficulty: 'Advanced',
        duration: '4 hours',
        modules: [
          { id: '1', title: 'Object Detection', duration: '90 min' },
          { id: '2', title: 'Semantic Segmentation', duration: '90 min' },
          { id: '3', title: 'Instance Segmentation', duration: '60 min' },
        ],
      },
      {
        id: '3',
        title: 'Text Annotation and NLP',
        description: 'Learn to annotate text data for NLP tasks',
        difficulty: 'Intermediate',
        duration: '3 hours',
        modules: [
          { id: '1', title: 'Named Entity Recognition', duration: '60 min' },
          { id: '2', title: 'Sentiment Analysis', duration: '60 min' },
          { id: '3', title: 'Text Classification', duration: '60 min' },
        ],
      },
    ];
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get leaderboard
router.get('/leaderboard', authGuard, async (req, res) => {
  try {
    const { period = 'MONTHLY', limit = 10 } = req.query;
    
    // Get users with their completion stats
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['ANNOTATOR', 'ACADEMY_STUDENT'],
        },
      },
      include: {
        academyAssignments: {
          where: {
            status: 'COMPLETED',
            ...(period === 'MONTHLY' && {
              completedAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            }),
          },
        },
        _count: {
          select: {
            academyAssignments: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      take: Number(limit),
    });
    
    // Calculate scores and sort
    const leaderboard = users
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        completedAssignments: user._count.academyAssignments,
        averageScore: user.academyAssignments.reduce((sum, assignment) => 
          sum + (assignment.score || 0), 0) / (user.academyAssignments.length || 1),
        totalScore: user.academyAssignments.reduce((sum, assignment) => 
          sum + (assignment.score || 0), 0),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user progress overview
router.get('/progress', authGuard, async (req, res) => {
  try {
    const userId = (req as any).user.uid;
    
    const [totalAssignments, completedAssignments, inProgressAssignments] = await Promise.all([
      prisma.academyAssignment.count({
        where: { userId },
      }),
      prisma.academyAssignment.count({
        where: { userId, status: 'COMPLETED' },
      }),
      prisma.academyAssignment.count({
        where: { userId, status: 'IN_PROGRESS' },
      }),
    ]);
    
    const averageScore = await prisma.academyAssignment.aggregate({
      where: {
        userId,
        status: 'COMPLETED',
        score: { not: null },
      },
      _avg: {
        score: true,
      },
    });
    
    const progress = {
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      completionRate: totalAssignments > 0 ? completedAssignments / totalAssignments : 0,
      averageScore: averageScore._avg.score || 0,
    };
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Grade assignment (admin only)
router.post('/assignments/:id/grade', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { score, feedback } = req.body;
    
    if (score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }
    
    const assignment = await prisma.academyAssignment.findUnique({
      where: { id: assignmentId },
    });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    if (assignment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Assignment must be completed before grading' });
    }
    
    const updatedAssignment = await prisma.academyAssignment.update({
      where: { id: assignmentId },
      data: {
        score,
        content: {
          ...(assignment.content as any),
          feedback,
        },
      },
    });
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
});

// Batch assign assignments to users
router.post('/assignments/batch', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { userIds, title, description, content } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !title) {
      return res.status(400).json({ error: 'User IDs array and title are required' });
    }
    
    const assignments = await prisma.academyAssignment.createMany({
      data: userIds.map(userId => ({
        userId,
        title,
        description,
        content,
        status: 'ASSIGNED',
        progress: 0,
      })),
    });
    
    res.status(201).json({
      success: true,
      createdCount: assignments.count,
    });
  } catch (error) {
    console.error('Error creating batch assignments:', error);
    res.status(500).json({ error: 'Failed to create batch assignments' });
  }
});

export default router;