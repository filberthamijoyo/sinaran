"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGIT = ['Q', 'S', 'D', 'T', 'E', 'L', 'N', 'J', 'P', 'B'];
function encodeKP(n) {
    if (n < 0 || n > 67599)
        throw new Error(`KP overflow: ${n}`);
    const p1 = Math.floor(n / 2600);
    const p2 = Math.floor((n % 2600) / 100);
    const p3 = Math.floor((n % 100) / 10);
    const p4 = n % 10;
    return ALPHA[p1] + ALPHA[p2] + DIGIT[p3] + DIGIT[p4];
}
async function generateNextKP(prisma) {
    const floorResult = await prisma.salesContract.aggregate({
        _min: { kp_sequence: true },
        where: { kp_sequence: { not: null } },
    });
    const floor = floorResult._min.kp_sequence ?? 0;
    const ceilResult = await prisma.salesContract.aggregate({
        _max: { kp_sequence: true },
        where: { kp_sequence: { not: null } },
    });
    const ceiling = ceilResult._max.kp_sequence ?? floor;
    const activeSeqs = await prisma.salesContract.findMany({
        where: {
            kp_sequence: { not: null },
            pipeline_status: { not: 'REJECTED' },
            kp: { not: { startsWith: 'kp_archived_' } },
        },
        select: { kp_sequence: true },
    });
    const activeSet = new Set(activeSeqs.map((r) => r.kp_sequence));
    for (let seq = floor; seq <= ceiling; seq++) {
        if (!activeSet.has(seq)) {
            if (seq > 67599)
                throw new Error('KP sequence exhausted');
            return encodeKP(seq);
        }
    }
    const next = ceiling + 1;
    if (next > 67599)
        throw new Error('KP sequence exhausted');
    return encodeKP(next);
}
const prisma = new client_1.PrismaClient();
async function main() {
    const nextKP = await generateNextKP(prisma);
    console.log('Generated next KP:', nextKP);
    const floorResult = await prisma.salesContract.aggregate({
        _min: { kp_sequence: true },
        where: { kp_sequence: { not: null } },
    });
    const floor = floorResult._min.kp_sequence;
    const ceilResult = await prisma.salesContract.aggregate({
        _max: { kp_sequence: true },
        where: { kp_sequence: { not: null } },
    });
    const ceiling = ceilResult._max.kp_sequence;
    console.log('Floor:', floor, '| Ceiling:', ceiling);
    console.log('Expected range: BGND (3262) to BUEB (4649)');
}
main().finally(() => prisma.$disconnect()).catch(console.error);
