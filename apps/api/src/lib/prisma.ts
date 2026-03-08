import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables before initializing Prisma.
// In a monorepo, the API workspace may run with cwd = `apps/api`,
// while the shared `.env` typically lives at the repo root.
// Check project root first (../../.env) before local .env
const envCandidates = [
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    console.log(`[Prisma] Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  } else {
    console.log(`[Prisma] .env not found at: ${envPath}`);
  }
}

// Debug: Check if DATABASE_URL is loaded
console.log(`[Prisma] DATABASE_URL loaded:`, process.env.DATABASE_URL ? 'YES' : 'NO');
if (!process.env.DATABASE_URL) {
  console.log(`[Prisma] DATABASE_URL is undefined!`);
}

// Singleton pattern to prevent multiple PrismaClient instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to test database connection
export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.message || 'Unknown database connection error' 
    };
  }
}
