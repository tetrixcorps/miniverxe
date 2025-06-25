import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebase';

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = await auth.verifyIdToken(token, true);
    (req as any).user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
} 