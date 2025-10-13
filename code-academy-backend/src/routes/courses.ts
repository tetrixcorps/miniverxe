import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, commonSchemas } from '../middleware/validation';
import Joi from 'joi';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createCourseSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(2000).required(),
  shortDescription: Joi.string().max(500).optional(),
  slug: Joi.string().min(1).max(100).required(),
  thumbnail: Joi.string().uri().optional(),
  banner: Joi.string().uri().optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').required(),
  duration: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  isFree: Joi.boolean().default(false),
  isPublished: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()).default([]),
  prerequisites: Joi.array().items(Joi.string()).default([]),
  learningOutcomes: Joi.array().items(Joi.string()).default([]),
  instructorId: Joi.string().cuid().optional(),
  instructorName: Joi.string().max(100).optional(),
  instructorBio: Joi.string().max(1000).optional(),
  instructorAvatar: Joi.string().uri().optional(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().min(1).max(2000).optional(),
  shortDescription: Joi.string().max(500).optional(),
  slug: Joi.string().min(1).max(100).optional(),
  thumbnail: Joi.string().uri().optional(),
  banner: Joi.string().uri().optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
  duration: Joi.number().integer().min(1).optional(),
  price: Joi.number().min(0).optional(),
  isFree: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  prerequisites: Joi.array().items(Joi.string()).optional(),
  learningOutcomes: Joi.array().items(Joi.string()).optional(),
  instructorName: Joi.string().max(100).optional(),
  instructorBio: Joi.string().max(1000).optional(),
  instructorAvatar: Joi.string().uri().optional(),
});

const courseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'title', 'rating', 'price').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
  isFree: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  search: Joi.string().min(1).max(100).optional(),
  tags: Joi.string().optional(),
});

// GET /api/courses - List all courses
router.get('/', validateRequest(courseQuerySchema, 'query'), async (req, res) => {
  try {
    const { page, limit, sort, order, difficulty, isFree, isPublished, search, tags } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (isFree !== undefined) {
      where.isFree = isFree === 'true';
    }
    
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tags) {
      const tagArray = tags.split(',').map((tag: string) => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    // Get courses
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { [sort as string]: order },
        include: {
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: 'An error occurred while fetching courses',
    });
  }
});

// GET /api/courses/:id - Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                exercises: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist',
      });
    }

    res.json({ course });
  } catch (error) {
    logger.error('Error fetching course:', error);
    res.status(500).json({
      error: 'Failed to fetch course',
      message: 'An error occurred while fetching the course',
    });
  }
});

// POST /api/courses - Create new course
router.post('/', authenticateToken, validateRequest(createCourseSchema), async (req, res) => {
  try {
    const courseData = req.body;

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug: courseData.slug },
    });

    if (existingCourse) {
      return res.status(409).json({
        error: 'Course already exists',
        message: 'A course with this slug already exists',
      });
    }

    const course = await prisma.course.create({
      data: courseData,
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            reviews: true,
          },
        },
      },
    });

    logger.info(`Course created: ${course.id} by user: ${req.user?.id}`);

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({
      error: 'Failed to create course',
      message: 'An error occurred while creating the course',
    });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', authenticateToken, validateRequest(updateCourseSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist',
      });
    }

    // Check if slug is being changed and if it conflicts
    if (updateData.slug && updateData.slug !== existingCourse.slug) {
      const slugConflict = await prisma.course.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugConflict) {
        return res.status(409).json({
          error: 'Slug already exists',
          message: 'A course with this slug already exists',
        });
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            reviews: true,
          },
        },
      },
    });

    logger.info(`Course updated: ${course.id} by user: ${req.user?.id}`);

    res.json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(500).json({
      error: 'Failed to update course',
      message: 'An error occurred while updating the course',
    });
  }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist',
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId: id },
    });

    if (enrollmentCount > 0) {
      return res.status(409).json({
        error: 'Cannot delete course',
        message: 'Course has active enrollments and cannot be deleted',
      });
    }

    await prisma.course.delete({
      where: { id },
    });

    logger.info(`Course deleted: ${id} by user: ${req.user?.id}`);

    res.json({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting course:', error);
    res.status(500).json({
      error: 'Failed to delete course',
      message: 'An error occurred while deleting the course',
    });
  }
});

export default router;
