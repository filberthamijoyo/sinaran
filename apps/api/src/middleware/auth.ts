import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

const WEAVING_SYNC_API_KEY = process.env.WEAVING_IMPORT_API_KEY || '';

export type UserRole = 'bandung' | 'jakarta' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const signToken = (user: AuthUser): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };

export const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['x-api-key'];
  if (!WEAVING_SYNC_API_KEY || key !== WEAVING_SYNC_API_KEY) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  next();
};
