"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const result = await prisma.salesContract.updateMany({
        where: { kp: { startsWith: 'kp_archived_' } },
        data: { kp_status: 'ARCHIVED' },
    });
    console.log('Updated:', result.count, 'records to ARCHIVED');
    // Verify
    const check = await prisma.salesContract.count({
        where: { kp: { startsWith: 'kp_archived_' }, kp_status: 'ACTIVE' },
    });
    console.log('Still ACTIVE archived records (should be 0):', check);
}
main().finally(() => prisma.$disconnect()).catch(console.error);
