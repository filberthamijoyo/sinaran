/**
 * One-time fix: dates that were parsed as D/M/YYYY but source was M/D/YYYY.
 * e.g. 1/4/2026 (Jan 4) was stored as 2026-04-01 (Apr 1).
 * Fix: any date with day=1 and month 2..12 → correct to year-01-{month}.
 *
 * Run: cd packages/prisma && dotenv -e ../../.env -- npx ts-node scripts/fix-date-mdy.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Fix M/D/YYYY dates stored as D/M/YYYY ===\n');

  // InspectGrayRecord: tg and tgl_potong
  const igTg = await prisma.$executeRawUnsafe(`
    UPDATE "InspectGrayRecord"
    SET tg = make_date(EXTRACT(year FROM tg)::int, 1, EXTRACT(month FROM tg)::int)
    WHERE EXTRACT(day FROM tg) = 1 AND EXTRACT(month FROM tg) BETWEEN 2 AND 12
  `);
  console.log(`InspectGrayRecord.tg: corrected ${igTg} row(s)`);

  const igTglPotong = await prisma.$executeRawUnsafe(`
    UPDATE "InspectGrayRecord"
    SET tgl_potong = make_date(EXTRACT(year FROM tgl_potong)::int, 1, EXTRACT(month FROM tgl_potong)::int)
    WHERE tgl_potong IS NOT NULL
      AND EXTRACT(day FROM tgl_potong) = 1
      AND EXTRACT(month FROM tgl_potong) BETWEEN 2 AND 12
  `);
  console.log(`InspectGrayRecord.tgl_potong: corrected ${igTglPotong} row(s)`);

  // InspectFinishRecord: tgl and tgl_potong
  const ifTgl = await prisma.$executeRawUnsafe(`
    UPDATE "InspectFinishRecord"
    SET tgl = make_date(EXTRACT(year FROM tgl)::int, 1, EXTRACT(month FROM tgl)::int)
    WHERE EXTRACT(day FROM tgl) = 1 AND EXTRACT(month FROM tgl) BETWEEN 2 AND 12
  `);
  console.log(`InspectFinishRecord.tgl: corrected ${ifTgl} row(s)`);

  const ifTglPotong = await prisma.$executeRawUnsafe(`
    UPDATE "InspectFinishRecord"
    SET tgl_potong = make_date(EXTRACT(year FROM tgl_potong)::int, 1, EXTRACT(month FROM tgl_potong)::int)
    WHERE tgl_potong IS NOT NULL
      AND EXTRACT(day FROM tgl_potong) = 1
      AND EXTRACT(month FROM tgl_potong) BETWEEN 2 AND 12
  `);
  console.log(`InspectFinishRecord.tgl_potong: corrected ${ifTglPotong} row(s)`);

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
