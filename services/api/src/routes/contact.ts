import { Router } from 'express';
import { prisma } from '../db';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'PENDING',
      },
    });
    
    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user
    
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      id: submission.id,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get all contact submissions (admin only)
router.get('/', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    const submissions = await prisma.contactSubmission.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      skip: Number(offset),
    });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

// Get a specific contact submission (admin only)
router.get('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: req.params.id },
    });
    
    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({ error: 'Failed to fetch contact submission' });
  }
});

// Update contact submission status (admin only)
router.patch('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { status, response } = req.body;
    
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: req.params.id },
    });
    
    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }
    
    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(response && { response }),
        ...(status === 'RESOLVED' && { respondedAt: new Date() }),
      },
    });
    
    // TODO: Send email response to user if response is provided
    
    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error updating contact submission:', error);
    res.status(500).json({ error: 'Failed to update contact submission' });
  }
});

// Delete contact submission (admin only)
router.delete('/:id', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: req.params.id },
    });
    
    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }
    
    await prisma.contactSubmission.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true, message: 'Contact submission deleted' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ error: 'Failed to delete contact submission' });
  }
});

// Get contact statistics (admin only)
router.get('/stats/overview', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const [totalSubmissions, pendingSubmissions, inProgressSubmissions, resolvedSubmissions] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'PENDING' } }),
      prisma.contactSubmission.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.contactSubmission.count({ where: { status: 'RESOLVED' } }),
    ]);
    
    // Get submissions by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySubmissions = await prisma.contactSubmission.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });
    
    const stats = {
      totalSubmissions,
      pendingSubmissions,
      inProgressSubmissions,
      resolvedSubmissions,
      resolutionRate: totalSubmissions > 0 ? resolvedSubmissions / totalSubmissions : 0,
      monthlySubmissions,
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({ error: 'Failed to fetch contact statistics' });
  }
});

// Bulk update contact submissions (admin only)
router.post('/bulk-update', authGuard, requireRole('admin'), async (req, res) => {
  try {
    const { ids, status, response } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required' });
    }
    
    const result = await prisma.contactSubmission.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        ...(status && { status }),
        ...(response && { response }),
        ...(status === 'RESOLVED' && { respondedAt: new Date() }),
      },
    });
    
    res.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error bulk updating contact submissions:', error);
    res.status(500).json({ error: 'Failed to bulk update contact submissions' });
  }
});

export default router;