"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Truncating SalesContract table...');
    // First check current state
    const countBefore = await prisma.salesContract.count();
    console.log(`SalesContract count before: ${countBefore}`);
    // Delete all SalesContract records
    await prisma.salesContract.deleteMany();
    const countAfter = await prisma.salesContract.count();
    console.log(`SalesContract count after: ${countAfter}`);
    console.log('\n✅ Garbage data wiped successfully!');
    await prisma.$disconnect();
}
main().catch(console.error);
