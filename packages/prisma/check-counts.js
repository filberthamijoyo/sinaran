const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Checking counts...');
  const sacon = await prisma.salesContract.count();
  const warping = await prisma.warpingRun.count();
  const indigo = await prisma.indigoRun.count();
  const weaving = await prisma.weavingRecord.count();
  console.log('SalesContract:', sacon);
  console.log('WarpingRun:', warping);
  console.log('IndigoRun:', indigo);
  console.log('WeavingRecord:', weaving);
  await prisma.$disconnect();
}

main().catch(console.error);
