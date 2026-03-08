import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Truncating all historical data tables...');
  
  // Truncate all four tables
  await prisma.warpingBeam.deleteMany();
  await prisma.warpingRun.deleteMany();
  await prisma.indigoRun.deleteMany();
  await prisma.weavingRecord.deleteMany();
  await prisma.salesContract.deleteMany();
  
  const saconCount = await prisma.salesContract.count();
  const warpingCount = await prisma.warpingRun.count();
  const indigoCount = await prisma.indigoRun.count();
  const weavingCount = await prisma.weavingRecord.count();
  
  console.log('\n=== After truncation ===');
  console.log(`SalesContract: ${saconCount}`);
  console.log(`WarpingRun: ${warpingCount}`);
  console.log(`IndigoRun: ${indigoCount}`);
  console.log(`WeavingRecord: ${weavingCount}`);
  
  console.log('\n✅ All data wiped successfully!');
  await prisma.$disconnect();
}

main().catch(console.error);
