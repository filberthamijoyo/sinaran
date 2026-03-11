import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  // Check what's at sequence 3262 (BGND)
  const atFloor = await prisma.salesContract.findFirst({
    where: { kp_sequence: 3262 },
    select: { kp: true, pipeline_status: true, kp_status: true }
  });
  console.log('At floor (3262):', atFloor);

  // Check active sequences count
  const activeSeqs = await prisma.salesContract.findMany({
    where: {
      kp_sequence: { not: null },
      pipeline_status: { not: 'REJECTED' },
      kp: { not: { startsWith: 'kp_archived_' } },
    },
    select: { kp_sequence: true },
  });
  console.log('Active sequences count:', activeSeqs.length);
  
  // Get min and max active
  const activeNums = activeSeqs.map(r => r.kp_sequence).sort((a, b) => a - b);
  console.log('Min active:', activeNums[0], '| Max active:', activeNums[activeNums.length - 1]);
  
  // Check what's at ceiling
  const atCeiling = await prisma.salesContract.findFirst({
    where: { kp_sequence: 4649 },
    select: { kp: true, pipeline_status: true, kp_status: true }
  });
  console.log('At ceiling (4649):', atCeiling);
}
main().finally(() => prisma.$disconnect()).catch(console.error);
