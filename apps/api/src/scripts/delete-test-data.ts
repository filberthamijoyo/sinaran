/**
 * Script to delete test data created on March 11, 2026
 * 
 * Usage:
 *   npx ts-node src/scripts/delete-test-data.ts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables - same logic as prisma.ts
const envCandidates = [
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // March 11, 2026 start and end (UTC)
  const startOfDay = new Date('2026-03-11T00:00:00.000Z');
  const endOfDay = new Date('2026-03-11T23:59:59.999Z');

  console.log('=== Deleting test data from March 11, 2026 ===\n');
  console.log('Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
  console.log('');

  // First, let's see what will be deleted
  console.log('--- Preview (will be deleted) ---\n');

  const sacons = await prisma.salesContract.findMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } },
    select: { id: true, kp: true, tgl: true, pipeline_status: true }
  });
  console.log('SalesContracts:', sacons.length);
  sacons.forEach(s => console.log(`  - ${s.kp} (${s.pipeline_status})`));

  const warping = await prisma.warpingRun.findMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } },
    select: { id: true, kp: true, tgl: true }
  });
  console.log('\nWarpingRuns:', warping.length);
  warping.forEach(w => console.log(`  - ${w.kp}`));

  const indigo = await prisma.indigoRun.findMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } },
    select: { id: true, kp: true, tgl: true }
  });
  console.log('\nIndigoRuns:', indigo.length);
  indigo.forEach(i => console.log(`  - ${i.kp}`));

  const weaving = await prisma.weavingRecord.findMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } },
    select: { id: true, kp: true, tgl: true }
  });
  console.log('\nWeavingRecords:', weaving.length);
  weaving.forEach(w => console.log(`  - ${w.kp}`));

  const inspectGray = await prisma.inspectGrayRecord.findMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } },
    select: { id: true, kp: true, tgl: true }
  });
  console.log('\nInspectGrayRecords:', inspectGray.length);
  inspectGray.forEach(i => console.log(`  - ${i.kp}`));

  const total = sacons.length + warping.length + indigo.length + weaving.length + inspectGray.length;
  console.log('\n--- Total records to delete:', total, '---\n');

  if (total === 0) {
    console.log('No records found to delete. Exiting.');
    return;
  }

  // Confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise<string>((resolve) => {
    readline.question('Do you want to proceed with deletion? (yes/no): ', resolve);
  });
  readline.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('Cancelled.');
    return;
  }

  console.log('\n--- Deleting ---\n');

  // Delete in correct order (child records first)
  
  // InspectGrayRecords
  const deletedInspectGray = await prisma.inspectGrayRecord.deleteMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } }
  });
  console.log(`Deleted ${deletedInspectGray.count} InspectGrayRecords`);

  // WeavingRecords
  const deletedWeaving = await prisma.weavingRecord.deleteMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } }
  });
  console.log(`Deleted ${deletedWeaving.count} WeavingRecords`);

  // IndigoRuns
  const deletedIndigo = await prisma.indigoRun.deleteMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } }
  });
  console.log(`Deleted ${deletedIndigo.count} IndigoRuns`);

  // WarpingBeams (must delete before WarpingRuns due to FK constraint)
  const deletedWarpingBeams = await prisma.warpingBeam.deleteMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } }
  });
  console.log(`Deleted ${deletedWarpingBeams.count} WarpingBeams`);

  // WarpingRuns
  const deletedWarping = await prisma.warpingRun.deleteMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } }
  });
  console.log(`Deleted ${deletedWarping.count} WarpingRuns`);

  // SalesContracts (last - parent)
  const deletedSacons = await prisma.salesContract.deleteMany({
    where: { created_at: { gte: startOfDay, lte: endOfDay } }
  });
  console.log(`Deleted ${deletedSacons.count} SalesContracts`);

  console.log('\n✅ Deletion complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
