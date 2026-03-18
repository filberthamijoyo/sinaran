import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  console.log('=== Record Counts ===');
  
  const result = await prisma.$queryRawUnsafe(`
    SELECT 'InspectGrayRecord' as tbl, COUNT(*) as count FROM "InspectGrayRecord"
    UNION ALL SELECT 'BBSFRecord', COUNT(*) FROM "BBSFRecord"
    UNION ALL SELECT 'InspectFinishRecord', COUNT(*) FROM "InspectFinishRecord"
  `);
  console.log(result);
  
  console.log('\n=== Date Ranges ===');
  
  const igDates = await prisma.$queryRawUnsafe(`SELECT MIN(tg) as min_date, MAX(tg) as max_date FROM "InspectGrayRecord"`);
  console.log('InspectGrayRecord tg:', igDates[0]);
  
  const bbsfDates = await prisma.$queryRawUnsafe(`SELECT MIN(tgl) as min_date, MAX(tgl) as max_date FROM "BBSFRecord"`);
  console.log('BBSFRecord tgl:', bbsfDates[0]);
  
  const infDates = await prisma.$queryRawUnsafe(`SELECT MIN(tgl_potong) as min_date, MAX(tgl_potong) as max_date FROM "InspectFinishRecord"`);
  console.log('InspectFinishRecord tgl_potong:', infDates[0]);
  
  console.log('\n=== Orphaned Records ===');
  
  const igOrphan = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "InspectGrayRecord" ig WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = ig.kp)`);
  console.log('InspectGrayRecord orphaned:', igOrphan[0].count);
  
  const bbsfOrphan = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "BBSFRecord" b WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = b.kp)`);
  console.log('BBSFRecord orphaned:', bbsfOrphan[0].count);
  
  const infOrphan = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "InspectFinishRecord" inf WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = inf.kp)`);
  console.log('InspectFinishRecord orphaned:', infOrphan[0].count);
  
  await prisma.$disconnect();
}

main().catch(console.error);
