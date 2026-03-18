"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const TEST_KPS = ['AAQQ', 'AAQS', 'AAQD', 'AAQT'];
    // Delete in dependency order
    const beams = await prisma.warpingBeam.deleteMany({ where: { kp: { in: TEST_KPS } } });
    console.log('Deleted beams:', beams.count);
    const weaving = await prisma.weavingRecord.deleteMany({ where: { kp: { in: TEST_KPS } } });
    console.log('Deleted weaving:', weaving.count);
    const indigo = await prisma.indigoRun.deleteMany({ where: { kp: { in: TEST_KPS } } });
    console.log('Deleted indigo:', indigo.count);
    const warping = await prisma.warpingRun.deleteMany({ where: { kp: { in: TEST_KPS } } });
    console.log('Deleted warping:', warping.count);
    const contracts = await prisma.salesContract.deleteMany({ where: { kp: { in: TEST_KPS } } });
    console.log('Deleted contracts:', contracts.count);
    // Verify all gone
    const remaining = await prisma.salesContract.count({ where: { kp: { in: TEST_KPS } } });
    console.log('Remaining test contracts (should be 0):', remaining);
}
main().finally(() => prisma.$disconnect()).catch(console.error);
