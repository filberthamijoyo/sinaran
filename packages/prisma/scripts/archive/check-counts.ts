import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sacon = await prisma.salesContract.count();
  const warping = await prisma.warpingRun.count();
  const warpingBeam = await prisma.warpingBeam.count();
  const indigo = await prisma.indigoRun.count();
  const weaving = await prisma.weavingRecord.count();
  
  console.log('SalesContract:', sacon);
  console.log('WarpingRun:', warping);
  console.log('WarpingBeam:', warpingBeam);
  console.log('IndigoRun:', indigo);
  console.log('WeavingRecord:', weaving);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
