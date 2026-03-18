import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  console.log('=== Cleanup Bad Dates ===\n');
  
  // First check how many bad records exist
  const badRecords = await prisma.$queryRawUnsafe<{count: bigint}[]>(`
    SELECT COUNT(*) as count FROM "InspectFinishRecord" WHERE tgl_potong > '2100-01-01'
  `);
  console.log(`Records with tgl_potong > 2100-01-01: ${badRecords[0].count}`);
  
  // Delete them
  const result = await prisma.$executeRawUnsafe(`
    DELETE FROM "InspectFinishRecord" WHERE tgl_potong > '2100-01-01'
  `);
  console.log(`Deleted ${result} records`);
  
  // Verify remaining count
  const remainingCount = await prisma.inspectFinishRecord.count();
  console.log(`Remaining InspectFinishRecord count: ${remainingCount}`);
  
  // Check new max date
  const maxDate = await prisma.$queryRawUnsafe<{max_date: Date}[]>(`
    SELECT MAX(tgl_potong) as max_date FROM "InspectFinishRecord"
  `);
  console.log(`Max tgl_potong: ${maxDate[0].max_date}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
