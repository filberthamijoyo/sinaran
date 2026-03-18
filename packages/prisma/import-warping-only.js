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
const prisma = new client_1.PrismaClient();
function convertDecimalTimeToHHMM(decimal) {
    if (decimal === null || decimal === undefined)
        return null;
    const h = Math.floor(decimal * 24);
    const m = Math.floor((decimal * 24 * 60) % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function toDate(val) {
    if (!val || val === '')
        return null;
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
    return null;
}
function parseFloatSafe(val) {
    if (val === null || val === undefined || val === '-')
        return null;
    if (typeof val === 'number')
        return isNaN(val) ? null : val;
    if (typeof val === 'string') {
        if (val.trim() === '-' || val.trim() === '')
            return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}
function parseIntSafe(val) {
    if (val === null || val === undefined || val === '-')
        return null;
    if (typeof val === 'number')
        return isNaN(val) ? null : Math.floor(val);
    if (typeof val === 'string') {
        if (val.trim() === '-' || val.trim() === '')
            return null;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}
async function importWarpingOnly() {
    console.log('\n=== Importing WARPING Only ===');
    const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
    const sheetName = workbook.SheetNames[2];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Total rows:', data.length);
    let runImported = 0;
    let skipped = 0;
    let errors = 0;
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];
        if (!row)
            continue;
        try {
            const kp = row[3];
            if (!kp || typeof kp !== 'string' || kp.trim() === '') {
                skipped++;
                continue;
            }
            const tgl = toDate(row[0]);
            if (!tgl) {
                skipped++;
                continue;
            }
            const startRaw = row[1];
            const stopRaw = row[2];
            const kode = row[4] != null ? String(row[4]) : null;
            const benang = row[5] != null ? String(row[5]) : null;
            const lot = row[6] != null ? String(row[6]) : null;
            const sp = row[7] != null ? String(row[7]) : null;
            const pt = parseIntSafe(row[8]);
            const te = parseFloatSafe(row[9]);
            const rpm = parseFloatSafe(row[10]);
            const mtr_per_min = parseFloatSafe(row[11]);
            const total_putusan = parseIntSafe(row[27]);
            const total_beam = parseIntSafe(row[44]);
            const eff_warping = parseFloatSafe(row[48]);
            const no_mc = row[49] != null ? String(row[49]) : null;
            const start = convertDecimalTimeToHHMM(startRaw);
            const stop = convertDecimalTimeToHHMM(stopRaw);
            await prisma.warpingRun.upsert({
                where: { kp: kp.trim() },
                create: {
                    kp: kp.trim(),
                    tgl: tgl,
                    start,
                    stop,
                    kode_full: kode,
                    benang,
                    lot,
                    sp,
                    pt,
                    te: te !== null ? te : undefined,
                    rpm: rpm !== null ? rpm : undefined,
                    mtr_per_min: mtr_per_min !== null ? mtr_per_min : undefined,
                    total_putusan,
                    total_beam,
                    eff_warping: eff_warping !== null ? eff_warping : undefined,
                    no_mc,
                },
                update: {
                    tgl: tgl,
                    start,
                    stop,
                    kode_full: kode,
                    benang,
                    lot,
                    sp,
                    pt,
                    te: te !== null ? te : undefined,
                    rpm: rpm !== null ? rpm : undefined,
                    mtr_per_min: mtr_per_min !== null ? mtr_per_min : undefined,
                    total_putusan,
                    total_beam,
                    eff_warping: eff_warping !== null ? eff_warping : undefined,
                    no_mc,
                },
            });
            runImported++;
            if (runImported % 200 === 0) {
                console.log(`  Imported ${runImported} warping runs...`);
            }
        }
        catch (err) {
            errors++;
            if (errors <= 5) {
                console.error(`  Error at row ${rowIdx + 1}: ${err.message}`);
            }
        }
    }
    console.log(`  WARPING import complete: ${runImported} imported, ${skipped} skipped, ${errors} errors`);
}
async function main() {
    await importWarpingOnly();
    await prisma.$disconnect();
}
main().catch(console.error);
