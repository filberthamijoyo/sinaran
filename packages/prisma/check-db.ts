import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const saconCount = await prisma.salesContract.count();
  const warpingCount = await prisma.warpingRun.count();
  const indigoCount = await prisma.indigoRun.count();
  const weavingCount = await prisma.weavingRecord.count();

  console.log('=== Current Database State ===');
  console.log(`SalesContract: ${saconCount}`);
  console.log(`WarpingRun: ${warpingCount}`);
  console.log(`IndigoRun: ${indigoCount}`);
  console.log(`WeavingRecord: ${weavingCount}`);

  console.log('\n=== Sample SalesContract rows ===');
  const sampleSacon = await prisma.salesContract.findMany({ take: 5 });
  console.log(JSON.stringify(sampleSacon, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
