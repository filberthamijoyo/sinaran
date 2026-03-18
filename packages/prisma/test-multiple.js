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
async function testMultipleRows() {
    console.log('Testing multiple WARPING rows...');
    const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
    const sheetName = workbook.SheetNames[2];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    let success = 0;
    let errors = 0;
    for (let i = 1; i <= 100; i++) {
        const row = data[i];
        if (!row)
            continue;
        const kp = row[3];
        if (!kp || typeof kp !== 'string')
            continue;
        try {
            await prisma.warpingRun.upsert({
                where: { kp: kp.trim() },
                create: {
                    kp: kp.trim(),
                    tgl: toDate(row[0]),
                    kode_full: row[4] ? String(row[4]) : null,
                    benang: row[5] ? String(row[5]) : null,
                },
                update: {
                    tgl: toDate(row[0]),
                    kode_full: row[4] ? String(row[4]) : null,
                    benang: row[5] ? String(row[5]) : null,
                },
            });
            success++;
        }
        catch (err) {
            errors++;
            if (errors <= 3) {
                console.error(`Error at row ${i}: ${err.message}`);
            }
        }
    }
    console.log(`Success: ${success}, Errors: ${errors}`);
    await prisma.$disconnect();
}
testMultipleRows().catch(console.error);
