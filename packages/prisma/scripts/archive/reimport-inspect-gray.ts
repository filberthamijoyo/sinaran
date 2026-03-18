/**
 * Re-import InspectGray with stricter date filtering
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

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

const DEFECT_COLUMNS = [
  'bmc', 'btl', 'bts', 'pp', 'pks', 'ko', 'db', 'bl', 'ptr', 'pkt', 'fly', 'ls', 'lpb',
  'p_bulu', 'smg', 'sms', 'aw', 'pl', 'na', 'lm', 'lkc', 'lks', 'ld', 'pts', 'pd',
  'lkt', 'pk', 'lp', 'plc', 'j', 'kk', 'bta', 'pj', 'rp', 'pb', 'xpd', 'br', 'pss',
  'luper', 'ptn', 'b_bercak', 'r_rusak', 'sl', 'p_timbul', 'b_celup', 'p_tumpuk',
  'b_bar', 'sml', 'p_slub', 'p_belang', 'crossing', 'x_sambang', 'p_jelek', 'lipatan'
];

function parseDateMDY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date;
  }
  const str = String(value).trim();
  if (!str) return null;
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
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
  console.log('=== Re-import InspectGray Records (filtered to Feb 25) ===\n');
  
  // Load valid KPs
  console.log('Loading valid KPs...');
  const validKPs = new Set(
    await prisma.salesContract.findMany({ select: { kp: true } }).then(r => r.map(x => x.kp))
  );
  console.log(`Loaded ${validKPs.size} valid KPs\n`);

  // Read Excel
  console.log(`Reading Excel: ${EXCEL_FILE}`);
  const workbook = XLSX.readFile(EXCEL_FILE, { raw: false, cellDates: false, type: 'string' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, range: 4, defval: '' });
  console.log(`Total rows: ${data.length}\n`);

  // Filter to Feb 25 max
  const MAX_DATE = new Date(2026, 1, 25); // Feb 25, 2026
  
  const recordsToInsert: any[] = [];
  let skippedNoKp = 0;
  let skippedFuture = 0;
  let skippedEmpty = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) { skippedEmpty++; continue; }
    
    const kpValue = parseString(row[2]);
    if (!kpValue) { skippedEmpty++; continue; }
    if (!validKPs.has(kpValue)) { skippedNoKp++; continue; }
    
    const tgValue = parseDate(row[1]);
    if (!tgValue) { skippedEmpty++; continue; }
    if (tgValue > MAX_DATE) { skippedFuture++; continue; }
    
    const record: any = {
      kp: kpValue,
      tg: tgValue,
      d: parseString(row[3]),
      mc: parseString(row[4]),
      bm: parseIntSafe(row[5]),
      sn: parseString(row[6]),
      sn_combined: parseString(row[7]),
      gd: parseString(row[8]),
      // Decimal fields - pass as strings to let Prisma handle
      bme: parseFloatSafe(row[9])?.toString(),
      sj: parseFloatSafe(row[10])?.toString(),
      actual_meters: parseFloatSafe(row[10])?.toString(), // SJ maps to actual_meters
      w: parseString(row[11]),
      g: parseString(row[12]),
      opg: parseString(row[13]),
      // tgl_potong: skip for now - has wrong serial numbers in Excel
    };
    
    let defectSum = 0;
    for (let colIdx = 0; colIdx < DEFECT_COLUMNS.length; colIdx++) {
      const excelColIdx = 15 + colIdx;
      const fieldName = DEFECT_COLUMNS[colIdx];
      const value = parseIntSafe(row[excelColIdx]);
      record[fieldName] = value;
      if (value !== null) defectSum += value;
    }
    // defect_sum field doesn't exist in schema, don't include it;
    
    recordsToInsert.push(record);
  }
  
  console.log(`Skipped: ${skippedNoKp} (no KP), ${skippedFuture} (future), ${skippedEmpty} (empty)`);
  console.log(`Records to insert: ${recordsToInsert.length}\n`);
  
  // Insert in batches
  console.log('Inserting...');
  const batchSize = 500;
  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize);
    await prisma.inspectGrayRecord.createMany({ data: batch });
    console.log(`  Inserted ${Math.min(i + batchSize, recordsToInsert.length)} / ${recordsToInsert.length}`);
  }
  
  // Verify
  const count = await prisma.inspectGrayRecord.count();
  const range = await prisma.$queryRawUnsafe<[{min: Date, max: Date}]>(`SELECT MIN(tg) as min, MAX(tg) as max FROM "InspectGrayRecord"`);
  console.log(`\nTotal records: ${count}`);
  console.log(`Date range: ${range[0].min.toISOString().split('T')[0]} to ${range[0].max.toISOString().split('T')[0]}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
