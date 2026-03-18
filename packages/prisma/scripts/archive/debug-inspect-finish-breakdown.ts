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

// Column indices from Excel (0-indexed)
const COL_INDICES = {
  TGL: 3,
  SN: 4,
  TGL_POTONG: 5,
  SHIFT: 6,
  OPR: 7,
  LEBAR: 8,
  P: 9, // KP
  GR: 13,
  KG: 14,
  BTL: 17,
  BTS: 18,
  KET: 19,
  SLUB: 20,
  SNL: 21,
  LOSP: 22,
  LB: 23,
  PTR: 24,
  P_SLUB: 25,
  PB: 26,
  LM: 27,
  AW: 29,
  PTM: 30,
  J: 31,
  BTA: 32,
  PTS: 33,
  PD: 34,
  PP: 35,
  PKS: 36,
  PSS: 37,
  PKL: 38,
  PK: 39,
  PLC: 40,
  LP: 41,
  LKS: 42,
  LKC: 43,
  LD: 44,
  LKT: 45,
  LKI: 46,
  BMC: 47,
  EXST: 48,
  SMG: 49,
  BLPT_GREY: 50,
  BL_WS: 51,
  BL_BB: 52,
  NODA: 55,
  KOTOR: 56,
  BKRT: 57,
  SUSUT_LUSI: 58,
  POINT: 59,
};

const MONTH_MAP: Record<string, number> = {
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
};

function parseSerialDate(n: number): Date | null {
  const date = new Date((n - 25569) * 86400 * 1000);
  if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
  return date;
}

function parseDateMonYY(str: string): Date | null {
  const trimmed = str.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})-([a-z]+)-(\d{2})$/);
  if (!match) return null;
  
  const d = parseInt(match[1], 10);
  const monthName = match[2];
  const m = MONTH_MAP[monthName];
  let y = parseInt(match[3], 10);
  
  if (!m || isNaN(d) || isNaN(y)) return null;
  
  y = 2000 + y;
  if (y < 2000 || y > 2026) return null;
  
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function parseDateDMY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
  if (y < 2000 || y > 2026) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
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

function parseTglDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (value.getFullYear() < 2000 || value.getFullYear() > 2026) return null;
    return value;
  }
  if (typeof value === 'number') {
    return parseSerialDate(value);
  }
  const str = String(value).trim();
  if (!str) return null;
  
  const monYY = parseDateMonYY(str);
  if (monYY) return monYY;
  
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  
  const dmy = parseDateDMY(str);
  if (dmy) return dmy;
  
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
  console.log('=== DEBUG: InspectFinish Import Breakdown ===\n');
  
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
    cellDates: true,
    type: 'string'
  });
  
  console.log(`Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  const worksheet = workbook.Sheets['RAW'];
  
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
    header: 1,
    defval: ''
  });
  
  console.log(`Total data rows (including header): ${data.length}\n`);
  
  // Skip header row
  const rows = data.slice(1);
  
  console.log(`Total data rows (excluding header): ${rows.length}\n`);
  
  const MIN_DATE = new Date('2025-01-01');
  const MAX_DATE = new Date('2026-03-16');
  MAX_DATE.setHours(23, 59, 59, 999);
  
  // Breakdown counters
  let count_empty_row = 0;
  let count_kp_null_empty = 0;
  let count_kp_not_in_sales_contract = 0;
  let count_date_null_failed_parse = 0;
  let count_date_before_2025 = 0;
  let count_date_after_2026_03_16 = 0;
  let count_success = 0;
  
  // Sample KPs that are rejected
  const rejectedKPs: string[] = [];
  
  console.log('Processing rows with detailed breakdown...');
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // 1. Skip: empty row
    if (!row || row.length === 0) {
      count_empty_row++;
      continue;
    }
    
    // Get KP from column P
    const kp = parseString(row[COL_INDICES.P]);
    
    // 2. Skip: KP is null/empty
    if (!kp) {
      count_kp_null_empty++;
      continue;
    }
    
    // 3. Skip: KP not found in SalesContract
    if (!validKPs.has(kp)) {
      count_kp_not_in_sales_contract++;
      if (rejectedKPs.length < 15) {
        rejectedKPs.push(kp);
      }
      continue;
    }
    
    // Get TGL (primary date)
    const tgl = parseTglDate(row[COL_INDICES.TGL]);
    
    // 4. Skip: date is null (failed to parse)
    if (!tgl) {
      count_date_null_failed_parse++;
      continue;
    }
    
    // 5. Skip: date before 2025-01-01
    if (tgl < MIN_DATE) {
      count_date_before_2025++;
      continue;
    }
    
    // 6. Skip: date after 2026-03-16
    if (tgl > MAX_DATE) {
      count_date_after_2026_03_16++;
      continue;
    }
    
    // Success!
    count_success++;
  }
  
  console.log('\n=== EXACT BREAKDOWN ===');
  console.log(`Total rows in Excel (excluding header): ${rows.length}`);
  console.log('');
  console.log(`Skipped: empty row                                    = ${count_empty_row}`);
  console.log(`Skipped: KP is null/empty                            = ${count_kp_null_empty}`);
  console.log(`Skipped: KP not found in SalesContract               = ${count_kp_not_in_sales_contract}`);
  console.log(`Skipped: date is null (failed to parse)              = ${count_date_null_failed_parse}`);
  console.log(`Skipped: date before 2025-01-01                      = ${count_date_before_2025}`);
  console.log(`Skipped: date after 2026-03-16                       = ${count_date_after_2026_03_16}`);
  console.log(`Successfully imported                                = ${count_success}`);
  console.log('');
  
  const total = count_empty_row + count_kp_null_empty + count_kp_not_in_sales_contract + 
                count_date_null_failed_parse + count_date_before_2025 + count_date_after_2026_03_16 + 
                count_success;
  console.log(`TOTAL                                                = ${total}`);
  
  console.log('\n=== Sample KP values rejected (not in SalesContract) ===');
  console.log(rejectedKPs.join(', '));
  
  // Check current DB count
  const currentCount = await prisma.inspectFinishRecord.count();
  console.log(`\nTotal InspectFinishRecord currently in database: ${currentCount}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });