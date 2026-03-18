"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('=== Fix 1: Deleting orphaned pipeline records ===\n');
    // Delete weaving records with no matching SalesContract
    console.log('Deleting orphaned WeavingRecords...');
    const wvResult = await prisma.$executeRaw `
    DELETE FROM "WeavingRecord"
    WHERE NOT EXISTS (
      SELECT 1 FROM "SalesContract" sc WHERE sc.kp = "WeavingRecord".kp
    )
  `;
    console.log(`Deleted ${wvResult} weaving records`);
    // Delete indigo runs with no matching SalesContract
    console.log('\nDeleting orphaned IndigoRuns...');
    const irResult = await prisma.$executeRaw `
    DELETE FROM "IndigoRun"
    WHERE NOT EXISTS (
      SELECT 1 FROM "SalesContract" sc WHERE sc.kp = "IndigoRun".kp
    )
  `;
    console.log(`Deleted ${irResult} indigo runs`);
    // Delete warping beams with no matching SalesContract
    console.log('\nDeleting orphaned WarpingBeams...');
    const wbResult = await prisma.$executeRaw `
    DELETE FROM "WarpingBeam"
    WHERE NOT EXISTS (
      SELECT 1 FROM "SalesContract" sc WHERE sc.kp = "WarpingBeam".kp
    )
  `;
    console.log(`Deleted ${wbResult} warping beams`);
    // Delete warping runs with no matching SalesContract
    console.log('\nDeleting orphaned WarpingRuns...');
    const wrResult = await prisma.$executeRaw `
    DELETE FROM "WarpingRun"
    WHERE NOT EXISTS (
      SELECT 1 FROM "SalesContract" sc WHERE sc.kp = "WarpingRun".kp
    )
  `;
    console.log(`Deleted ${wrResult} warping runs`);
    // Verify orphans are gone
    console.log('\n=== Verifying orphans are gone ===\n');
    const wrCount = await prisma.$queryRaw `
    SELECT COUNT(*) FROM "WarpingRun" wr
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = wr.kp)
  `;
    console.log(`WarpingRun orphans: ${wrCount[0].count}`);
    const irCount = await prisma.$queryRaw `
    SELECT COUNT(*) FROM "IndigoRun" ir
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = ir.kp)
  `;
    console.log(`IndigoRun orphans: ${irCount[0].count}`);
    const wvCount = await prisma.$queryRaw `
    SELECT COUNT(*) FROM "WeavingRecord" wv
    WHERE NOT EXISTS (SELECT 1 FROM "SalesContract" sc WHERE sc.kp = wv.kp)
  `;
    console.log(`WeavingRecord orphans: ${wvCount[0].count}`);
    await prisma.$disconnect();
}
main();
