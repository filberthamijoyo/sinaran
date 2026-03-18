import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Q2: KP BUTS in each table ===');
  
  console.log('\n--- SalesContract ---');
  const scons = await prisma.$queryRaw<{id: number, kp: string, tgl: Date}[]>`
    SELECT id, kp, tgl FROM "SalesContract" WHERE kp = 'BUTS'
  `;
  console.log(scons);

  console.log('\n--- WarpingRun ---');
  const warps = await prisma.$queryRaw<{id: number, kp: string, tgl: Date}[]>`
    SELECT id, kp, tgl FROM "WarpingRun" WHERE kp = 'BUTS'
  `;
  console.log(warps);

  console.log('\n--- IndigoRun ---');
  const indigs = await prisma.$queryRaw<{id: number, kp: string, tanggal: Date}[]>`
    SELECT id, kp, tanggal FROM "IndigoRun" WHERE kp = 'BUTS'
  `;
  console.log(indigs);

  console.log('\n--- WeavingRecord ---');
  const weavs = await prisma.$queryRaw<{id: number, kp: string, tanggal: Date, machine: string, shift: string}[]>`
    SELECT id, kp, tanggal, machine, shift FROM "WeavingRecord" WHERE kp = 'BUTS' LIMIT 5
  `;
  console.log(weavs);

  console.log('\n\n=== Q3: KP Matching ===');

  console.log('\n--- WarpingRuns with matching SalesContract ---');
  const wrMatch = await prisma.$queryRaw<{count: bigint}>`
    SELECT COUNT(*) FROM "WarpingRun" wr
    WHERE EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = wr.kp)
  `;
  console.log(wrMatch);

  console.log('\n--- WarpingRuns WITHOUT matching SalesContract ---');
  const wrNoMatch = await prisma.$queryRaw<{count: bigint}>`
    SELECT COUNT(*) FROM "WarpingRun" wr
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = wr.kp)
  `;
  console.log(wrNoMatch);

  console.log('\n--- IndigoRuns WITHOUT matching SalesContract ---');
  const irNoMatch = await prisma.$queryRaw<{count: bigint}>`
    SELECT COUNT(*) FROM "IndigoRun" ir
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = ir.kp)
  `;
  console.log(irNoMatch);

  console.log('\n--- WeavingRecords WITHOUT matching SalesContract ---');
  const wvNoMatch = await prisma.$queryRaw<{count: bigint}>`
    SELECT COUNT(*) FROM "WeavingRecord" wv
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = wv.kp)
  `;
  console.log(wvNoMatch);

  console.log('\n\n=== Q4: Sample KPs in Warping but NOT in SalesContract ===');
  const sampleKPs = await prisma.$queryRaw<{kp: string}[]>`
    SELECT DISTINCT wr.kp FROM "WarpingRun" wr
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = wr.kp)
    LIMIT 10
  `;
  console.log(sampleKPs);

  await prisma.$disconnect();
}

main();
