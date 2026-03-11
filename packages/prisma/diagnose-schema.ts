import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const serialize = (v: any) => JSON.stringify(v, (_, val) =>
    typeof val === 'bigint' ? Number(val) : val, 2);

  // 1. Check current kp_status values in use
  const statusCounts = await prisma.$queryRaw<any[]>`
    SELECT kp_status, COUNT(*) as count
    FROM "SalesContract"
    GROUP BY kp_status ORDER BY count DESC
  `;
  console.log('kp_status distribution:', serialize(statusCounts));

  // 2. Check the 4 test contracts and what pipeline data they have
  const testContracts = await prisma.$queryRaw<any[]>`
    SELECT sc.kp, sc.kp_sequence, sc.pipeline_status, sc.kp_status,
      (SELECT COUNT(*) FROM "WarpingRun" wr WHERE wr.kp = sc.kp) as warping,
      (SELECT COUNT(*) FROM "IndigoRun" ir WHERE ir.kp = sc.kp) as indigo,
      (SELECT COUNT(*) FROM "WeavingRecord" wv WHERE wv.kp = sc.kp) as weaving,
      (SELECT COUNT(*) FROM "WarpingBeam" wb WHERE wb.kp = sc.kp) as beams
    FROM "SalesContract" sc
    WHERE sc.kp IN ('AAQQ','AAQS','AAQD','AAQT')
  `;
  console.log('Test contracts:', serialize(testContracts));

  // 3. Check the REJECTED contracts — how many are there and do any have pipeline data?
  const rejectedWithData = await prisma.$queryRaw<any[]>`
    SELECT sc.kp, sc.tgl, sc.codename, sc.pipeline_status, sc.kp_status,
      (SELECT COUNT(*) FROM "WarpingRun" wr WHERE wr.kp = sc.kp) as warping,
      (SELECT COUNT(*) FROM "IndigoRun" ir WHERE ir.kp = sc.kp) as indigo,
      (SELECT COUNT(*) FROM "WeavingRecord" wv WHERE wv.kp = sc.kp) as weaving
    FROM "SalesContract" sc
    WHERE sc.pipeline_status = 'REJECTED'
  `;
  console.log('Rejected contracts:', serialize(rejectedWithData));

  // 4. Min and max kp_sequence ignoring the 4 test contracts
  const range = await prisma.$queryRaw<any[]>`
    SELECT MIN(kp_sequence) as min_seq, MAX(kp_sequence) as max_seq,
      COUNT(*) FILTER (WHERE kp_sequence IS NULL) as null_count,
      COUNT(*) FILTER (WHERE kp_sequence IS NOT NULL) as populated_count
    FROM "SalesContract"
    WHERE kp NOT IN ('AAQQ','AAQS','AAQD','AAQT')
  `;
  console.log('Sequence range (excl test):', serialize(range));

  // 5. Check if kp field has any entries already starting with kp_archived
  const archived = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM "SalesContract"
    WHERE kp LIKE 'kp_archived_%'
  `;
  console.log('Already archived KPs:', serialize(archived));
}
main().finally(() => prisma.$disconnect()).catch(console.error);
