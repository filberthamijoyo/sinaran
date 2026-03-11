import { PrismaClient } from '@prisma/client';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGIT = ['Q','S','D','T','E','L','N','J','P','B'];
function decodeKP(kp: string): number | null {
  if (!kp || kp.length !== 4) return null;
  const p1 = ALPHA.indexOf(kp[0].toUpperCase());
  const p2 = ALPHA.indexOf(kp[1].toUpperCase());
  const p3 = DIGIT.indexOf(kp[2].toUpperCase());
  const p4 = DIGIT.indexOf(kp[3].toUpperCase());
  if (p1 < 0 || p2 < 0 || p3 < 0 || p4 < 0) return null;
  return p1 * 2600 + p2 * 100 + p3 * 10 + p4;
}
const prisma = new PrismaClient();
async function main() {
  const contracts = await prisma.salesContract.findMany({
    where: { kp_sequence: null },
    select: { kp: true },
  });
  console.log(`Backfilling ${contracts.length} contracts...`);
  let updated = 0, skipped = 0;
  for (const c of contracts) {
    const seq = decodeKP(c.kp);
    if (seq === null) { console.warn(`Skipping invalid KP: ${c.kp}`); skipped++; continue; }
    await prisma.salesContract.update({
      where: { kp: c.kp },
      data: { kp_sequence: seq },
    });
    updated++;
  }
  console.log(`Done: ${updated} updated, ${skipped} skipped`);
  const serialize = (v: any) => JSON.stringify(v, (_, val) =>
    typeof val === 'bigint' ? Number(val) : val, 2);
  const range = await prisma.$queryRaw<any[]>`
    SELECT
      MIN(kp_sequence) as min_seq,
      MAX(kp_sequence) as max_seq,
      COUNT(*) FILTER (WHERE kp_sequence IS NULL) as still_null
    FROM "SalesContract"
  `;
  console.log('Sequence range after backfill:', serialize(range));
  const floor = await prisma.salesContract.findFirst({
    orderBy: { kp_sequence: 'asc' },
    select: { kp: true, kp_sequence: true, tgl: true },
  });
  const ceiling = await prisma.salesContract.findFirst({
    orderBy: { kp_sequence: 'desc' },
    select: { kp: true, kp_sequence: true, tgl: true },
  });
  console.log('Floor (lowest KP):', serialize(floor));
  console.log('Ceiling (highest KP):', serialize(ceiling));
}
main().finally(() => prisma.$disconnect()).catch(console.error);
