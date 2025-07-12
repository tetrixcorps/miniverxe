import admin from 'firebase-admin';
const { PrismaClient } = require('@prisma/client');
if (!admin.apps.length) {
  admin.initializeApp();
}

console.log("Starting backend server...");

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import labelStudioRoutes from './routes/labelStudio';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok' });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint requested');
  const response = { message: 'Backend is working!' };
  console.log('Sending response:', response);
  res.json(response);
});

// Data labeling dashboard endpoint (direct implementation)
app.get('/api/data-labeling/dashboard', (req, res) => {
  console.log('Data labeling dashboard requested');
  
  // Mock data - replace with actual Firestore queries
  const stats = {
    totalProjects: 3,
    activeTasks: 15,
    completedTasks: 42,
    pendingReviews: 8,
    totalEarnings: 1250.50,
    qualityScore: 94.2
  };

  const projects = [
    {
      id: '1',
      name: 'Image Classification Alpha',
      status: 'active',
      progress: 75,
      totalTasks: 100,
      completedTasks: 75,
      assignedMembers: 5,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Text Sentiment Beta',
      status: 'paused',
      progress: 45,
      totalTasks: 200,
      completedTasks: 90,
      assignedMembers: 8,
      createdAt: '2024-01-10T14:30:00Z'
    },
    {
      id: '3',
      name: 'Object Detection Gamma',
      status: 'completed',
      progress: 100,
      totalTasks: 150,
      completedTasks: 150,
      assignedMembers: 12,
      createdAt: '2024-01-05T09:15:00Z'
    }
  ];

  res.json({ stats, projects });
});

// Data labeling projects endpoint
app.get('/api/data-labeling/projects', async (req, res) => {
  console.log('Data labeling projects requested');
  try {
    const projects = await prisma.project.findMany({
      include: {
        organization: true,
        datasets: true,
        tasks: true,
        metrics: true,
        createdBy: true
      }
    });
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Data labeling tasks endpoint
app.get('/api/data-labeling/tasks', async (req, res) => {
  console.log('Data labeling tasks requested');
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: true,
        assignedTo: true
      }
    });
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Data labeling reviews endpoint
app.get('/api/data-labeling/reviews', async (req, res) => {
  console.log('Data labeling reviews requested');
  try {
    const reviews = await prisma.review.findMany({
      include: {
        label: {
          include: {
            task: {
              include: {
                project: true
              }
            }
          }
        }
      }
    });
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Data labeling analytics endpoint
app.get('/api/data-labeling/analytics', async (req, res) => {
  console.log('Data labeling analytics requested');
  try {
    const analytics = {
      period: req.query.period || '30d',
      metrics: {
        totalTasks: await prisma.task.count(),
        completedTasks: await prisma.task.count({ where: { status: 'Approved' } }),
        averageCompletionTime: 2.5,
        qualityScore: 94.2,
        totalEarnings: 1800.50,
        activeProjects: await prisma.project.count({ where: { status: 'active' } }),
        activeAnnotators: await prisma.user.count({ where: { isActive: true } })
      },
      trends: {
        dailyCompletions: [12, 15, 8, 20, 18, 22, 16],
        qualityScores: [92, 94, 93, 95, 94, 96, 94],
        earnings: [150, 180, 120, 200, 190, 220, 180]
      }
    };
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Data labeling billing endpoint
app.get('/api/data-labeling/billing', async (req, res) => {
  console.log('Data labeling billing requested');
  try {
    const billing = {
      currentBalance: 1250.50,
      pendingPayouts: 450.00,
      totalEarned: 3200.00,
      paymentHistory: [
        {
          id: '1',
          amount: 500.00,
          status: 'completed',
          date: new Date().toISOString(),
          method: 'wallet'
        }
      ]
    };
    res.json(billing);
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: 'Failed to fetch billing data' });
  }
});

app.use('/api/label-studio', labelStudioRoutes);

const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, '0.0.0.0', () => console.log(`API server running on port ${PORT}`));

module.exports = app;
