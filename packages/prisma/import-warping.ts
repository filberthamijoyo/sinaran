import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  connection: {
    pool: { min: 1, max: 1 }
  }
});

function toDate(val: any): Date {
  if (!val || val === '') return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    return new Date(Math.round((val - 25569) * 86400 * 1000));
  }
  if (typeof val === 'string') {
    const parts = val.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

async function importWarping() {
  console.log('=== Importing WARPING ===');
  
  const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
  const sheetName = workbook.SheetNames[2];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  console.log('Total rows:', data.length);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const BATCH_SIZE = 50;
  
  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (!row) continue;
    
    const kp = row[3];
    if (!kp || typeof kp !== 'string' || kp.trim() === '') {
      skipped++;
      continue;
    }
    
    const tgl = toDate(row[0]);
    if (!tgl || isNaN(tgl.getTime())) {
      skipped++;
      continue;
    }
    
    try {
      await prisma.warpingRun.upsert({
        where: { kp: kp.trim() },
        create: {
          kp: kp.trim(),
          tgl: tgl,
          kode_full: row[4] != null ? String(row[4]) : null,
          benang: row[5] != null ? String(row[5]) : null,
          lot: row[6] != null ? String(row[6]) : null,
          sp: row[7] != null ? String(row[7]) : null,
          pt: row[8] != null ? Math.round(Number(row[8])) : null,
          te: row[9] != null ? Number(row[9]) : null,
          rpm: row[10] != null ? Number(row[10]) : null,
          mtr_per_min: row[11] != null ? Number(row[11]) : null,
          total_putusan: row[27] != null ? Math.round(Number(row[27])) : null,
          total_beam: row[44] != null ? Math.round(Number(row[44])) : null,
          eff_warping: row[48] != null ? Number(row[48]) : null,
          no_mc: row[49] != null ? String(row[49]) : null,
        },
        update: {
          tgl: tgl,
          kode_full: row[4] != null ? String(row[4]) : null,
          benang: row[5] != null ? String(row[5]) : null,
          lot: row[6] != null ? String(row[6]) : null,
          sp: row[7] != null ? String(row[7]) : null,
          pt: row[8] != null ? Math.round(Number(row[8])) : null,
          te: row[9] != null ? Number(row[9]) : null,
          rpm: row[10] != null ? Number(row[10]) : null,
          mtr_per_min: row[11] != null ? Number(row[11]) : null,
          total_putusan: row[27] != null ? Math.round(Number(row[27])) : null,
          total_beam: row[44] != null ? Math.round(Number(row[44])) : null,
          eff_warping: row[48] != null ? Number(row[48]) : null,
          no_mc: row[49] != null ? String(row[49]) : null,
        },
      });
      
      imported++;
      if (imported % 200 === 0) {
        console.log(`  Imported ${imported}...`);
      }
      
      // Reconnect every BATCH_SIZE rows to avoid connection timeout
      if (imported % BATCH_SIZE === 0) {
        await prisma.$disconnect();
        const newPrisma = new PrismaClient();
        Object.assign(prisma, newPrisma);
      }
    } catch (err: any) {
      errors++;
      if (errors <= 5) {
        console.error(`  Error at row ${rowIdx + 1}: ${err.message}`);
      }
    }
  }
  
  console.log(`  WARPING done: ${imported} imported, ${skipped} skipped, ${errors} errors`);
}

async function main() {
  await importWarping();
  await prisma.$disconnect();
}

main().catch(console.error);
