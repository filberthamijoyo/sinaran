import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== Final Verification ===\n");
  
  const tables = [
    { name: 'SalesContract', count: await prisma.salesContract.count() },
    { name: 'WarpingRun', count: await prisma.warpingRun.count() },
    { name: 'WarpingBeam', count: await prisma.warpingBeam.count() },
    { name: 'IndigoRun', count: await prisma.indigoRun.count() },
    { name: 'WeavingRecord', count: await prisma.weavingRecord.count() },
    { name: 'InspectGrayRecord', count: await prisma.inspectGrayRecord.count() },
    { name: 'BBSFWashingRun', count: await prisma.bBSFWashingRun.count() },
    { name: 'BBSFSanforRun', count: await prisma.bBSFSanforRun.count() },
    { name: 'BBSFServiceRecord', count: await prisma.bBSFServiceRecord.count() },
    { name: 'InspectFinishRecord', count: await prisma.inspectFinishRecord.count() },
  ];
  
  console.log("tbl".padEnd(25) + "count");
  console.log("-".repeat(35));
  for (const t of tables) {
    console.log(t.name.padEnd(25) + t.count.toLocaleString());
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
