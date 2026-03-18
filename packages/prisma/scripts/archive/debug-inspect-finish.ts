/**
 * Debug script to analyze InspectFinish Excel rows
 * Just counts what happens to each row - NO IMPORT
 */

import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const INSPECT_FINISH_FILE = '/Users/filberthamijoyo/Downloads/erp/Data INSPECT FINISH.xlsx';

const COL_INDICES = {
  TGL: 0,
  SN: 4,
  TGL_POTONG: 5,
  P: 9, // KP
};

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (date.getFullYear() > 2100) return null;
    return date;
  }
  return null;
}

function parseString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

async function main() {
  console.log('=== Debug: InspectFinish Row Analysis ===\n');
  
  // Load valid KPs
  console.log('Loading valid KPs from SalesContract...');
  const validKPs = new Set(
    await prisma.salesContract.findMany({
      select: { kp: true }
    }).then(records => records.map(r => r.kp))
  );
  console.log(`Loaded ${validKPs.size} valid KPs\n`);
  
  // Read Excel file
  console.log(`Reading Excel file: ${INSPECT_FINISH_FILE}`);
  const workbook = XLSX.readFile(INSPECT_FINISH_FILE, { 
    raw: false, 
    cellDates: false,
    type: 'string'
  });
  
  const worksheet = workbook.Sheets['RAW'];
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
    header: 1,
    defval: ''
  });
  
  const totalRowsWithHeader = data.length;
  const rows = data.slice(1); // Skip header
  const totalDataRows = rows.length;
  
  console.log(`Total rows (with header): ${totalRowsWithHeader}`);
  console.log(`Total data rows (excluding header): ${totalDataRows}\n`);
  
  // Counters
  let skippedEmptyRow = 0;
  let skippedNoKP = 0;           // P column is empty/null
  let skippedNotInSalesContract = 0;  // KP exists but not in SalesContract
  let skippedNoDate = 0;          // Both TGL and TGL_POTONG are empty
  let skippedPre2025 = 0;         // Date before 2025-01-01
  let skippedFuture = 0;          // Date after 2026-03-16
  let wouldImport = 0;
  
  // Track duplicates
  const seenKP = new Set<string>();
  const seenKPSN = new Map<string, number>();
  
  const MIN_DATE = new Date('2025-01-01');
  const MAX_DATE = new Date('2026-03-16');
  MAX_DATE.setHours(23, 59, 59, 999);
  
  // First, count P column non-empty vs empty
  let pColumnNonEmpty = 0;
  let pColumnEmpty = 0;
  
  console.log('=== Step 1: Analyzing P column (KP) ===');
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const kp = parseString(row[COL_INDICES.P]);
    if (kp) {
      pColumnNonEmpty++;
    } else {
      pColumnEmpty++;
    }
  }
  console.log(`Rows with non-empty P column: ${pColumnNonEmpty}`);
  console.log(`Rows with empty P column: ${pColumnEmpty}`);
  console.log(`Sum: ${pColumnNonEmpty + pColumnEmpty}\n`);
  
  // Now process all rows
  console.log('=== Step 2: Analyzing row processing ===');
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (!row || row.length === 0) {
      skippedEmptyRow++;
      continue;
    }
    
    // Get KP from column P
    const kp = parseString(row[COL_INDICES.P]);
    
    // Skip if KP is empty
    if (!kp) {
      skippedNoKP++;
      continue;
    }
    
    // Skip if KP not in SalesContract
    if (!validKPs.has(kp)) {
      skippedNotInSalesContract++;
      continue;
    }
    
    // Get dates
    const tglPotong = parseDate(row[COL_INDICES.TGL_POTONG]);
    const tgl = parseDate(row[COL_INDICES.TGL]);
    
    // Skip if both dates are empty
    if (!tglPotong && !tgl) {
      skippedNoDate++;
      continue;
    }
    
    // Use TGL POTONG as primary date, fall back to TGL
    const recordDate = tglPotong || tgl;
    
    // Skip if date before 2025-01-01
    if (recordDate && recordDate < MIN_DATE) {
      skippedPre2025++;
      continue;
    }
    
    // Skip if date after 2026-03-16
    if (recordDate && recordDate > MAX_DATE) {
      skippedFuture++;
      continue;
    }
    
    // Would import (deduplication handled separately)
    wouldImport++;
  }
  
  console.log('\n=== Results ===');
  console.log(`Total data rows (excluding header): ${totalDataRows}`);
  console.log('');
  console.log('BREAKDOWN:');
  console.log(`  1. Skipped: empty row                        = ${skippedEmptyRow.toLocaleString()}`);
  console.log(`  2. Skipped: P column (KP) is null/empty       = ${skippedNoKP.toLocaleString()}`);
  console.log(`  3. Skipped: KP not found in SalesContract     = ${skippedNotInSalesContract.toLocaleString()}`);
  console.log(`  4. Skipped: no date (both TGL & TGL_POTONG)   = ${skippedNoDate.toLocaleString()}`);
  console.log(`  5. Skipped: date before 2025-01-01            = ${skippedPre2025.toLocaleString()}`);
  console.log(`  6. Skipped: date after 2026-03-16             = ${skippedFuture.toLocaleString()}`);
  console.log(`  7. Would successfully import                   = ${wouldImport.toLocaleString()}`);
  console.log('');
  
  const sum = skippedEmptyRow + skippedNoKP + skippedNotInSalesContract + skippedNoDate + skippedPre2025 + skippedFuture + wouldImport;
  console.log(`  SUM OF ALL CATEGORIES                         = ${sum.toLocaleString()}`);
  console.log(`  EXPECTED                                      = ${totalDataRows.toLocaleString()}`);
  console.log(`  MATCH                                         = ${sum === totalDataRows ? 'YES ✓' : 'NO ✗'}`);
  
  // Additional info about duplicates
  console.log('\n=== Additional Analysis ===');
  console.log(`P column has ${pColumnNonEmpty.toLocaleString()} non-empty values`);
  console.log(`But only ${validKPs.size} unique KPs exist in SalesContract`);
  
  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
