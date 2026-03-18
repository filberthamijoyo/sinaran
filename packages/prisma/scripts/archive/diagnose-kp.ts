import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Highest KP sequence currently in DB
  const highest = await prisma.salesContract.findFirst({
    orderBy: { kp_sequence: 'desc' },
    select: { kp: true, kp_sequence: true, tgl: true },
  });
  // Lowest KP sequence currently in DB
  const lowest = await prisma.salesContract.findFirst({
    orderBy: { kp_sequence: 'asc' },
    select: { kp: true, kp_sequence: true, tgl: true },
  });
  // Last 5 created contracts (by date)
  const recent = await prisma.salesContract.findMany({
    orderBy: { tgl: 'desc' },
    take: 5,
    select: { kp: true, kp_sequence: true, tgl: true },
  });
  // What sequence would the NEXT KP get right now?
  // Check what generateNextKP() returns
  const gaps = await prisma.$queryRaw<any[]>`
    SELECT kp_sequence FROM "SalesContract"
    WHERE kp_sequence IS NOT NULL
    ORDER BY kp_sequence ASC
    LIMIT 10
  `;
  console.log('Highest KP:', JSON.stringify(highest));
  console.log('Lowest KP:', JSON.stringify(lowest));
  console.log('Recent 5:', JSON.stringify(recent));
  console.log('First 10 sequences:', JSON.stringify(gaps));
}
main().finally(() => prisma.$disconnect()).catch(console.error);
