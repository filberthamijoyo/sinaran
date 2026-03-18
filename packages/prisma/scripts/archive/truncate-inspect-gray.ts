import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Truncating InspectGrayRecord...');
  await prisma.inspectGrayRecord.deleteMany();
  console.log('Done.');
  
  const count = await prisma.inspectGrayRecord.count();
  console.log(`Current count: ${count}`);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
