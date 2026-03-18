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
// Note: Using cellDates=true in Excel read, so dates are parsed as Date objects
// Row 0: TGL, PT, ' ', T, SN, TGL POTONG, SHIFT, OPR, LEBAR, P, I, KI, Y, GR, KG, K, BR, BTL, BTS, KET, SLUB, SNL, LOSP, LB, PTR, P.SLUB, PB, LM, K2, AW, PTM, J, BTA, PTS, PD, PP, PKS, PSS, PKL, PK, PLC, LP, LKS, LKC, LD, LKT, LKI, BMC, EXST, SMG, BLPT GREY, BL WS, BL BB, BLPT, BTTS, NODA, KOTOR, BKRT, LPTD, SUSUT LUSI, POINT, Column3
// Actual data: Col 3 = TGL, Col 5 = TGL POTONG, Col 9 = P (KP)
const COL_INDICES = {
  TGL: 3,        // Actual TGL is in column 3 (not 0)
  SN: 4,
  TGL_POTONG: 5,
  SHIFT: 6,
  OPR: 7,
  LEBAR: 8,
  P: 9, // KP
  GR: 13, // Grade
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

const DEFECT_FIELDS = [
  'btl', 'bts', 'slub', 'snl', 'losp', 'lb', 'ptr', 'p_slub', 'pb', 'lm', 
  'aw', 'ptm', 'j', 'bta', 'pts', 'pd', 'pp', 'pks', 'pss', 'pkl', 'pk', 
  'plc', 'lp', 'lks', 'lkc', 'ld', 'lkt', 'lki', 'bmc', 'exst', 'smg'
];

/** Month name to number map */
const MONTH_MAP: Record<string, number> = {
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
};

/** Parse Excel serial date number to Date */
function parseSerialDate(n: number): Date | null {
  const date = new Date((n - 25569) * 86400 * 1000);
  // Validate year range
  if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
  return date;
}

/** Parse D-Mon-YY format (e.g. 6-Mar-26 = March 6 2026) */
function parseDateMonYY(str: string): Date | null {
  const trimmed = str.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})-([a-z]+)-(\d{2})$/);
  if (!match) return null;
  
  const d = parseInt(match[1], 10);
  const monthName = match[2];
  const m = MONTH_MAP[monthName];
  let y = parseInt(match[3], 10);
  
  if (!m || isNaN(d) || isNaN(y)) return null;
  
  // Convert 2-digit year to 20XX
  y = 2000 + y;
  
  // Validate year range
  if (y < 2000 || y > 2026) return null;
  
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** Parse DD/MM/YYYY format (Indonesian, e.g. 25/02/2026 = February 25 2026) */
function parseDateDMY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
  // Validate year range
  if (y < 2000 || y > 2026) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
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

/** Parse TGL column - can be serial number, D-Mon-YY format, or Date object */
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
  
  // Try D-Mon-YY format first
  const monYY = parseDateMonYY(str);
  if (monYY) return monYY;
  
  // Try M/D/YYYY format
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  
  // Try DD/MM/YYYY format as fallback
  const dmy = parseDateDMY(str);
  if (dmy) return dmy;
  
  // Fallback to native parsing
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2026) return null;
  return parsed;
}

/** Parse TGL_POTONG column - can be serial number, DD/MM/YYYY format, or Date object */
function parseTglPotongDate(value: any): Date | null {
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
  
  // Try DD/MM/YYYY format first (Indonesian)
  const dmy = parseDateDMY(str);
  if (dmy) return dmy;
  
  // Try M/D/YYYY format as fallback
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  
  // Try D-Mon-YY format as fallback
  const monYY = parseDateMonYY(str);
  if (monYY) return monYY;
  
  // Fallback to native parsing
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2026) return null;
  return parsed;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (date.getFullYear() > 2100) return null;
    return date;
  }
  const str = String(value).trim();
  if (!str) return null;
  const mdy = parseDateMDY(str);
  if (mdy) {
    if (mdy.getFullYear() > 2100) return null;
    return mdy;
  }
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() > 2100) return null;
  return parsed;
}

function parseIntSafe(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (!str) return null;
  // Handle string like "(0.08)" - extract just the number
  const cleaned = str.replace(/[()]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.round(num);
}

function parseFloatSafe(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (!str) return null;
  // Handle string like "(0.08)" - extract just the number
  const cleaned = str.replace(/[()]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

async function main() {
  console.log('=== Import InspectFinish Records ===\n');
  
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
  
  // Check available sheets
  console.log(`Available sheets: ${workbook.SheetNames.join(', ')}`);
  
  const worksheet = workbook.Sheets['RAW'];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
    header: 1,
    defval: ''
  });
  
  console.log(`Total data rows (including header): ${data.length}\n`);
  
  // Skip header row
  const rows = data.slice(1);
  
  const MIN_DATE = new Date('2025-01-01');
  const MAX_DATE = new Date('2026-03-16');
  MAX_DATE.setHours(23, 59, 59, 999);
  
  let processed = 0;
  let imported = 0;
  let skippedNoKp = 0;
  let skippedPre2025 = 0;
  let skippedEmpty = 0;
  let errors = 0;
  
  const BATCH_SIZE = 1000;
  const records: any[] = [];
  
  console.log('Processing rows...');
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (!row || row.length === 0) {
      skippedEmpty++;
      continue;
    }
    
    // Get KP from column P
    const kp = parseString(row[COL_INDICES.P]);
    
    // Skip if KP is empty
    if (!kp) {
      skippedNoKp++;
      continue;
    }
    
    // Skip if KP not in SalesContract
    if (!validKPs.has(kp)) {
      skippedNoKp++;
      continue;
    }
    
    // Get TGL (primary date) and TGL_POTONG (cut date)
    const tgl = parseTglDate(row[COL_INDICES.TGL]);
    const tglPotong = parseTglPotongDate(row[COL_INDICES.TGL_POTONG]);
    
    // Skip if TGL (primary date) is empty
    if (!tgl) {
      skippedEmpty++;
      continue;
    }
    
    // Use TGL as primary record date, TGL_POTONG stored separately (can be null)
    const recordDate = tgl;
    
    // Skip if primary date is before 2025-01-01 or after 2026-03-16
    if (recordDate && recordDate < MIN_DATE) {
      skippedPre2025++;
      continue;
    }
    if (recordDate && recordDate > MAX_DATE) {
      skippedPre2025++;
      continue;
    }
    
    // Build record - TGL is primary, TGL_POTONG is separate
    const record: any = {
      kp: kp,
      tgl: recordDate,
      shift: parseString(row[COL_INDICES.SHIFT]),
      operator: parseString(row[COL_INDICES.OPR]),
      sn: parseString(row[COL_INDICES.SN]),
      tgl_potong: tglPotong,
      lebar: parseFloatSafe(row[COL_INDICES.LEBAR]),
      kg: parseFloatSafe(row[COL_INDICES.KG]),
      susut_lusi: parseFloatSafe(row[COL_INDICES.SUSUT_LUSI]),
      grade: parseString(row[COL_INDICES.GR]),
      point: parseFloatSafe(row[COL_INDICES.POINT]),
      
      // Defects
      btl: parseIntSafe(row[COL_INDICES.BTL]),
      bts: parseIntSafe(row[COL_INDICES.BTS]),
      slub: parseIntSafe(row[COL_INDICES.SLUB]),
      snl: parseIntSafe(row[COL_INDICES.SNL]),
      losp: parseIntSafe(row[COL_INDICES.LOSP]),
      lb: parseIntSafe(row[COL_INDICES.LB]),
      ptr: parseIntSafe(row[COL_INDICES.PTR]),
      p_slub: parseIntSafe(row[COL_INDICES.P_SLUB]),
      pb: parseIntSafe(row[COL_INDICES.PB]),
      lm: parseIntSafe(row[COL_INDICES.LM]),
      aw: parseIntSafe(row[COL_INDICES.AW]),
      ptm: parseIntSafe(row[COL_INDICES.PTM]),
      j: parseIntSafe(row[COL_INDICES.J]),
      bta: parseIntSafe(row[COL_INDICES.BTA]),
      pts: parseIntSafe(row[COL_INDICES.PTS]),
      pd: parseIntSafe(row[COL_INDICES.PD]),
      pp: parseIntSafe(row[COL_INDICES.PP]),
      pks: parseIntSafe(row[COL_INDICES.PKS]),
      pss: parseIntSafe(row[COL_INDICES.PSS]),
      pkl: parseIntSafe(row[COL_INDICES.PKL]),
      pk: parseIntSafe(row[COL_INDICES.PK]),
      plc: parseIntSafe(row[COL_INDICES.PLC]),
      lp: parseIntSafe(row[COL_INDICES.LP]),
      lks: parseIntSafe(row[COL_INDICES.LKS]),
      lkc: parseIntSafe(row[COL_INDICES.LKC]),
      ld: parseIntSafe(row[COL_INDICES.LD]),
      lkt: parseIntSafe(row[COL_INDICES.LKT]),
      lki: parseIntSafe(row[COL_INDICES.LKI]),
      bmc: parseIntSafe(row[COL_INDICES.BMC]),
      exst: parseIntSafe(row[COL_INDICES.EXST]),
      smg: parseIntSafe(row[COL_INDICES.SMG]),
      
      // Quality flags
      noda: parseString(row[COL_INDICES.NODA]),
      kotor: parseString(row[COL_INDICES.KOTOR]),
      bkrt: parseString(row[COL_INDICES.BKRT]),
      ket: parseString(row[COL_INDICES.KET]),
      
      // Blueprint refs
      blpt_grey: parseString(row[COL_INDICES.BLPT_GREY]),
      bl_ws: parseFloatSafe(row[COL_INDICES.BL_WS]),
      bl_bb: parseString(row[COL_INDICES.BL_BB]),
    };
    
    // Add record directly to batch (no deduplication)
    records.push(record);
    processed++;
    
    // Batch insert
    if (records.length >= BATCH_SIZE) {
      if (records.length > 0) {
        try {
          const result = await prisma.inspectFinishRecord.createMany({
            data: records,
            skipDuplicates: true
          });
          imported += result.count;
        } catch (error: any) {
          errors++;
          if (errors <= 5) {
            console.error(`  Error: ${error.message}`);
          }
        }
        records.length = 0;
      }
      
      // Print progress
      if (processed % 10000 === 0) {
        console.log(`  Processed ${processed} rows...`);
      }
    }
  }
  
  // Process remaining records
  if (records.length > 0) {
    try {
      const result = await prisma.inspectFinishRecord.createMany({
        data: records,
        skipDuplicates: true
      });
      imported += result.count;
    } catch (error: any) {
      errors++;
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log(`Total rows processed: ${processed}`);
  console.log(`Records imported: ${imported}`);
  console.log(`Skipped (no KP match): ${skippedNoKp}`);
  console.log(`Skipped (pre-2025): ${skippedPre2025}`);
  console.log(`Skipped (empty): ${skippedEmpty}`);
  console.log(`Errors: ${errors}`);
  
  // Current count
  const currentCount = await prisma.inspectFinishRecord.count();
  console.log(`\nTotal InspectFinishRecord in database: ${currentCount}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
