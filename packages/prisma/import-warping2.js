"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
let prisma = new client_1.PrismaClient();
function toDate(val) {
    if (!val || val === '')
        return new Date();
    if (val instanceof Date)
        return val;
    if (typeof val === 'number') {
        return new Date(Math.round((val - 25569) * 86400 * 1000));
    }
    if (typeof val === 'string') {
        const parts = val.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const d = new Date(year, month, day);
                if (!isNaN(d.getTime()))
                    return d;
            }
        }
        const d = new Date(val);
        if (!isNaN(d.getTime()))
            return d;
    }
    return new Date();
}
function reconnect() {
    return new Promise(async (resolve) => {
        try {
            await prisma.$disconnect();
        }
        catch (e) { }
        prisma = new client_1.PrismaClient();
        resolve();
    });
}
async function importWarping() {
    console.log('=== Importing WARPING ===');
    const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
    const sheetName = workbook.SheetNames[2];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Total rows:', data.length);
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const BATCH_SIZE = 50;
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];
        if (!row)
            continue;
        const kp = row[3];
        if (!kp || typeof kp !== 'string' || kp.trim() === '') {
            skipped++;
            continue;
        }
        const tgl = toDate(row[0]);
        if (!tgl || isNaN(tgl.getTime())) {
            skipped++;
            continue;
        }
        try {
            await prisma.warpingRun.upsert({
                where: { kp: kp.trim() },
                create: {
                    kp: kp.trim(),
                    tgl: tgl,
                    kode_full: row[4] != null ? String(row[4]) : null,
                    benang: row[5] != null ? String(row[5]) : null,
                    lot: row[6] != null ? String(row[6]) : null,
                    sp: row[7] != null ? String(row[7]) : null,
                    pt: row[8] != null ? Math.round(Number(row[8])) : null,
                    te: row[9] != null ? Number(row[9]) : null,
                    rpm: row[10] != null ? Number(row[10]) : null,
                    mtr_per_min: row[11] != null ? Number(row[11]) : null,
                    total_putusan: row[27] != null ? Math.round(Number(row[27])) : null,
                    total_beam: row[44] != null ? Math.round(Number(row[44])) : null,
                    eff_warping: row[48] != null ? Number(row[48]) : null,
                    no_mc: row[49] != null ? String(row[49]) : null,
                },
                update: {
                    tgl: tgl,
                    kode_full: row[4] != null ? String(row[4]) : null,
                    benang: row[5] != null ? String(row[5]) : null,
                    lot: row[6] != null ? String(row[6]) : null,
                    sp: row[7] != null ? String(row[7]) : null,
                    pt: row[8] != null ? Math.round(Number(row[8])) : null,
                    te: row[9] != null ? Number(row[9]) : null,
                    rpm: row[10] != null ? Number(row[10]) : null,
                    mtr_per_min: row[11] != null ? Number(row[11]) : null,
                    total_putusan: row[27] != null ? Math.round(Number(row[27])) : null,
                    total_beam: row[44] != null ? Math.round(Number(row[44])) : null,
                    eff_warping: row[48] != null ? Number(row[48]) : null,
                    no_mc: row[49] != null ? String(row[49]) : null,
                },
            });
            imported++;
            if (imported % 200 === 0) {
                console.log(`  Imported ${imported}...`);
            }
            if (imported % BATCH_SIZE === 0) {
                console.log('  Reconnecting...');
                await reconnect();
            }
        }
        catch (err) {
            errors++;
            if (errors <= 5) {
                console.error(`  Error at row ${rowIdx + 1}: ${err.message}`);
            }
            // Try to reconnect on error
            if (err.message && err.message.includes('connection')) {
                console.log('  Reconnecting after error...');
                await reconnect();
            }
        }
    }
    console.log(`  WARPING done: ${imported} imported, ${skipped} skipped, ${errors} errors`);
}
async function main() {
    await importWarping();
    await prisma.$disconnect();
}
main().catch(console.error);
