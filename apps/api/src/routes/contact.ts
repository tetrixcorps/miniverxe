import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.js';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  company: z.string().optional(),
  phone: z.string().optional(),
  userGroup: z.enum(['data-annotator', 'academy', 'enterprise']).optional(),
});

// POST /api/contact/submit
router.post('/submit', validateBody(contactSchema), async (req, res, next) => {
  try {
    const { name, email, subject, message, company, phone, userGroup } = req.body;
    const typedUserGroup = userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined;

    // Store contact submission in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        company: company || null,
        phone: phone || null,
        userGroup: typedUserGroup || 'data-annotator',
        status: 'pending',
        source: 'contact-form'
      }
    });

    // Send email notification
    try {
      await sendContactNotification(submission);
    } catch (emailError) {
      console.error('Failed to send contact notification:', emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user
    try {
      await sendAutoReply(email, name);
    } catch (autoReplyError) {
      console.error('Failed to send auto-reply:', autoReplyError);
    }

    res.status(201).json({ 
      message: 'Contact form submitted successfully',
      submissionId: submission.id
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact/submissions (admin only)
router.get('/submissions', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userGroup } = req.query;
    const typedQueryUserGroup = userGroup as 'data-annotator' | 'academy' | 'enterprise' | undefined;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (typedQueryUserGroup) where.userGroup = typedQueryUserGroup;

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          company: true,
          phone: true,
          userGroup: true,
          status: true,
          source: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.contactSubmission.count({ where })
    ]);

    res.json({
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contact/submissions/:id/status (admin only)
router.put('/submissions/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const submission = await prisma.contactSubmission.update({
      where: { id: parseInt(id) },
      data: {
        status,
        notes: notes || null,
        updatedAt: new Date()
      }
    });

    res.json({ 
      message: 'Submission status updated',
      submission
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact/stats (admin only)
router.get('/stats', async (req, res, next) => {
  try {
    const [totalSubmissions, pendingCount, resolvedCount, userGroupStats] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'pending' } }),
      prisma.contactSubmission.count({ where: { status: 'resolved' } }),
      prisma.contactSubmission.groupBy({
        by: ['userGroup'],
        _count: { id: true }
      })
    ]);

    res.json({
      total: totalSubmissions,
      pending: pendingCount,
      resolved: resolvedCount,
      userGroups: userGroupStats.map(stat => ({
        userGroup: stat.userGroup,
        count: stat._count.id
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Email helper functions
async function sendContactNotification(submission: any) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@tetrix.com',
    to: process.env.CONTACT_EMAIL || 'contact@tetrix.com',
    subject: `New Contact Form Submission: ${submission.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Company:</strong> ${submission.company || 'N/A'}</p>
      <p><strong>Phone:</strong> ${submission.phone || 'N/A'}</p>
      <p><strong>User Group:</strong> ${submission.userGroup}</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${submission.message}</p>
      <p><strong>Submitted:</strong> ${submission.createdAt}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendAutoReply(email: string, name: string) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@tetrix.com',
    to: email,
    subject: 'Thank you for contacting Tetrix',
    html: `
      <h2>Thank you for contacting Tetrix!</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p>In the meantime, you can:</p>
      <ul>
        <li>Explore our <a href="https://tetrix.com/features">features</a></li>
        <li>Check out our <a href="https://tetrix.com/pricing">pricing</a></li>
        <li>Read our <a href="https://tetrix.com/docs">documentation</a></li>
      </ul>
      <p>Best regards,<br>The Tetrix Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

export default router; 