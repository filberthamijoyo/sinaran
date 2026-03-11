import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken, AuthUser } from '../middleware/auth';

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
