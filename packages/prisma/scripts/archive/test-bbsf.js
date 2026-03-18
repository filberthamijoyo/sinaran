const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  await prisma.bBSFRecord.deleteMany({ where: { kp: 'BKTS' } });

  const records = [
    { kp: 'BKTS', tgl: new Date('2025-05-25'), ws_shift: 'B', ws_mc: '2' },
    { kp: 'BKLB', tgl: new Date('2025-05-26'), ws_shift: 'B', ws_mc: '1' }
  ];

  for (const record of records) {
    try {
      const r = await prisma.bBSFRecord.create({ data: record });
      console.log('Created:', r.kp);
    } catch (e) {
      console.log('Error:', e.message);
    }
  }

  console.log('Total:', await prisma.bBSFRecord.count());
  await prisma.$disconnect();
})();
