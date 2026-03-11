import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  // Find all REJECTED contracts that haven't been renamed yet
  const rejected = await prisma.salesContract.findMany({
    where: {
      pipeline_status: 'REJECTED',
      kp: { not: { startsWith: 'kp_archived_' } }
    },
    select: { kp: true, kp_sequence: true }
  });
  
  console.log(`Found ${rejected.length} rejected contracts to rename:`);
  
  for (const r of rejected) {
    console.log(`  Renaming ${r.kp} (seq ${r.kp_sequence}) -> kp_archived_${r.kp}`);
    await prisma.salesContract.update({
      where: { kp: r.kp },
      data: { kp: `kp_archived_${r.kp}` }
    });
  }
  
  console.log('Done!');
}
main().finally(() => prisma.$disconnect()).catch(console.error);
