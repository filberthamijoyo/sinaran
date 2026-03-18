import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

const DEFECT_COLUMNS = [
  'bmc', 'btl', 'bts', 'pp', 'pks', 'ko', 'db', 'bl', 'ptr', 'pkt', 'fly', 'ls', 'lpb',
  'p_bulu', 'smg', 'sms', 'aw', 'pl', 'na', 'lm', 'lkc', 'lks', 'ld', 'pts', 'pd',
  'lkt', 'pk', 'lp', 'plc', 'j', 'kk', 'bta', 'pj', 'rp', 'pb', 'xpd', 'br', 'pss',
  'luper', 'ptn', 'b_bercak', 'r_rusak', 'sl', 'p_timbul', 'b_celup', 'p_tumpuk',
  'b_bar', 'sml', 'p_slub', 'p_belang', 'crossing', 'x_sambang', 'p_jelek', 'lipatan'
];

function parseDateSerial(n: number): Date | null {
  const date = new Date((n - 25569) * 86400 * 1000);
  if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
  return date;
}

function parseDateMDY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
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

function parseString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

async function main() {
  console.log('=== DEBUG: InspectGray Import Breakdown ===\n');
  
  // Load valid KPs
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
    cellDates: false,
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
  
  // Breakdown counters
  let count_empty_row = 0;
  let count_kp_null_empty = 0;
  let count_kp_not_in_sales_contract = 0;
  let count_date_null_failed_parse = 0;
  let count_date_before_2025 = 0;
  let count_date_after_2026_02_25 = 0;
  let count_success = 0;
  
  // Sample rejected KPs
  const rejectedKPs: string[] = [];
  
  const MIN_DATE = new Date('2025-01-01');
  const MAX_TG_DATE = new Date('2026-02-25');
  MAX_TG_DATE.setHours(23, 59, 59, 999);
  
  console.log('Processing rows with detailed breakdown...');
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // 1. Skip: empty row
    if (!row || row.length === 0) {
      count_empty_row++;
      continue;
    }
    
    // Get KP value from column 2
    const kpValue = parseString(row[2]);
    
    // 2. Skip: KP is null/empty
    if (!kpValue) {
      count_kp_null_empty++;
      continue;
    }
    
    // 3. Skip: KP not found in SalesContract
    if (!validKPs.has(kpValue)) {
      count_kp_not_in_sales_contract++;
      if (rejectedKPs.length < 15) {
        rejectedKPs.push(kpValue);
      }
      continue;
    }
    
    // Parse date from column 1 (TG)
    const tgValue = parseDate(row[1]);
    
    // 4. Skip: date is null (failed to parse)
    if (!tgValue) {
      count_date_null_failed_parse++;
      continue;
    }
    
    // 5. Skip: date before 2025-01-01
    if (tgValue < MIN_DATE) {
      count_date_before_2025++;
      continue;
    }
    
    // 6. Skip: date after 2026-02-25
    if (tgValue > MAX_TG_DATE) {
      count_date_after_2026_02_25++;
      continue;
    }
    
    // Success!
    count_success++;
  }
  
  console.log('\n=== EXACT BREAKDOWN ===');
  console.log(`Total rows in Excel (excluding header): ${data.length}`);
  console.log('');
  console.log(`Skipped: empty row                                = ${count_empty_row}`);
  console.log(`Skipped: KP is null/empty                        = ${count_kp_null_empty}`);
  console.log(`Skipped: KP not found in SalesContract           = ${count_kp_not_in_sales_contract}`);
  console.log(`Skipped: date is null (failed to parse)           = ${count_date_null_failed_parse}`);
  console.log(`Skipped: date before 2025-01-01                   = ${count_date_before_2025}`);
  console.log(`Skipped: date after 2026-02-25                    = ${count_date_after_2026_02_25}`);
  console.log(`Successfully imported                            = ${count_success}`);
  console.log('');
  
  const total = count_empty_row + count_kp_null_empty + count_kp_not_in_sales_contract + 
                count_date_null_failed_parse + count_date_before_2025 + count_date_after_2026_02_25 + 
                count_success;
  console.log(`TOTAL                                            = ${total}`);
  
  console.log('\n=== Sample KP values rejected (not in SalesContract) ===');
  console.log(rejectedKPs.join(', '));
  
  // Check current DB count
  const currentCount = await prisma.inspectGrayRecord.count();
  console.log(`\nTotal InspectGrayRecord currently in database: ${currentCount}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });