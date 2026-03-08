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

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { decodeKP } from '../../apps/api/src/lib/kp';

// Load dotenv from project root
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function backfill() {
  console.log('=== Starting KP Sequence Backfill ===\n');
  
  // Fetch all SalesContract records
  const contracts = await prisma.salesContract.findMany({
    select: { id: true, kp: true, kp_sequence: true }
  });
  
  console.log(`Found ${contracts.length} SalesContract records\n`);
  
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ id: number; kp: string; error: string }> = [];
  
  for (const contract of contracts) {
    try {
      if (!contract.kp || contract.kp.trim() === '') {
        console.log(`  Skipping id=${contract.id}: empty KP`);
        skipped++;
        continue;
      }
      
      // Try to decode the KP
      const sequence = decodeKP(contract.kp.trim());
      
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
      
    } catch (err: any) {
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
