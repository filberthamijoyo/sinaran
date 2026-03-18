/**
 * Import BBSF Records from all sheets
 * DATA BBSF.xlsx: WASHING, SANFOR PERTAMA, SANFOR KEDUA, SANFOR 5, SERVICE DAN PREVENTIVE
 */

const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/DATA BBSF.xlsx';
const MIN_DATE = new Date(2025, 0, 1);

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date((value - 25569) * 86400 * 1000);
  return null;
}

function parseString(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  return String(value);
}

function toNumber(value) {
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

async function processWashingSheet(sheetData, validKPs) {
  console.log(`\nProcessing WASHING sheet (${sheetData.length} rows)...`);
  let processed = 0;
  let inserted = 0;
  let batch = [];

  for (let i = 0; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row) continue;
    
    const tglValue = parseDate(row[0]);
    if (!tglValue || tglValue < MIN_DATE) continue;
    
    const kpValue = parseString(row[7]); // Column H: KP
    if (!kpValue || !validKPs.has(kpValue)) continue;

    const record = {
      kp: kpValue,
      tgl: tglValue,
      ws_shift: parseString(row[1]),
      ws_mc: parseString(row[2]),
      ws_speed: toNumber(row[9]),
      ws_larutan_1: parseString(row[11]),
      ws_temp_1: toNumber(row[12]),
      ws_padder_1: toNumber(row[13]),
      ws_dancing_1: toNumber(row[14]),
      ws_larutan_2: parseString(row[15]),
      ws_temp_2: toNumber(row[16]),
      ws_padder_2: toNumber(row[17]),
      ws_dancing_2: toNumber(row[18]),
      ws_skew: toNumber(row[19]),
      ws_tekanan_boiler: toNumber(row[20]),
      ws_temp_1_zone: toNumber(row[24]),
      ws_temp_2_zone: toNumber(row[25])
    };

    batch.push(record);
    
    if (batch.length >= 50) {
      await upsertBatch(batch, 'ws');
      inserted += batch.length;
      batch = [];
    }
    processed++;
  }

  if (batch.length > 0) {
    await upsertBatch(batch, 'ws');
    inserted += batch.length;
  }

  console.log(`  Processed: ${processed}, Inserted/Updated: ${inserted}`);
  return inserted;
}

async function processSanforPertamaSheet(sheetData, validKPs) {
  console.log(`\nProcessing SANFOR PERTAMA sheet (${sheetData.length} rows)...`);
  let processed = 0;
  let inserted = 0;
  let batch = [];

  for (let i = 0; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row) continue;
    
    const tglValue = parseDate(row[0]);
    if (!tglValue || tglValue < MIN_DATE) continue;
    
    const kpValue = parseString(row[5]); // Column F: KP
    if (!kpValue || !validKPs.has(kpValue)) continue;

    // Only sf1_* fields - don't touch ws_* fields
    const record = {
      kp: kpValue,
      sf1_shift: parseString(row[1]),
      sf1_mc: parseString(row[6]),
      sf1_speed: parseString(row[8]),
      sf1_damping: toNumber(row[9]),
      sf1_press: toNumber(row[10]),
      sf1_tension: toNumber(row[11]),
      sf1_tension_limit: toNumber(row[14]),
      sf1_temperatur: toNumber(row[12]),
      sf1_susut: toNumber(row[16]),
      sf1_permasalahan: parseString(row[17]),
      sf1_pelaksana: parseString(row[18])
    };

    batch.push(record);
    
    if (batch.length >= 50) {
      await upsertBatch(batch, 'sf1');
      inserted += batch.length;
      batch = [];
    }
    processed++;
  }

  if (batch.length > 0) {
    await upsertBatch(batch, 'sf1');
    inserted += batch.length;
  }

  console.log(`  Processed: ${processed}, Inserted/Updated: ${inserted}`);
  return inserted;
}

async function processSanforKeduaSheet(sheetData, validKPs) {
  console.log(`\nProcessing SANFOR KEDUA sheet (${sheetData.length} rows)...`);
  let processed = 0;
  let inserted = 0;
  let batch = [];

  for (let i = 0; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row) continue;
    
    const tglValue = parseDate(row[0]);
    if (!tglValue || tglValue < MIN_DATE) continue;
    
    const kpValue = parseString(row[5]); // Column F: KP
    if (!kpValue || !validKPs.has(kpValue)) continue;

    // Only sf2_* fields - don't touch ws_* or sf1_* fields
    const record = {
      kp: kpValue,
      sf2_shift: parseString(row[1]),
      sf2_mc: parseString(row[6]),
      sf2_speed: parseString(row[8]),
      sf2_damping: toNumber(row[9]),
      sf2_press: toNumber(row[10]),
      sf2_tension: toNumber(row[11]),
      sf2_tension_limit: toNumber(row[14]),
      sf2_temperatur: toNumber(row[12]),
      sf2_susut: toNumber(row[16]),
      sf2_awal: toNumber(row[17]),
      sf2_akhir: toNumber(row[18]),
      sf2_panjang: toNumber(row[19]),
      sf2_permasalahan: parseString(row[20]),
      sf2_pelaksana: parseString(row[21])
    };

    batch.push(record);
    
    if (batch.length >= 50) {
      await upsertBatch(batch, 'sf2');
      inserted += batch.length;
      batch = [];
    }
    processed++;
  }

  if (batch.length > 0) {
    await upsertBatch(batch, 'sf2');
    inserted += batch.length;
  }

  console.log(`  Processed: ${processed}, Inserted/Updated: ${inserted}`);
  return inserted;
}

async function upsertBatch(batch, type) {
  for (const record of batch) {
    try {
      const existing = await prisma.bBSFRecord.findUnique({ where: { kp: record.kp } });
      
      if (existing) {
        // Update only the fields for this sheet type
        if (type === 'ws') {
          await prisma.bBSFRecord.update({
            where: { kp: record.kp },
            data: {
              tgl: record.tgl,
              ws_shift: record.ws_shift,
              ws_mc: record.ws_mc,
              ws_speed: record.ws_speed,
              ws_larutan_1: record.ws_larutan_1,
              ws_temp_1: record.ws_temp_1,
              ws_padder_1: record.ws_padder_1,
              ws_dancing_1: record.ws_dancing_1,
              ws_larutan_2: record.ws_larutan_2,
              ws_temp_2: record.ws_temp_2,
              ws_padder_2: record.ws_padder_2,
              ws_dancing_2: record.ws_dancing_2,
              ws_skew: record.ws_skew,
              ws_tekanan_boiler: record.ws_tekanan_boiler,
              ws_temp_1_zone: record.ws_temp_1_zone,
              ws_temp_2_zone: record.ws_temp_2_zone
            }
          });
        } else if (type === 'sf1') {
          await prisma.bBSFRecord.update({
            where: { kp: record.kp },
            data: {
              sf1_shift: record.sf1_shift,
              sf1_mc: record.sf1_mc,
              sf1_speed: record.sf1_speed,
              sf1_damping: record.sf1_damping,
              sf1_press: record.sf1_press,
              sf1_tension: record.sf1_tension,
              sf1_tension_limit: record.sf1_tension_limit,
              sf1_temperatur: record.sf1_temperatur,
              sf1_susut: record.sf1_susut,
              sf1_permasalahan: record.sf1_permasalahan,
              sf1_pelaksana: record.sf1_pelaksana
            }
          });
        } else if (type === 'sf2') {
          await prisma.bBSFRecord.update({
            where: { kp: record.kp },
            data: {
              sf2_shift: record.sf2_shift,
              sf2_mc: record.sf2_mc,
              sf2_speed: record.sf2_speed,
              sf2_damping: record.sf2_damping,
              sf2_press: record.sf2_press,
              sf2_tension: record.sf2_tension,
              sf2_tension_limit: record.sf2_tension_limit,
              sf2_temperatur: record.sf2_temperatur,
              sf2_susut: record.sf2_susut,
              sf2_awal: record.sf2_awal,
              sf2_akhir: record.sf2_akhir,
              sf2_panjang: record.sf2_panjang,
              sf2_permasalahan: record.sf2_permasalahan,
              sf2_pelaksana: record.sf2_pelaksana
            }
          });
        }
      } else {
        // Create new record with just this sheet's fields
        await prisma.bBSFRecord.create({ data: record });
      }
    } catch (e) {
      // Silently skip errors
    }
  }
}

async function main() {
  console.log('=== Import BBSF Records ===\n');
  console.log('Excel file:', EXCEL_FILE);
  console.log('Min date:', MIN_DATE.toISOString().split('T')[0]);
  
  console.log('\nLoading valid KPs...');
  const validKPs = new Set(
    await prisma.salesContract.findMany({ select: { kp: true } }).then(r => r.map(x => x.kp))
  );
  console.log(`Loaded ${validKPs.size} valid KPs`);
  
  // Clear existing BBSF records
  console.log('\nClearing existing BBSF records...');
  await prisma.bBSFRecord.deleteMany({});
  console.log('Cleared.');
  
  console.log('\nReading Excel...');
  const workbook = XLSX.readFile(EXCEL_FILE, { raw: false, cellDates: true });
  
  // Process WASHING first
  if (workbook.SheetNames.includes('WASHING')) {
    const ws = workbook.Sheets['WASHING'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, range: 4, defval: null });
    await processWashingSheet(data, validKPs);
  }
  
  // Process SANFOR PERTAMA second
  if (workbook.SheetNames.includes('SANFOR PERTAMA')) {
    const ws = workbook.Sheets['SANFOR PERTAMA'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, range: 4, defval: null });
    await processSanforPertamaSheet(data, validKPs);
  }
  
  // Process SANFOR KEDUA third
  if (workbook.SheetNames.includes('SANFOR KEDUA')) {
    const ws = workbook.Sheets['SANFOR KEDUA'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, range: 4, defval: null });
    await processSanforKeduaSheet(data, validKPs);
  }
  
  console.log('\n=== Verifying ===');
  const result = await prisma.$queryRawUnsafe(`
    SELECT 
      COUNT(*) as total,
      COUNT(ws_shift) as has_washing,
      COUNT(sf1_shift) as has_sanfor1,
      COUNT(sf2_shift) as has_sanfor2
    FROM "BBSFRecord"
  `);
  
  console.log('\nResults:');
  console.log('  Total records:', Number(result[0].total));
  console.log('  Has washing data:', Number(result[0].has_washing));
  console.log('  Has Sanfor 1 data:', Number(result[0].has_sanfor1));
  console.log('  Has Sanfor 2 data:', Number(result[0].has_sanfor2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
