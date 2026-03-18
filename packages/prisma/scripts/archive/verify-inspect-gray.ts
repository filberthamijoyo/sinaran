import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count, MIN(tg)::date as min_date, MAX(tg)::date as max_date FROM "InspectGrayRecord"
  `;
  console.log(result);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
