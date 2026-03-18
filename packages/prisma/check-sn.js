const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('=== Sample SN values from InspectFinishRecord ===');
  const samples = await prisma.$queryRaw`
    SELECT DISTINCT sn FROM "InspectFinishRecord" WHERE sn IS NOT NULL LIMIT 30
  `;
  for (const s of samples) {
    console.log(`  "${s.sn}"`);
  }

  console.log('\n=== Sample SN values from InspectGrayRecord ===');
  const graySamples = await prisma.$queryRaw`
    SELECT DISTINCT sn FROM "InspectGrayRecord" WHERE sn IS NOT NULL LIMIT 30
  `;
  for (const s of graySamples) {
    console.log(`  "${s.sn}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
