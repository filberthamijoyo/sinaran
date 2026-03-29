import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken, AuthUser, requireAuth, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Hardcoded users — replace with DB later
const USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: '1',
    email: 'factory@sinaran.com',
    name: 'Factory Operator',
    role: 'factory',
    passwordHash: bcrypt.hashSync('factory123', 10),
  },
  {
    id: '2',
    email: 'jakarta@sinaran.com',
    name: 'Approver Jakarta',
    role: 'jakarta',
    passwordHash: bcrypt.hashSync('jakarta123', 10),
  },
  {
    id: '3',
    email: 'admin@sinaran.com',
    name: 'Admin / Owner',
    role: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
  },
];

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const { passwordHash, ...userData } = user;
  const token = signToken(userData);
  return res.json({ token, user: userData });
});

router.get('/me', (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
    const payload = jwt.verify(header.slice(7), secret);
    return res.json({ user: payload });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

// GET /api/auth/users — list all users (admin only)
router.get('/users', requireAuth, requireRole('admin'),
  async (_req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          stage: true,
          createdAt: true,
          updatedAt: true,
          active: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ items: users });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/auth/users — create a new user (admin only)
router.post('/users', requireAuth, requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, stage } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
        stage?: string;
      };

      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'name, email, password, and role are required' });
      }
      if (!['admin', 'factory', 'jakarta'].includes(role)) {
        return res.status(400).json({ error: "role must be one of: admin, factory, jakarta" });
      }
      if (role === 'factory' && !stage) {
        return res.status(400).json({ error: 'stage is required when role is factory' });
      }
      if (stage && !['warping', 'indigo', 'weaving', 'inspect_gray', 'bbsf', 'inspect_finish', 'sacon'].includes(stage)) {
        return res.status(400).json({ error: 'stage must be one of: warping, indigo, weaving, inspect_gray, bbsf, inspect_finish, sacon' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role,
          stage: stage ?? null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          stage: true,
          createdAt: true,
          updatedAt: true,
          active: true,
        },
      });
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/auth/users/:id — update user name/role/stage (admin only)
router.put('/users/:id', requireAuth, requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

      const { name, role, stage } = req.body as {
        name?: string;
        role?: string;
        stage?: string;
      };

      if (role && !['admin', 'factory', 'jakarta'].includes(role)) {
        return res.status(400).json({ error: "role must be one of: admin, factory, jakarta" });
      }
      if (stage !== undefined && stage !== null && !['warping', 'indigo', 'weaving', 'inspect_gray', 'bbsf', 'inspect_finish', 'sacon'].includes(stage)) {
        return res.status(400).json({ error: 'stage must be one of: warping, indigo, weaving, inspect_gray, bbsf, inspect_finish, sacon' });
      }
      if (role === 'factory' && !stage) {
        return res.status(400).json({ error: 'stage is required when role is factory' });
      }

      const data: any = {};
      if (name !== undefined) data.name = name;
      if (role !== undefined) data.role = role;
      if (stage !== undefined) data.stage = stage;

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          stage: true,
          createdAt: true,
          updatedAt: true,
          active: true,
        },
      });
      return res.json(user);
    } catch (err: any) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
      return res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/auth/users/:id/password — change user password (admin only)
router.put('/users/:id/password', requireAuth, requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

      const { newPassword } = req.body as { newPassword?: string };
      if (!newPassword) {
        return res.status(400).json({ error: 'newPassword is required' });
      }

      const passwordHash = bcrypt.hashSync(newPassword, 10);
      await prisma.user.update({
        where: { id },
        data: { password: passwordHash },
      });
      return res.json({ success: true });
    } catch (err: any) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
      return res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/auth/users/:id — soft delete a user (admin only)
router.delete('/users/:id', requireAuth, requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

      await prisma.user.update({
        where: { id },
        data: { active: false },
      });
      return res.json({ success: true });
    } catch (err: any) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
      return res.status(500).json({ error: err.message });
    }
  }
);
