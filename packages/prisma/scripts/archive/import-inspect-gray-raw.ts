import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

// Column indices (0-based) - Excel columns A=0, B=1, C=2, etc.
// Based on: TG, KP, D, MC, BM, SN, SN_comb, GD, BME, W(SJ), G, OPG, TGL_POTONG, NO_POT, BMC
const COL_TG = 1;         // B - tanggal
const COL_KP = 2;         // C - kode produk
const COL_D = 3;          // D - D (some code)
const COL_MC = 4;         // E - MC (machine)
const COL_BM = 5;         // F - BM (batch mark)
const COL_SN = 6;         // G - SN (serial number)
const COL_SN_COMB = 7;    // H - SN combined
const COL_GD = 8;         // I - GD
const COL_BME = 9;        // J - BME
const COL_W = 10;         // K - W (is it SJ?)
// Skip L (seems empty)
const COL_OPG = 12;       // M - OPG
const COL_TGL_POTONG = 13; // N - tanggal potong
const COL_NO_POT = 14;    // O - nomor potong
const COL_BMC = 15;       // P - BMC (banyak cacat - defect count)

// Defect columns start at Q (index 16)
const DEFECT_COLS = [
  'btl', 'bts', 'pp', 'pks', 'ko', 'db', 'bl', 'ptr', 'pkt', 'fly',
  'ls', 'lpb', 'p_bulu', 'smg', 'sms', 'aw', 'pl', 'na', 'lm', 'lkc',
  'lks', 'ld', 'pts', 'pd', 'lkt', 'pk', 'lp', 'plc', 'j', 'kk',
  'bta', 'pj', 'rp', 'pb', 'xpd', 'br', 'pss', 'luper', 'ptn', 'b_bercak',
  'r_rusak', 'sl', 'p_timbul', 'b_celup', 'p_tumpuk', 'b_bar', 'sml', 'p_slub',
  'p_belang', 'crossing', 'x_sambang', 'p_jelek', 'lipatan'
];

const MIN_DATE = new Date('2026-01-01');
const MAX_DATE = new Date('2026-02-25');

function parseCell(ws: any, col: number, row: number): any {
  const addr = XLSX.utils.encode_cell({ c: col, r: row });
  const cell = ws[addr];
  return cell ? cell.v : null;
}

function parseDate(val: any): Date | null {
  if (!val) return null;

  // String format M/D/YYYY - these are correct as-is
  if (typeof val === 'string') {
    const m = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const month = parseInt(m[1]);
      const day = parseInt(m[2]);
      const year = parseInt(m[3]);
      if (year < 2000 || year > 2027) return null;
      return new Date(year, month - 1, day);
    }
    return null;
  }

  // Excel serial number - use XLSX.SSF.parse_date_code
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return null;
    // Serial numbers in this Excel are DD/MM/YYYY — swap month and day
    return new Date(d.y, d.d - 1, d.m); // swap: use d.d as month, d.m as day
  }

  // Date object from xlsx — month and day are swapped for ambiguous dates
  // Fix by treating month as day and day as month
  if (val instanceof Date) {
    const year = val.getFullYear();
    const swappedMonth = val.getDate();   // actual month is stored as day
    const swappedDay = val.getMonth() + 1; // actual day is stored as month
    if (year < 2000 || year > 2027) return null;
    try {
      return new Date(year, swappedMonth - 1, swappedDay);
    } catch {
      return null;
    }
  }

  return null;
}

function parseString(val: any): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str || null;
}

function parseIntValue(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Math.round(val);
  const str = String(val).trim();
  if (!str) return null;
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

function parseFloatValue(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (!str) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

async function getValidKPs(): Promise<Set<string>> {
  const kps = await prisma.salesContract.findMany({
    select: { kp: true },
    distinct: ['kp']
  });
  return new Set(kps.map(r => r.kp));
}

async function main() {
  console.log('=== Import InspectGray Records (Raw Cell Access v2) ===\n');

  // Load valid KPs
  console.log('Loading valid KPs from SalesContract...');
  const validKPs = await getValidKPs();
  console.log(`Loaded ${validKPs.size} valid KPs\n`);

  // Read Excel
  console.log('Reading Excel file:', EXCEL_FILE);
  const wb = XLSX.readFile(EXCEL_FILE, { cellDates: false, raw: true });
  const ws = wb.Sheets['Sheet1'];
  const range = XLSX.utils.decode_range(ws['!ref']!);
  
  console.log(`Sheet range: ${range.s.r} to ${range.e.r} rows (${range.e.r - range.s.r + 1} total)`);
  
  // Data starts at row 6 (index 5)
  const START_ROW = 5;
  
  // Collect records
  let processed = 0;
  let skippedNoKpMatch = 0;
  let skippedPre2025 = 0;
  let skippedEmpty = 0;
  let skippedAfterMax = 0;
  const records: any[] = [];
  
  console.log(`\nProcessing rows from ${START_ROW} to ${range.e.r}...`);
  
  for (let r = START_ROW; r <= range.e.r; r++) {
    processed++;
    
    // Parse TG (date) - column B
    const tgRaw = parseCell(ws, COL_TG, r);
    const tg = parseDate(tgRaw);
    
    // Parse KP - column C
    const kpRaw = parseCell(ws, COL_KP, r);
    const kp = parseString(kpRaw);
    
    // Skip empty rows
    if (!tg || !kp) {
      skippedEmpty++;
      continue;
    }
    
    // Skip dates outside range
    if (tg < MIN_DATE) {
      skippedPre2025++;
      continue;
    }
    if (tg > MAX_DATE) {
      skippedAfterMax++;
      continue;
    }
    
    // Validate KP
    if (!validKPs.has(kp)) {
      skippedNoKpMatch++;
      continue;
    }
    
    // Parse fields matching schema
    const d = parseString(parseCell(ws, COL_D, r));        // D
    const mc = parseString(parseCell(ws, COL_MC, r));       // E - machine
    const bm = parseIntValue(parseCell(ws, COL_BM, r));     // F - batch mark
    const sn = parseString(parseCell(ws, COL_SN, r));      // G
    const sn_combined = parseString(parseCell(ws, COL_SN_COMB, r)); // H
    const gd = parseString(parseCell(ws, COL_GD, r));       // I
    const bme = parseFloatValue(parseCell(ws, COL_BME, r)); // J
    const w = parseString(parseCell(ws, COL_W, r));         // K - might be SJ
    const g = parseString(parseCell(ws, 11, r));            // L
    const opg = parseString(parseCell(ws, COL_OPG, r));    // M
    const tgl_potong = parseDate(parseCell(ws, COL_TGL_POTONG, r)); // N
    const no_pot = parseIntValue(parseCell(ws, COL_NO_POT, r)); // O
    const bmc = parseIntValue(parseCell(ws, COL_BMC, r));   // P - banyak cacat
    
    // Parse defect columns starting at Q (index 16)
    const defectData: Record<string, number | null> = {};
    for (let i = 0; i < DEFECT_COLS.length; i++) {
      const col = 16 + i;
      if (col <= range.e.c) {
        defectData[DEFECT_COLS[i]] = parseIntValue(parseCell(ws, col, r));
      }
    }
    
    const record: any = {
      kp,
      tg,
      d,
      mc,
      bm,
      sn,
      sn_combined,
      gd,
      bme,
      w,
      g,
      opg,
      tgl_potong,
      no_pot,
      bmc,
      ...defectData
    };
    
    records.push(record);
    
    if (processed % 1000 === 0) {
      console.log(`  Processed ${processed} rows, collected ${records.length} records...`);
    }
  }
  
  console.log(`\nTotal records to insert: ${records.length}`);
  console.log(`Skipped (no KP match): ${skippedNoKpMatch}`);
  console.log(`Skipped (pre-2025): ${skippedPre2025}`);
  console.log(`Skipped (after MAX_DATE ${MAX_DATE.toISOString().split('T')[0]}): ${skippedAfterMax}`);
  console.log(`Skipped (empty/null): ${skippedEmpty}`);
  console.log(`Total processed: ${processed}`);
  
  // Insert in batches
  const BATCH_SIZE = 500;
  console.log(`\nInserting records in batches of ${BATCH_SIZE}...`);
  
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    try {
      await prisma.inspectGrayRecord.createMany({
        data: batch,
        skipDuplicates: true
      });
      inserted += batch.length;
      if (inserted % 1000 === 0 || inserted === records.length) {
        console.log(`  Inserted ${inserted} records...`);
      }
    } catch (err: any) {
      console.error(`  Error inserting batch starting at ${i}:`, err.message?.substring(0, 200));
      // Try one by one to identify bad record
      for (let j = 0; j < batch.length; j++) {
        try {
          await prisma.inspectGrayRecord.create({
            data: batch[j]
          });
        } catch (singleErr: any) {
          console.error(`    Bad record at ${i + j}:`, singleErr.message?.substring(0, 100));
        }
      }
    }
  }
  
  // Verify
  const total = await prisma.inspectGrayRecord.count();
  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      MIN(tg)::date as min_date, 
      MAX(tg)::date as max_date,
      COUNT(*) as total
    FROM "InspectGrayRecord"
  `;
  
  console.log(`\n=== Import Summary ===`);
  console.log(`Total new records imported: ${records.length}`);
  console.log(`Total records in database: ${total}`);
  console.log(`Date range: ${stats[0].min_date} to ${stats[0].max_date}`);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
