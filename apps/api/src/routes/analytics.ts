import { Router } from 'express';
import { requireRole } from '../middleware/auth';
import { getOverview, getTrends, getUserStats, getProjectStats } from '../services/analyticsService';

const router = Router();

router.get('/overview', requireRole('Admin'), getOverview);
router.get('/trends', requireRole('Admin'), getTrends);
router.get('/user/:userId', requireRole('Admin'), getUserStats);
router.get('/project/:projectId', requireRole('Admin'), getProjectStats);

export default router; 