import { Router } from 'express';
// import { requirePermission } from '../middleware/rbac.ts'; // Not needed, just auth

const router = Router();

// GET /api/permissions
router.get('/', async (req, res, next) => {
  try {
    res.json({ permissions: req.user?.permissions || [] });
  } catch (err) {
    next(err);
  }
});

export default router; 