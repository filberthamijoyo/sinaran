"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Clearing all data...');
    // Delete in reverse order (respecting foreign keys)
    await prisma.inspectGrayRecord.deleteMany({});
    await prisma.weavingRecord.deleteMany({});
    await prisma.indigoRun.deleteMany({});
    await prisma.warpingBeam.deleteMany({});
    await prisma.warpingRun.deleteMany({});
    await prisma.salesContract.deleteMany({});
    console.log('All data cleared.');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
