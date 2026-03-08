import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

function toDate(val: any): Date | null {
  if (!val || val === '') return null;
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
  return null;
}

async function importIndigo() {
  console.log('\n=== Importing INDIGO ===');
  
  const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
  const sheetName = workbook.SheetNames[3];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  console.log('Total rows:', data.length);
  
  let imported = 0;
  let skipped = 0;
  
  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (!row) continue;
    
    const kp = row[2];
    if (!kp || typeof kp !== 'string' || kp.trim() === '') {
      skipped++;
      continue;
    }
    
    const tgl = toDate(row[0]);
    if (!tgl) {
      skipped++;
      continue;
    }
    
    try {
      await prisma.indigoRun.upsert({
        where: { kp: kp.trim() },
        create: {
          kp: kp.trim(),
          tgl: tgl,
          tanggal: tgl,
          mc: row[1] != null ? String(row[1]) : null,
          kode_full: row[3] != null ? String(row[3]) : null,
          te: row[6] != null ? Number(row[6]) : null,
          bb: row[7] != null ? Number(row[7]) : null,
          speed: row[8] != null ? Number(row[8]) : null,
          bak_celup: row[9] != null ? Math.round(Number(row[9])) : null,
          bak_sulfur: row[10] != null ? Math.round(Number(row[10])) : null,
          konst_idg: row[11] != null ? Number(row[11]) : null,
          konst_sulfur: row[12] != null ? Number(row[12]) : null,
          visc: row[13] != null ? Number(row[13]) : null,
        },
        update: {
          tgl: tgl,
          tanggal: tgl,
          mc: row[1] != null ? String(row[1]) : null,
          kode_full: row[3] != null ? String(row[3]) : null,
          te: row[6] != null ? Number(row[6]) : null,
          bb: row[7] != null ? Number(row[7]) : null,
          speed: row[8] != null ? Number(row[8]) : null,
          bak_celup: row[9] != null ? Math.round(Number(row[9])) : null,
          bak_sulfur: row[10] != null ? Math.round(Number(row[10])) : null,
          konst_idg: row[11] != null ? Number(row[11]) : null,
          konst_sulfur: row[12] != null ? Number(row[12]) : null,
          visc: row[13] != null ? Number(row[13]) : null,
        },
      });
      
      imported++;
      if (imported % 500 === 0) {
        console.log(`  Imported ${imported} indigo records...`);
      }
    } catch (err: any) {
      console.error(`  Error at row ${rowIdx + 1}: ${err.message}`);
    }
  }
  
  console.log(`  INDIGO import complete: ${imported} imported, ${skipped} skipped`);
}

async function importDatalog() {
  console.log('\n=== Importing DATALOG ===');
  
  const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
  const sheetName = workbook.SheetNames[4];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  console.log('Total rows:', data.length);
  
  let imported = 0;
  let skipped = 0;
  
  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (!row) continue;
    
    const kp = row[3];
    if (!kp || typeof kp !== 'string' || kp.trim() === '') {
      skipped++;
      continue;
    }
    
    const tgl = toDate(row[0]);
    if (!tgl) {
      skipped++;
      continue;
    }
    
    try {
      await prisma.weavingRecord.create({
        data: {
          kp: kp.trim(),
          tgl: tgl,
          tanggal: tgl,
          shift: row[1] != null ? `Shift ${row[1]}` : null,
          no_mesin: row[2] != null ? Math.round(Number(row[2])) : null,
          beam_no: row[6] != null ? Math.round(Number(row[6])) : null,
          kode_kain: row[7] != null ? String(row[7]) : null,
          efficiency: row[9] != null ? Number(row[9]) : null,
          meter_out: row[13] != null ? Number(row[13]) : null,
          keterangan: row[7] != null ? String(row[7]) : null,
        },
      });
      
      imported++;
      if (imported % 500 === 0) {
        console.log(`  Imported ${imported} weaving records...`);
      }
    } catch (err: any) {
      console.error(`  Error at row ${rowIdx + 1}: ${err.message}`);
    }
  }
  
  console.log(`  DATALOG import complete: ${imported} imported, ${skipped} skipped`);
}

async function main() {
  await importIndigo();
  await importDatalog();
  await prisma.$disconnect();
}

main().catch(console.error);
