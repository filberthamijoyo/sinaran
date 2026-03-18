import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

function decodeSN(sn: string): { machine: string; beam: number; lot: string } | null {
  if (!sn) return null;
  const m = sn.trim().match(/^([A-Z]{1,3}\d{2})(\d+)([A-Z]\d+[A-Z N])$/);
  if (!m) return null;
  return { machine: m[1], beam: parseInt(m[2]), lot: m[3] };
}

async function main() {
  console.log('=== Step 1: Decode InspectFinishRecord SN ===\n');

  // Get all records that need decoding
  const records = await prisma.$queryRaw<{ id: number; sn: string }[]>`
    SELECT id, sn FROM "InspectFinishRecord"
    WHERE sn IS NOT NULL AND sn_machine IS NULL
  `;

  console.log(`  Found ${records.length} records to decode`);

  // Decode all in memory
  const toUpdate: { id: number; machine: string; beam: number; lot: string }[] = [];
  const failed: string[] = [];

  for (const r of records) {
    const decoded = decodeSN(r.sn);
    if (decoded) {
      toUpdate.push({ id: r.id, ...decoded });
    } else {
      failed.push(r.sn);
    }
  }

  console.log(`  Successfully decoded: ${toUpdate.length}`);
  console.log(`  Failed: ${failed.length}`);

  // Update in batches using Promise.all for parallelism
  const batchSize = 50;
  let updated = 0;

  for (let i = 0; i < toUpdate.length; i += batchSize) {
    const batch = toUpdate.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(c =>
        prisma.inspectFinishRecord.update({
          where: { id: c.id },
          data: { sn_machine: c.machine, sn_beam: c.beam, sn_lot: c.lot },
        })
      )
    );
    
    updated += batch.length;
    console.log(`  Updated ${updated}/${toUpdate.length} records...`);
  }

  console.log(`\n=== Step 2: Copy sn_combined to sn_full in InspectGrayRecord ===\n`);

  // Use raw SQL for column-to-column copy
  await prisma.$executeRaw`
    UPDATE "InspectGrayRecord" 
    SET sn_full = sn_combined 
    WHERE sn_combined IS NOT NULL AND sn_full IS NULL
  `;

  const grayCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM "InspectGrayRecord" WHERE sn_full IS NOT NULL
  `;
  console.log(`  InspectGrayRecord with sn_full: ${grayCount[0].count}`);

  console.log('\n=== Verification ===\n');

  // Verify InspectFinishRecord
  const finishStats = await prisma.$queryRaw<{ total: bigint; decoded: bigint; failed: bigint }[]>`
    SELECT 
      COUNT(*) as total,
      COUNT(sn_machine) as decoded,
      COUNT(*) - COUNT(sn_machine) as failed
    FROM "InspectFinishRecord"
    WHERE sn IS NOT NULL
  `;
  console.log('InspectFinishRecord:');
  console.log(`  Total with sn: ${finishStats[0].total}`);
  console.log(`  Decoded: ${finishStats[0].decoded}`);
  console.log(`  Failed: ${finishStats[0].failed}`);

  // Show failed samples
  console.log('\n  Sample failed records:');
  const failedSamples = await prisma.$queryRaw<{ sn: string }[]>`
    SELECT sn FROM "InspectFinishRecord"
    WHERE sn IS NOT NULL AND sn_machine IS NULL
    LIMIT 10
  `;
  for (const s of failedSamples) {
    console.log(`    "${s.sn}"`);
  }

  // Verify InspectGrayRecord
  const grayStats = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM "InspectGrayRecord" WHERE sn_full IS NOT NULL
  `;
  console.log('\nInspectGrayRecord:');
  console.log(`  With sn_full: ${grayStats[0].count}`);

  console.log('\n=== DONE ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
