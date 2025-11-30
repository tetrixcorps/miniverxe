import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v2/auth/lookup
 * Check if a user exists by email or phone number
 */
router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Either email or phone parameter is required'
      });
    }

    let user = null;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email as string },
        select: {
          id: true,
          email: true,
          name: true,
          // Add other safe fields to return
        }
      });
    } else if (phone) {
      // If your User model has a phone field, query by phone
      // Adjust based on your actual schema
      user = await prisma.user.findFirst({
        where: {
          // Adjust field name based on your schema
          // phone: phone as string
        },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });
    }

    return res.status(200).json({
      success: true,
      exists: !!user,
      user: user || null
    });
  } catch (error: any) {
    console.error('Auth lookup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to lookup user'
    });
  }
});

export default router;


