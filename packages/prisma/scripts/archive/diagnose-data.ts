import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Sample of COMPLETE orders missing warping - what do they look like?
  const completeNoWarping = await prisma.$queryRaw<any[]>`
    SELECT sc.kp, sc.tgl, sc.codename, sc.pipeline_status
    FROM "SalesContract" sc
    WHERE sc.pipeline_status = 'COMPLETE'
    AND NOT EXISTS (SELECT 1 FROM "WarpingRun" wr WHERE wr.kp = sc.kp)
    ORDER BY sc.tgl ASC
    LIMIT 10
  `;
  // Are the 4 oldest PENDING_APPROVAL orders actually complete in other tables?
  const oldPending = await prisma.$queryRaw<any[]>`
    SELECT
      sc.kp, sc.tgl, sc.pipeline_status,
      (SELECT COUNT(*) FROM "WarpingRun" wr WHERE wr.kp = sc.kp) as warping_count,
      (SELECT COUNT(*) FROM "IndigoRun" ir WHERE ir.kp = sc.kp) as indigo_count,
      (SELECT COUNT(*) FROM "WeavingRecord" wv WHERE wv.kp = sc.kp) as weaving_count
    FROM "SalesContract" sc
    WHERE sc.pipeline_status = 'PENDING_APPROVAL'
    ORDER BY sc.tgl ASC
    LIMIT 10
  `;
  const serialize = (v: any) => JSON.stringify(v, (_, val) =>
    typeof val === 'bigint' ? Number(val) : val, 2);
  console.log('COMPLETE but no warping (sample):', serialize(completeNoWarping));
  console.log('Oldest PENDING - do they have pipeline data?:', serialize(oldPending));
}
main().finally(() => prisma.$disconnect()).catch(console.error);
