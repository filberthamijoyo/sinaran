import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { prisma, testDatabaseConnection } from './lib/prisma';
import qualityRoutes from './routes/quality';
import productionRoutes from './routes/production';
import unifiedRoutes from './routes/unified';
import indigoRoutes from './routes/indigo';
import denimRoutes from './routes/denim';
import authRouter from './routes/auth';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use(helmet());

// Rate limiting — 200 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit on auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Health check with database connection test
app.get('/api/health', async (req, res) => {
  const dbStatus = await testDatabaseConnection();
  res.json({ 
    status: dbStatus.connected ? 'ok' : 'error',
    message: 'Unified API server is running',
    database: dbStatus.connected ? 'connected' : `disconnected: ${dbStatus.error}`
  });
});

// Quality module routes
app.use('/api/quality', qualityRoutes);

// Production module routes
app.use('/api/production', productionRoutes);

// Unified routes for overlapping entities
app.use('/api/unified', unifiedRoutes);

// Indigo Division routes
app.use('/api/indigo', indigoRoutes);

// Denim (Weaving) Division routes
app.use('/api/denim', denimRoutes);

// Auth routes
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Unified API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Quality API: http://localhost:${PORT}/api/quality`);
  console.log(`🏭 Production API: http://localhost:${PORT}/api/production`);
  console.log(`🔗 Unified API: http://localhost:${PORT}/api/unified`);
  console.log(`🎨 Indigo API: http://localhost:${PORT}/api/indigo`);
  console.log(`🧵 Denim API: http://localhost:${PORT}/api/denim`);
  console.log(`🔌 Socket.IO initialized`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
