import { Router } from 'express';

const router = Router();

// POST /api/session/validate
router.post('/validate', async (req, res, next) => {
  try {
    if (req.user) {
      res.json({ valid: true, user: req.user });
    } else {
      res.status(401).json({ valid: false });
    }
  } catch (err) {
    next(err);
  }
});

export default router; 