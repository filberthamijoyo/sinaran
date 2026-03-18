const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const sc = await prisma.salesContract.findUnique({ where: { kp: 'BSPD' } });
    console.log('SalesContract BSPD:', sc ? 'FOUND' : 'NOT FOUND');
    if (sc)
        console.log('  tgl:', sc.tgl, '| codename:', sc.codename);
    const wr = await prisma.warpingRun.findUnique({ where: { kp: 'BSPD' } });
    console.log('WarpingRun BSPD:', wr ? 'FOUND' : 'NOT FOUND');
    if (wr)
        console.log('  tgl:', wr.tgl, '| kode_full:', wr.kode_full);
    const wb = await prisma.warpingBeam.findMany({ where: { kp: 'BSPD' } });
    console.log('WarpingBeam BSPD:', wb.length, 'beams');
    if (wb.length > 0)
        console.log('  beam_numbers:', wb.map(b => b.beam_number));
    const ir = await prisma.indigoRun.findUnique({ where: { kp: 'BSPD' } });
    console.log('IndigoRun BSPD:', ir ? 'FOUND' : 'NOT FOUND');
    if (ir)
        console.log('  tanggal:', ir.tanggal, '| mc:', ir.mc);
    const wv = await prisma.weavingRecord.findMany({
        where: { kp: 'BSPD' },
        take: 3,
        select: { id: true, kp: true, beam: true, warping_beam_id: true, tanggal: true, machine: true }
    });
    console.log('WeavingRecord BSPD:', wv.length > 0 ? wv.length + ' found (showing 3)' : 'NOT FOUND');
    if (wv.length > 0)
        console.log('  sample:', JSON.stringify(wv));
}
main().catch(console.error).finally(() => prisma.$disconnect());
