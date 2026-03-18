/**
 * Import BBSF Records from DATA BBSF.xlsx
 *
 * New schema: 3 separate tables
 * - BBSFWashingRun: one row per Excel row from WASHING sheet
 * - BBSFSanforRun: one row per Excel row from SANFOR PERTAMA/KEDUA/5 sheets
 * - BBSFServiceRecord: one row per Excel row from SERVICE DAN PREVENTIVE sheet
 *
 * Date format: YYYY-MM-DD HH:MM:SS (Python/openpyxl parsed as datetime objects)
 * Use xlsx with cellDates: true
 */

import * as XLSX from 'xlsx';
import { PrismaClient, BBSFWashingRun, BBSFSanforRun, BBSFServiceRecord } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/DATA BBSF.xlsx';
const MIN_DATE = new Date(2025, 0, 1);   // Jan 1, 2025
const MAX_DATE = new Date(2026, 2, 16);  // Mar 16, 2026

interface ImportSummary {
  sheetName: string;
  rowsRead: number;
  imported: number;
  skippedEmptyKP: number;
  skippedInvalidKP: number;
  skippedDateOutOfRange: number;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (value.getFullYear() < 2000 || value.getFullYear() > 2026) return null;
    return value;
  }
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
    return date;
  }
  const str = String(value).trim();
  if (!str) return null;

  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2026) return null;
  return parsed;
}

function parseString(value: any): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  return String(value);
}

function toNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    return isNaN(num) ? null : num;
  }
  return null;
}

function normalizeHeader(v: any): string {
  return String(v ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function headerIndexMap(headerRow: any[]) {
  const map = new Map<string, number[]>();
  headerRow.forEach((h, idx) => {
    const key = normalizeHeader(h);
    if (!key) return;
    const arr = map.get(key) ?? [];
    arr.push(idx);
    map.set(key, arr);
  });
  return map;
}

function getHeaderIndex(hmap: Map<string, number[]>, ...names: string[]): number {
  for (const name of names) {
    const idx = hmap.get(name);
    if (idx && idx[0] !== undefined) return idx[0];
  }
  return -1;
}

async function importWashing(
  workbook: XLSX.WorkBook,
  validKPs: Set<string>,
  summary: ImportSummary
) {
  const ws = workbook.Sheets['WASHING'];
  if (!ws) {
    console.log('  Sheet "WASHING" not found');
    return;
  }

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, range: 3, defval: null });
  if (rows.length === 0) return;

  const header = rows[0] ?? [];
  const hmap = headerIndexMap(header);

  const idx = {
    tgl: getHeaderIndex(hmap, 'TGL'),
    shift: getHeaderIndex(hmap, 'SHIFT'),
    mc: getHeaderIndex(hmap, 'MC'),
    kp: getHeaderIndex(hmap, 'KP'),
    speed: getHeaderIndex(hmap, 'SPEED'),
    jamProses: getHeaderIndex(hmap, 'JAM PROSES'),
    larutan1: getHeaderIndex(hmap, 'LARUTAN'),
    larutan2: getHeaderIndex(hmap, 'LARUTAN'),
    temp1: getHeaderIndex(hmap, 'TEMPERATUR'),
    temp2: getHeaderIndex(hmap, 'TEMPERATUR'),
    padder1: getHeaderIndex(hmap, 'PRESS PADDER (KG/CM2)', 'PRESS PADDER'),
    padder2: getHeaderIndex(hmap, 'PRESS PADDER (KG/CM2)', 'PRESS PADDER'),
    dancing1: getHeaderIndex(hmap, 'PRESS DANCING (KG/CM2)', 'PRESS DANCING'),
    dancing2: getHeaderIndex(hmap, 'PRESS DANCING (KG/CM2)', 'PRESS DANCING'),
    skew: getHeaderIndex(hmap, 'SKEW', 'SKALA'),
    tekananBoiler: getHeaderIndex(hmap, 'TEKANAN BOILER (KG/CM2)', 'TEKANAN BOILER'),
    tempZone1: getHeaderIndex(hmap, 'TEMPERATUR 1'),
    tempZone2: getHeaderIndex(hmap, 'TEMPERATUR 2'),
    tempZone3: getHeaderIndex(hmap, 'TEMPERATUR 3'),
    tempZone4: getHeaderIndex(hmap, 'TEMPERATUR 4'),
    tempZone5: getHeaderIndex(hmap, 'TEMPERATUR 5'),
    tempZone6: getHeaderIndex(hmap, 'TEMPERATUR 6'),
    lebarAwal: getHeaderIndex(hmap, 'LEBAR AWAL'),
    panjangAwal: getHeaderIndex(hmap, 'PANJANG AWAL'),
    permasalahan: getHeaderIndex(hmap, 'PERMASALAHAN'),
    pelaksana: getHeaderIndex(hmap, 'PELAKSANA'),
  };

  const records: Omit<BBSFWashingRun, 'id'>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    summary.rowsRead++;

    const kp = parseString(row?.[idx.kp]);
    if (!kp) {
      summary.skippedEmptyKP++;
      continue;
    }
    if (!validKPs.has(kp)) {
      summary.skippedInvalidKP++;
      continue;
    }

    const tgl = parseDate(row?.[idx.tgl]);
    if (!tgl) {
      summary.skippedDateOutOfRange++;
      continue;
    }
    if (tgl < MIN_DATE || tgl > MAX_DATE) {
      summary.skippedDateOutOfRange++;
      continue;
    }

    const larutanArr = hmap.get('LARUTAN') || [];
    const temperaturArr = hmap.get('TEMPERATUR') || [];
    const pressPadderArr = hmap.get('PRESS PADDER (KG/CM2)') || hmap.get('PRESS PADDER') || [];
    const pressDancingArr = hmap.get('PRESS DANCING (KG/CM2)') || hmap.get('PRESS DANCING') || [];

    records.push({
      kp,
      tgl,
      shift: parseString(row?.[idx.shift]),
      mc: parseString(row?.[idx.mc]),
      jam_proses: parseString(row?.[idx.jamProses]),
      speed: parseString(row?.[idx.speed]),
      larutan_1: larutanArr[0] !== undefined ? parseString(row?.[larutanArr[0]]) : null,
      temp_1: temperaturArr[0] !== undefined ? toNumber(row?.[temperaturArr[0]]) : null,
      padder_1: pressPadderArr[0] !== undefined ? toNumber(row?.[pressPadderArr[0]]) : null,
      dancing_1: pressDancingArr[0] !== undefined ? toNumber(row?.[pressDancingArr[0]]) : null,
      larutan_2: larutanArr[1] !== undefined ? parseString(row?.[larutanArr[1]]) : null,
      temp_2: temperaturArr[1] !== undefined ? toNumber(row?.[temperaturArr[1]]) : null,
      padder_2: pressPadderArr[1] !== undefined ? toNumber(row?.[pressPadderArr[1]]) : null,
      dancing_2: pressDancingArr[1] !== undefined ? toNumber(row?.[pressDancingArr[1]]) : null,
      skala_skew: toNumber(row?.[idx.skew]),
      tekanan_boiler: toNumber(row?.[idx.tekananBoiler]),
      press_dancing_1: null,
      press_dancing_2: null,
      press_dancing_3: null,
      temp_zone_1: toNumber(row?.[idx.tempZone1]),
      temp_zone_2: toNumber(row?.[idx.tempZone2]),
      temp_zone_3: toNumber(row?.[idx.tempZone3]),
      temp_zone_4: toNumber(row?.[idx.tempZone4]),
      temp_zone_5: toNumber(row?.[idx.tempZone5]),
      temp_zone_6: toNumber(row?.[idx.tempZone6]),
      lebar_awal: toNumber(row?.[idx.lebarAwal]),
      panjang_awal: toNumber(row?.[idx.panjangAwal]),
      permasalahan: parseString(row?.[idx.permasalahan]),
      pelaksana: parseString(row?.[idx.pelaksana]),
      created_at: new Date(),
    });
    summary.imported++;
  }

  if (records.length > 0) {
    console.log(`  Inserting ${records.length} records...`);
    await prisma.bBSFWashingRun.createMany({ data: records as any, skipDuplicates: true });
  }
}

async function importSanfor(
  workbook: XLSX.WorkBook,
  sheetName: string,
  sanforType: 'SF1' | 'SF2' | 'SF5',
  validKPs: Set<string>,
  summary: ImportSummary
) {
  const ws = workbook.Sheets[sheetName];
  if (!ws) {
    console.log(`  Sheet "${sheetName}" not found`);
    return;
  }

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, range: 3, defval: null });
  if (rows.length === 0) return;

  const header = rows[0] ?? [];
  const hmap = headerIndexMap(header);

  const idx = {
    tgl: getHeaderIndex(hmap, 'TGL'),
    shift: getHeaderIndex(hmap, 'SHIFT'),
    kp: getHeaderIndex(hmap, 'KP'),
    mc: getHeaderIndex(hmap, 'MC'),
    jam: getHeaderIndex(hmap, 'JAM'),
    speed: getHeaderIndex(hmap, 'SPEED'),
    damping: getHeaderIndex(hmap, 'DAMPING'),
    press: getHeaderIndex(hmap, 'PRESS'),
    tension: getHeaderIndex(hmap, 'TENSION'),
    tensionLimit: getHeaderIndex(hmap, 'LIMIT', 'TENSION LIMIT'),
    temperatur: getHeaderIndex(hmap, 'TEMPERATUR'),
    susut: getHeaderIndex(hmap, 'SUSUT (%)', 'SUSUT'),
    awal: getHeaderIndex(hmap, 'AWAL'),
    akhir: getHeaderIndex(hmap, 'AKHIR'),
    panjang: getHeaderIndex(hmap, 'PANJANG'),
    permasalahan: getHeaderIndex(hmap, 'PERMASALAHAN'),
    pelaksana: getHeaderIndex(hmap, 'PELAKSANA'),
  };

  const records: Omit<BBSFSanforRun, 'id'>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    summary.rowsRead++;

    const kp = parseString(row?.[idx.kp]);
    if (!kp) {
      summary.skippedEmptyKP++;
      continue;
    }
    if (!validKPs.has(kp)) {
      summary.skippedInvalidKP++;
      continue;
    }

    const tgl = parseDate(row?.[idx.tgl]);
    if (!tgl) {
      summary.skippedDateOutOfRange++;
      continue;
    }
    if (tgl < MIN_DATE || tgl > MAX_DATE) {
      summary.skippedDateOutOfRange++;
      continue;
    }

    records.push({
      kp,
      tgl,
      shift: parseString(row?.[idx.shift]),
      mc: parseString(row?.[idx.mc]),
      sanfor_type: sanforType,
      jam: parseString(row?.[idx.jam]),
      speed: parseString(row?.[idx.speed]),
      damping: toNumber(row?.[idx.damping]),
      press: toNumber(row?.[idx.press]),
      tension: toNumber(row?.[idx.tension]),
      tension_limit: toNumber(row?.[idx.tensionLimit]),
      temperatur: toNumber(row?.[idx.temperatur]),
      susut: toNumber(row?.[idx.susut]),
      awal: toNumber(row?.[idx.awal]),
      akhir: toNumber(row?.[idx.akhir]),
      panjang: toNumber(row?.[idx.panjang]),
      permasalahan: parseString(row?.[idx.permasalahan]),
      pelaksana: parseString(row?.[idx.pelaksana]),
      created_at: new Date(),
    });
    summary.imported++;
  }

  if (records.length > 0) {
    console.log(`  Inserting ${records.length} records...`);
    await prisma.bBSFSanforRun.createMany({ data: records as any, skipDuplicates: true });
  }
}

async function importService(
  workbook: XLSX.WorkBook,
  summary: ImportSummary
) {
  const ws = workbook.Sheets['SERVICE DAN PREVENTIVE'];
  if (!ws) {
    console.log('  Sheet "SERVICE DAN PREVENTIVE" not found');
    return;
  }

  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, range: 3, defval: null });
  if (rows.length === 0) return;

  const header = rows[0] ?? [];
  const hmap = headerIndexMap(header);

  const idx = {
    tgl: getHeaderIndex(hmap, 'TGL'),
    keterangan: getHeaderIndex(hmap, 'KETERANGAN'),
    mc: getHeaderIndex(hmap, 'MC'),
    noMc: getHeaderIndex(hmap, 'NO MC'),
    tindakan: getHeaderIndex(hmap, 'TINDAKAN'),
  };

  const records: Omit<BBSFServiceRecord, 'id'>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    summary.rowsRead++;

    const tgl = parseDate(row?.[idx.tgl]);
    if (!tgl) {
      summary.skippedDateOutOfRange++;
      continue;
    }
    if (tgl < MIN_DATE || tgl > MAX_DATE) {
      summary.skippedDateOutOfRange++;
      continue;
    }

    records.push({
      tgl,
      keterangan: parseString(row?.[idx.keterangan]),
      mc: parseString(row?.[idx.mc]),
      no_mc: toNumber(row?.[idx.noMc]),
      tindakan: parseString(row?.[idx.tindakan]),
      created_at: new Date(),
    });
    summary.imported++;
  }

  if (records.length > 0) {
    console.log(`  Inserting ${records.length} records...`);
    await prisma.bBSFServiceRecord.createMany({ data: records as any, skipDuplicates: true });
  }
}

function printSummary(summaries: ImportSummary[]) {
  console.log('\n=== Import Summary ===\n');
  for (const s of summaries) {
    console.log(`${s.sheetName}:`);
    console.log(`  Rows read: ${s.rowsRead}`);
    console.log(`  Imported: ${s.imported}`);
    console.log(`  Skipped (empty KP): ${s.skippedEmptyKP}`);
    console.log(`  Skipped (invalid KP): ${s.skippedInvalidKP}`);
    console.log(`  Skipped (date out of range): ${s.skippedDateOutOfRange}`);
    console.log();
  }
}

async function main() {
  console.log('=== Import BBSF Records (New Schema) ===\n');
  console.log('Excel file:', EXCEL_FILE);
  console.log('Date range:', MIN_DATE.toISOString().split('T')[0], 'to', MAX_DATE.toISOString().split('T')[0]);

  console.log('\nLoading valid KPs...');
  const validKPs = new Set(
    await prisma.salesContract.findMany({ select: { kp: true } }).then(r => r.map(x => x.kp))
  );
  console.log(`Loaded ${validKPs.size} valid KPs`);

  console.log('\nReading Excel with cellDates: true...');
  const workbook = XLSX.readFile(EXCEL_FILE, { cellDates: true });

  const summaries: ImportSummary[] = [];

  // Import WASHING → BBSFWashingRun
  const washingSummary: ImportSummary = {
    sheetName: 'WASHING → BBSFWashingRun',
    rowsRead: 0,
    imported: 0,
    skippedEmptyKP: 0,
    skippedInvalidKP: 0,
    skippedDateOutOfRange: 0,
  };
  console.log('\n--- WASHING → BBSFWashingRun ---');
  await importWashing(workbook, validKPs, washingSummary);
  summaries.push(washingSummary);

  // Import SANFOR PERTAMA → BBSFSanforRun (SF1)
  const sf1Summary: ImportSummary = {
    sheetName: 'SANFOR PERTAMA → BBSFSanforRun (SF1)',
    rowsRead: 0,
    imported: 0,
    skippedEmptyKP: 0,
    skippedInvalidKP: 0,
    skippedDateOutOfRange: 0,
  };
  console.log('\n--- SANFOR PERTAMA → BBSFSanforRun (SF1) ---');
  await importSanfor(workbook, 'SANFOR PERTAMA', 'SF1', validKPs, sf1Summary);
  summaries.push(sf1Summary);

  // Import SANFOR KEDUA → BBSFSanforRun (SF2)
  const sf2Summary: ImportSummary = {
    sheetName: 'SANFOR KEDUA → BBSFSanforRun (SF2)',
    rowsRead: 0,
    imported: 0,
    skippedEmptyKP: 0,
    skippedInvalidKP: 0,
    skippedDateOutOfRange: 0,
  };
  console.log('\n--- SANFOR KEDUA → BBSFSanforRun (SF2) ---');
  await importSanfor(workbook, 'SANFOR KEDUA', 'SF2', validKPs, sf2Summary);
  summaries.push(sf2Summary);

  // Import SANFOR 5 → BBSFSanforRun (SF5)
  const sf5Summary: ImportSummary = {
    sheetName: 'SANFOR 5 → BBSFSanforRun (SF5)',
    rowsRead: 0,
    imported: 0,
    skippedEmptyKP: 0,
    skippedInvalidKP: 0,
    skippedDateOutOfRange: 0,
  };
  console.log('\n--- SANFOR 5 → BBSFSanforRun (SF5) ---');
  await importSanfor(workbook, 'SANFOR 5', 'SF5', validKPs, sf5Summary);
  summaries.push(sf5Summary);

  // Import SERVICE DAN PREVENTIVE → BBSFServiceRecord
  const serviceSummary: ImportSummary = {
    sheetName: 'SERVICE DAN PREVENTIVE → BBSFServiceRecord',
    rowsRead: 0,
    imported: 0,
    skippedEmptyKP: 0,
    skippedInvalidKP: 0,
    skippedDateOutOfRange: 0,
  };
  console.log('\n--- SERVICE DAN PREVENTIVE → BBSFServiceRecord ---');
  await importService(workbook, serviceSummary);
  summaries.push(serviceSummary);

  // Print summary
  printSummary(summaries);

  // Verification
  console.log('=== Verification ===');
  const washingCount = await prisma.bBSFWashingRun.count();
  const sanforCount = await prisma.bBSFSanforRun.count();
  const serviceCount = await prisma.bBSFServiceRecord.count();

  console.log(`BBSFWashingRun: ${washingCount} records`);
  console.log(`BBSFSanforRun: ${sanforCount} records`);
  console.log(`BBSFServiceRecord: ${serviceCount} records`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
