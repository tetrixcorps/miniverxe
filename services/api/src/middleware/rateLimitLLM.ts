import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
interface AuthUser {
  id: string;
  role: string;
}
interface AuthRequest extends Request {
  user?: AuthUser;
}

// In-memory store for dev/demo. Use Redis or DB for production.
const userRequestCounts: Record<string, { count: number; lastReset: number }> = {};
const DAILY_LIMIT = 10;

export function rateLimitLLM(req: AuthRequest, res: Response, next: NextFunction) {
  // Assume req.user is set by authentication middleware
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;

  // Super Admins are exempt
  if (req.user.role === 'SuperAdmin') return next();

  const today = new Date().setHours(0, 0, 0, 0);
  if (!userRequestCounts[userId] || userRequestCounts[userId].lastReset < today) {
    userRequestCounts[userId] = { count: 0, lastReset: today };
  }
  if (userRequestCounts[userId].count >= DAILY_LIMIT) {
    return res.status(429).json({ error: 'LLM daily request limit reached. Contact admin for more.' });
  }
  userRequestCounts[userId].count++;
  next();
}

// To grant more requests, an admin endpoint can reset or increment userRequestCounts[userId].count
// For production, persist counts in DB or Redis and reset daily via cron. 