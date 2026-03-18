"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const stale = await prisma.$queryRaw `
    SELECT sc.kp, sc.tgl, sc.codename,
      CURRENT_DATE - sc.tgl::date as days_waiting
    FROM "SalesContract" sc
    WHERE sc.pipeline_status = 'PENDING_APPROVAL'
    AND sc.kp NOT LIKE 'kp_archived_%'
    AND CURRENT_DATE - sc.tgl::date > 180
    AND NOT EXISTS (SELECT 1 FROM "WarpingRun" wr WHERE wr.kp = sc.kp)
    AND NOT EXISTS (SELECT 1 FROM "IndigoRun" ir WHERE ir.kp = sc.kp)
    AND NOT EXISTS (SELECT 1 FROM "WeavingRecord" wv WHERE wv.kp = sc.kp)
  `;
    console.log('Stale orders:', JSON.stringify(stale.map(r => ({ kp: r.kp, days: Number(r.days_waiting) }))));
    for (const row of stale) {
        await prisma.salesContract.update({
            where: { kp: row.kp },
            data: { pipeline_status: 'REJECTED', kp_status: 'ARCHIVED', kp: `kp_archived_${row.kp}` },
        });
        console.log(`Archived ${row.kp}`);
    }
    const counts = await prisma.$queryRaw `SELECT pipeline_status, COUNT(*) c FROM "SalesContract" WHERE kp NOT LIKE 'kp_archived_%' GROUP BY pipeline_status`;
    console.log('Counts:', JSON.stringify(counts.map(c => ({ status: c.pipeline_status, count: Number(c.c) }))));
}
main().finally(() => prisma.$disconnect()).catch(console.error);
