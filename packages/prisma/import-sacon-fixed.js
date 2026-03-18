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
require("dotenv/config");
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
// Ensure dotenv loads from the correct path
const dotenvPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });
const prisma = new client_1.PrismaClient();
// Fixed toDate function - handles Excel serial numbers AND DD/MM/YYYY string format
function toDate(val) {
    if (!val || val === '')
        return new Date();
    if (val instanceof Date)
        return val;
    // Excel serial number (e.g. 45450)
    if (typeof val === 'number') {
        return new Date(Math.round((val - 25569) * 86400 * 1000));
    }
    // String — check for DD/MM/YYYY format first
    if (typeof val === 'string') {
        const parts = val.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // DD/MM/YYYY -> month is parts[1]
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day <= 31 && month <= 12) {
                const d = new Date(year, month, day);
                if (!isNaN(d.getTime()))
                    return d;
            }
        }
        // Try standard parsing
        const d = new Date(val);
        if (!isNaN(d.getTime()))
            return d;
    }
    return new Date();
}
function mapPipelineStatus(acc, proses) {
    const a = String(acc || '').trim().toUpperCase();
    const p = String(proses || '').trim().toUpperCase();
    if (a === 'TIDAK ACC')
        return 'REJECTED';
    if (p === 'BATAL')
        return 'REJECTED';
    if (p === 'PENDING')
        return 'PENDING_APPROVAL';
    if (p === 'MENUNGGU')
        return 'PENDING_APPROVAL';
    if (a === 'ACC' && p === 'PROSES')
        return 'COMPLETE';
    return 'PENDING_APPROVAL';
}
async function importSacon() {
    console.log('=== Importing SACON (SalesContract) ===');
    const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
    const sheetName = workbook.SheetNames[1]; // SACON is index 1
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Total rows:', data.length);
    let imported = 0;
    let skipped = 0;
    for (let rowIdx = 2; rowIdx < data.length; rowIdx++) {
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
            const permintaan = row[1] != null ? String(row[1]) : null;
            const codename = row[2] != null ? String(row[2]) : null;
            const kons_kode = row[4] != null ? String(row[4]) : null;
            const kode_number = row[5] != null ? String(row[5]) : null;
            const kat_kode = row[6] != null ? String(row[6]) : null;
            const ket_ct_ws = row[7] != null ? String(row[7]) : null;
            const ket_warna = row[8] != null ? String(row[8]) : null;
            const status = row[9] != null ? String(row[9]) : null;
            const te = row[10] != null ? String(row[10]) : null;
            const acc = row[30] != null ? String(row[30]) : null;
            const proses = row[31] != null ? String(row[31]) : null;
            const pipeline_status = mapPipelineStatus(acc, proses);
            await prisma.salesContract.upsert({
                where: { kp: kp.trim() },
                create: {
                    kp: kp.trim(),
                    tgl: tgl,
                    permintaan,
                    codename,
                    kons_kode,
                    kode_number,
                    kat_kode,
                    ket_ct_ws,
                    ket_warna,
                    status,
                    te,
                    acc,
                    proses,
                    pipeline_status,
                },
                update: {
                    tgl: tgl,
                    permintaan,
                    codename,
                    kons_kode,
                    kode_number,
                    kat_kode,
                    ket_ct_ws,
                    ket_warna,
                    status,
                    te,
                    acc,
                    proses,
                    pipeline_status,
                },
            });
            imported++;
            if (imported % 200 === 0) {
                console.log(`  Imported ${imported} records...`);
            }
        }
        catch (err) {
            console.error(`  Error at row ${rowIdx + 1}: ${err.message}`);
        }
    }
    console.log(`  SACON import complete: ${imported} imported, ${skipped} skipped`);
}
async function main() {
    // First truncate existing data
    console.log('Truncating SalesContract...');
    await prisma.salesContract.deleteMany();
    console.log('Truncated.');
    await importSacon();
    // Verify
    const count = await prisma.salesContract.count();
    const minMax = await prisma.$queryRaw `SELECT MIN(tgl) as min, MAX(tgl) as max FROM "SalesContract"`;
    console.log('\n=== Final Counts ===');
    console.log('SalesContract:', count);
    console.log('Date range:', minMax[0]?.min, 'to', minMax[0]?.max);
    await prisma.$disconnect();
}
main().catch(console.error);
