import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw<{tbl: string, count: bigint}[]>`
    SELECT 'SalesContract' as tbl, COUNT(*) FROM "SalesContract"
    UNION ALL SELECT 'WarpingRun', COUNT(*) FROM "WarpingRun"
    UNION ALL SELECT 'IndigoRun', COUNT(*) FROM "IndigoRun"
    UNION ALL SELECT 'WeavingRecord', COUNT(*) FROM "WeavingRecord"
    UNION ALL SELECT 'WarpingBeam', COUNT(*) FROM "WarpingBeam"
  `;
  
  console.log('\n=== Table Counts ===');
  for (const row of result) {
    console.log(`${row.tbl}: ${row.count}`);
  }

  const wr = await prisma.$queryRaw<{min: Date, max: Date}>`
    SELECT MIN(tanggal) as min, MAX(tanggal) as max FROM "WeavingRecord"
  `;
  
  console.log('\n=== WeavingRecord Date Range ===');
  if (wr[0]) {
    console.log(`MIN(tanggal): ${wr[0].min}`);
    console.log(`MAX(tanggal): ${wr[0].max}`);
  }

  await prisma.$disconnect();
}

main();
