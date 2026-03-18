import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

// Hardcode the connection string since dotenv isn't working properly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

// Column mapping from Excel to Prisma model
const DEFECT_COLUMNS = [
  'bmc', 'btl', 'bts', 'pp', 'pks', 'ko', 'db', 'bl', 'ptr', 'pkt', 'fly', 'ls', 'lpb',
  'p_bulu', 'smg', 'sms', 'aw', 'pl', 'na', 'lm', 'lkc', 'lks', 'ld', 'pts', 'pd',
  'lkt', 'pk', 'lp', 'plc', 'j', 'kk', 'bta', 'pj', 'rp', 'pb', 'xpd', 'br', 'pss',
  'luper', 'ptn', 'b_bercak', 'r_rusak', 'sl', 'p_timbul', 'b_celup', 'p_tumpuk',
  'b_bar', 'sml', 'p_slub', 'p_belang', 'crossing', 'x_sambang', 'p_jelek', 'lipatan'
];

/** Parse Excel serial date (number). */
function parseDateSerial(n: number): Date | null {
  const date = new Date((n - 25569) * 86400 * 1000);
  // Validate year range
  if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
  return date;
}

/** Parse string as M/D/YYYY (US format) to avoid locale interpreting as D/M/YYYY. */
function parseDateMDY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
  // Validate year range
  if (y < 2000 || y > 2026) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (value.getFullYear() < 2000 || value.getFullYear() > 2026) return null;
    return value;
  }
  if (typeof value === 'number') {
    return parseDateSerial(value);
  }
  const str = String(value).trim();
  if (!str) return null;
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2026) return null;
  return parsed;
}

function parseIntSafe(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (!str) return null;
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

function parseFloatSafe(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (!str) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parseString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

async function main() {
  console.log('=== Import InspectGray Records ===\n');
  
  // Load all valid KPs from SalesContract
  console.log('Loading valid KPs from SalesContract...');
  const validKPs = new Set(
    await prisma.salesContract.findMany({
      select: { kp: true }
    }).then(records => records.map(r => r.kp))
  );
  console.log(`Loaded ${validKPs.size} valid KPs\n`);

  // Read Excel file
  console.log(`Reading Excel file: ${EXCEL_FILE}`);
  const workbook = XLSX.readFile(EXCEL_FILE, {
    raw: false,
    cellDates: true,
    type: 'string'
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header at row 5 (index 4)
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, {
    header: 1,
    range: 4,
    defval: ''
  });
  
  console.log(`Total data rows (excluding header): ${data.length}\n`);

  // Process rows
  const recordsToInsert: any[] = [];
  let skippedNoKpMatch = 0;
  let skippedPre2025 = 0;
  let skippedEmpty = 0;
  
  // TG date range: 2025-01-01 to 2026-03-16
  const MIN_DATE = new Date('2025-01-01');
  const MAX_DATE = new Date('2026-03-16');
  MAX_DATE.setHours(23, 59, 59, 999);
  
  console.log('Processing rows...');
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty rows
    if (!row || row.length === 0) {
      skippedEmpty++;
      continue;
    }
    
    // Get KP value
    const kpValue = parseString(row[2]); // Column 2 = KP
    
    // Skip if KP is empty/null
    if (!kpValue) {
      skippedEmpty++;
      continue;
    }
    
    // Skip if KP doesn't exist in SalesContract
    if (!validKPs.has(kpValue)) {
      skippedNoKpMatch++;
      continue;
    }
    
    // Parse date
    const tgValue = parseDate(row[1]); // Column 1 = TG
    
    // Skip if date is before 2025-01-01
    if (tgValue && tgValue < MIN_DATE) {
      skippedPre2025++;
      continue;
    }
    
    // Skip if TG date is after MAX_DATE
    if (tgValue && tgValue > MAX_DATE) {
      skippedPre2025++;
      continue;
    }

    if (!tgValue) {
      skippedEmpty++;
      continue;
    }
    
    // Build record object
    const record: any = {
      kp: kpValue,
      tg: tgValue,
      d: parseString(row[3]),
      mc: parseString(row[4]),
      bm: parseIntSafe(row[5]),
      sn: parseString(row[6]),
      sn_combined: parseString(row[7]),
      gd: parseString(row[8]),
      bme: parseFloatSafe(row[9]),
      sj: parseFloatSafe(row[10]),
      w: parseString(row[11]),
      g: parseString(row[12]),
      opg: parseString(row[13]),
      tgl_potong: parseDate(row[14]),
    };
    
    // Parse defect columns (starting from column 15)
    let defectSum = 0;
    for (let colIdx = 0; colIdx < DEFECT_COLUMNS.length; colIdx++) {
      const excelColIdx = 15 + colIdx;
      const fieldName = DEFECT_COLUMNS[colIdx];
      const value = parseIntSafe(row[excelColIdx]);
      record[fieldName] = value;
      if (value !== null) {
        defectSum += value;
      }
    }
    
    // Calculate BMC as sum of all defects
    record.bmc = defectSum;
    
    recordsToInsert.push(record);
    
    // Print progress every 500
    if ((i + 1) % 500 === 0) {
      console.log(`  Processed ${i + 1} rows...`);
    }
  }
  
  console.log(`\nTotal records to insert: ${recordsToInsert.length}`);
  console.log(`Skipped (no KP match): ${skippedNoKpMatch}`);
  console.log(`Skipped (pre-2025): ${skippedPre2025}`);
  console.log(`Skipped (empty/null): ${skippedEmpty}`);
  console.log(`Total processed: ${data.length}\n`);
  
  // Use createMany with skipDuplicates - much faster!
  const BATCH_SIZE = 500;
  let imported = 0;
  
  console.log('Inserting records in batches (skipping duplicates)...');
  
  for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
    const batch = recordsToInsert.slice(i, i + BATCH_SIZE);
    try {
      const result = await prisma.inspectGrayRecord.createMany({
        data: batch,
        skipDuplicates: true
      });
      imported += result.count;
      console.log(`  Inserted ${imported} new records so far...`);
    } catch (error: any) {
      console.error(`  Error inserting batch:`, error.message);
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log(`Total new records imported: ${imported}`);
  console.log(`Skipped (no KP match): ${skippedNoKpMatch}`);
  console.log(`Skipped (pre-2025): ${skippedPre2025}`);
  console.log(`Skipped (empty/null): ${skippedEmpty}`);
  console.log(`Total processed: ${data.length}`);
  
  // Show current count
  const currentCount = await prisma.inspectGrayRecord.count();
  console.log(`\nTotal records in database: ${currentCount}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
