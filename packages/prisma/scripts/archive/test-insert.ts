import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInsert() {
  console.log('Testing simple warping insert...');
  
  try {
    const result = await prisma.warpingRun.create({
      data: {
        kp: 'TEST001',
        tgl: new Date(),
        kode_full: 'DTL 1570 P',
        benang: 'E 71',
      }
    });
    console.log('Success:', result);
  } catch (err: any) {
    console.error('Error:', err.message);
    console.error('Full error:', err);
  }
  
  await prisma.$disconnect();
}

testInsert().catch(console.error);
