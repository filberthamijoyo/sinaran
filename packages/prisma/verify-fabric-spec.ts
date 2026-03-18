import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.fabricSpec.count();
  console.log(`Total FabricSpec records: ${count}`);
  
  const samples = await prisma.fabricSpec.findMany({
    take: 5,
    select: {
      item: true,
      kons_kode: true,
      kat_kode: true,
      te: true,
    },
  });
  
  console.log('\nFirst 5 records:');
  for (const s of samples) {
    console.log(s);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());