import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Overall stats
  const stats = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*), MIN(tg)::date, MAX(tg)::date FROM "InspectGrayRecord"
  `;
  console.log('=== Overall Stats ===');
  console.log(`COUNT: ${stats[0].count}`);
  console.log(`MIN: ${stats[0].min}`);
  console.log(`MAX: ${stats[0].max}`);
  
  // Month breakdown
  console.log('\n=== Month Breakdown ===');
  const months = await prisma.$queryRaw<any[]>`
    SELECT EXTRACT(month FROM tg) as month, COUNT(*) as count 
    FROM "InspectGrayRecord" 
    GROUP BY 1 ORDER BY 1
  `;
  months.forEach(r => {
    console.log(`Month ${r.month}: ${r.count}`);
  });
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
