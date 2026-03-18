"use strict";
/**
 * Backfill script for KP sequence numbers
 *
 * This script:
 * 1. Fetches all SalesContract records with a kp value
 * 2. Decodes each KP using decodeKP()
 * 3. Updates kp_sequence with the decoded integer
 * 4. Sets kp_status = 'ACTIVE' for all existing records
 * 5. Logs any KP codes that fail to decode (invalid format) — does NOT crash, just skips and logs
 *
 * Run: npx ts-node packages/prisma/backfill-kp-sequence.ts
 */
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
const path = __importStar(require("path"));
const kp_1 = require("../../apps/api/src/lib/kp");
// Load dotenv from project root
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const prisma = new client_1.PrismaClient();
async function backfill() {
    console.log('=== Starting KP Sequence Backfill ===\n');
    // Fetch all SalesContract records
    const contracts = await prisma.salesContract.findMany({
        select: { id: true, kp: true, kp_sequence: true }
    });
    console.log(`Found ${contracts.length} SalesContract records\n`);
    let updated = 0;
    let skipped = 0;
    const errors = [];
    for (const contract of contracts) {
        try {
            if (!contract.kp || contract.kp.trim() === '') {
                console.log(`  Skipping id=${contract.id}: empty KP`);
                skipped++;
                continue;
            }
            // Try to decode the KP
            const sequence = (0, kp_1.decodeKP)(contract.kp.trim());
            // Update the record
            await prisma.salesContract.update({
                where: { id: contract.id },
                data: {
                    kp_sequence: sequence,
                    kp_status: 'ACTIVE'
                }
            });
            updated++;
            if (updated % 200 === 0) {
                console.log(`  Processed ${updated} records...`);
            }
        }
        catch (err) {
            // Log error but don't crash - skip this record
            console.log(`  ERROR decoding KP "${contract.kp}" for id=${contract.id}: ${err.message}`);
            errors.push({ id: contract.id, kp: contract.kp, error: err.message });
            skipped++;
        }
    }
    console.log(`\n=== Backfill Complete ===`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors.length}`);
    if (errors.length > 0) {
        console.log(`\nFailed to decode these KPs:`);
        errors.forEach(e => console.log(`  id=${e.id}, kp="${e.kp}", error="${e.error}"`));
    }
    // Verify: check that all records now have kp_sequence
    const nullCount = await prisma.salesContract.count({
        where: { kp_sequence: null }
    });
    console.log(`\nRecords still missing kp_sequence: ${nullCount}`);
    // Get min/max sequence
    const minMax = await prisma.salesContract.aggregate({
        _min: { kp_sequence: true },
        _max: { kp_sequence: true }
    });
    console.log(`Sequence range: ${minMax._min.kp_sequence} to ${minMax._max.kp_sequence}`);
    await prisma.$disconnect();
}
backfill().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
