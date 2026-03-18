import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

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

async function testMultipleRows() {
  console.log('Testing multiple WARPING rows...');
  
  const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
  const sheetName = workbook.SheetNames[2];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  let success = 0;
  let errors = 0;
  
  for (let i = 1; i <= 100; i++) {
    const row = data[i];
    if (!row) continue;
    
    const kp = row[3];
    if (!kp || typeof kp !== 'string') continue;
    
    try {
      await prisma.warpingRun.upsert({
        where: { kp: kp.trim() },
        create: {
          kp: kp.trim(),
          tgl: toDate(row[0]),
          kode_full: row[4] ? String(row[4]) : null,
          benang: row[5] ? String(row[5]) : null,
        },
        update: {
          tgl: toDate(row[0]),
          kode_full: row[4] ? String(row[4]) : null,
          benang: row[5] ? String(row[5]) : null,
        },
      });
      success++;
    } catch (err: any) {
      errors++;
      if (errors <= 3) {
        console.error(`Error at row ${i}: ${err.message}`);
      }
    }
  }
  
  console.log(`Success: ${success}, Errors: ${errors}`);
  await prisma.$disconnect();
}

testMultipleRows().catch(console.error);
