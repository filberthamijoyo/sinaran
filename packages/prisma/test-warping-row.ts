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

async function testFirstRow() {
  console.log('Testing first WARPING row...');
  
  const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
  const sheetName = workbook.SheetNames[2];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  const row = data[1];
  console.log('Raw row:', JSON.stringify(row));
  
  const kp = String(row[3]).trim();
  const tgl = toDate(row[0]);
  
  console.log('KP:', kp);
  console.log('TGL:', tgl);
  console.log('TGL type:', typeof tgl);
  
  try {
    const result = await prisma.warpingRun.create({
      data: {
        kp: kp,
        tgl: tgl,
        kode_full: String(row[4]),
        benang: String(row[5]),
      }
    });
    console.log('Success:', result.id);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
  
  await prisma.$disconnect();
}

testFirstRow().catch(console.error);
