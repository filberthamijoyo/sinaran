"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testInsert() {
    console.log('Testing simple warping insert...');
    try {
        const result = await prisma.warpingRun.create({
            data: {
                kp: 'TEST001',
                tgl: new Date(),
                kode_full: 'DTL 1570 P',
                benang: 'E 71',
            }
        });
        console.log('Success:', result);
    }
    catch (err) {
        console.error('Error:', err.message);
        console.error('Full error:', err);
    }
    await prisma.$disconnect();
}
testInsert().catch(console.error);
