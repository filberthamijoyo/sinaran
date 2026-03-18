"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Check what's at sequence 3262 now
    const atFloor = await prisma.salesContract.findFirst({
        where: { kp_sequence: 3262 },
        select: { kp: true, pipeline_status: true, kp_status: true }
    });
    console.log('At floor (3262):', atFloor);
    // Check active sequences - what's NOT REJECTED and NOT starting with kp_archived_
    const activeSeqs = await prisma.salesContract.findMany({
        where: {
            kp_sequence: { not: null },
            pipeline_status: { not: 'REJECTED' },
            kp: { not: { startsWith: 'kp_archived_' } },
        },
        select: { kp: true, kp_sequence: true },
    });
    console.log('Active sequences count:', activeSeqs.length);
    const activeSet = new Set(activeSeqs.map(r => r.kp_sequence));
    // Check if 3262 is in active set
    console.log('Is 3262 in active set?', activeSet.has(3262));
    // Find the first gap
    for (let seq = 3262; seq <= 4649; seq++) {
        if (!activeSet.has(seq)) {
            console.log('First gap found at:', seq);
            break;
        }
    }
}
main().finally(() => prisma.$disconnect()).catch(console.error);
