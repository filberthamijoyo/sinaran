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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
const prisma = new client_1.PrismaClient();
async function main() {
    // Try multiple locations
    const possiblePaths = [
        '/Users/filberthamijoyo/Downloads/erp/CSV/ERP SCRATCH - Copy of DATABASE KODE.csv',
        '/mnt/user-data/uploads/ERP_SCRATCH_-_Copy_of_DATABASE_KODE.csv',
        path.join(process.cwd(), 'ERP_SCRATCH_-_Copy_of_DATABASE_KODE.csv'),
        path.join(__dirname, '../../ERP_SCRATCH_-_Copy_of_DATABASE_KODE.csv'),
        '/Users/filberthamijoyo/github/erp-sinaran/ERP_SCRATCH_-_Copy_of_DATABASE_KODE.csv',
    ];
    let csvContent = null;
    let foundPath = '';
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            csvContent = fs.readFileSync(p, 'utf-8');
            foundPath = p;
            console.log(`Found CSV at: ${p}`);
            break;
        }
    }
    if (!csvContent) {
        console.error('CSV file not found. Tried paths:');
        possiblePaths.forEach(p => console.error(`  - ${p}`));
        process.exit(1);
    }
    const records = (0, sync_1.parse)(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
    const validRecords = records.filter((r) => r['ITEM'] && r['ITEM'].trim() !== '');
    console.log(`Importing ${validRecords.length} fabric specs...`);
    let inserted = 0;
    let skipped = 0;
    for (const r of validRecords) {
        const item = r['ITEM']?.trim();
        if (!item)
            continue;
        try {
            await prisma.fabricSpec.upsert({
                where: { item },
                create: {
                    item,
                    kons_kode: r['Kons Kode']?.trim() || '',
                    kode: r['KODE']?.trim() || '',
                    kat_kode: r['KAT KODE']?.trim() || '',
                    te: r['TE'] ? parseInt(r['TE']) || null : null,
                    lusi_type: r['L']?.trim() || null,
                    lusi_ne: r['LUSI']?.trim() || null,
                    pakan_type: r['P']?.trim() || null,
                    pakan_ne: r['PAKAN']?.trim() || null,
                    sisir: r['SISIR']?.trim() || null,
                    pick: r['PICK'] ? parseInt(r['PICK']) || null : null,
                    anyaman: r['ANY']?.trim() || null,
                    arah: r['ARAH']?.trim() || null,
                    lg_inches: r['LG"'] ? parseFloat(r['LG"']) || null : null,
                    lf_inches: r['LF"'] ? parseFloat(r['LF"']) || null : null,
                    susut_pakan: r['Susut Pakan(%)']
                        ? parseFloat(r['Susut Pakan(%)']) || null
                        : null,
                    warna: r['WARNA']?.trim() || null,
                    pretreatment: r['PRETREATMENT']?.trim() || null,
                    indigo_i: r['I'] ? parseFloat(r['I']) || null : null,
                    indigo_bak_i: r['Bak I'] ? parseInt(r['Bak I']) || null : null,
                    sulfur_s: r['S'] ? parseFloat(r['S']) || null : null,
                    sulfur_bak_s: r['Bak S'] ? parseInt(r['Bak S']) || null : null,
                    posttreatment: r['POSTTREATMENT']?.trim() || null,
                    finish: r['FINISH']?.trim() || null,
                    oz_g: r['OZ G'] ? parseFloat(r['OZ G']) || null : null,
                    oz_f: r['OZ F'] ? parseFloat(r['OZ F']) || null : null,
                    p_kons: r['P (Kons)']?.trim() || null,
                    remarks: r['Remarks']?.trim() || null,
                },
                update: {},
            });
            inserted++;
        }
        catch (e) {
            console.error(`Skipped ${item}: ${e.message}`);
            skipped++;
        }
    }
    console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
