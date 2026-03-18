"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const allBeams = await prisma.warpingBeam.findMany({
        select: { id: true, kp: true, beam_number: true }
    });
    const beamMap = new Map();
    for (const b of allBeams) {
        beamMap.set(`${b.kp}:${b.beam_number}`, b.id);
    }
    console.log('Beams loaded into map:', beamMap.size);
    const weaving = await prisma.weavingRecord.findMany({
        where: { warping_beam_id: null },
        select: { id: true, kp: true, beam: true }
    });
    console.log('Weaving records to backfill:', weaving.length);
    let updated = 0;
    let notFound = 0;
    for (const w of weaving) {
        if (!w.beam) {
            notFound++;
            continue;
        }
        const key = `${w.kp}:${w.beam}`;
        const beamId = beamMap.get(key);
        if (!beamId) {
            notFound++;
            continue;
        }
        await prisma.weavingRecord.update({
            where: { id: w.id },
            data: { warping_beam_id: beamId }
        });
        updated++;
        if (updated % 500 === 0)
            console.log(`Updated ${updated}...`);
    }
    console.log('Done. Updated:', updated, '| Not found:', notFound);
}
main().catch(console.error).finally(() => prisma.$disconnect());
