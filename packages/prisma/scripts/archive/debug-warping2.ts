import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function debugWarping() {
  console.log('=== Debugging WARPING Import ===');
  
  const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
  const sheetName = workbook.SheetNames[2];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  console.log('Total rows:', data.length);
  
  // Test with first data row
  const row = data[1];
  console.log('\nFirst data row:');
  console.log('col 0 (TGL):', row[0], typeof row[0]);
  console.log('col 1 (START):', row[1], typeof row[1]);
  console.log('col 2 (STOP):', row[2], typeof row[2]);
  console.log('col 3 (KP):', row[3], typeof row[3]);
  console.log('col 4 (KODE):', row[4], typeof row[4]);
  console.log('col 5 (BENANG):', row[5], typeof row[5]);
  console.log('col 6 (LOT):', row[6], typeof row[6]);
  console.log('col 7 (SP):', row[7], typeof row[7]);
  console.log('col 8 (PT):', row[8], typeof row[8]);
  console.log('col 9 (TE):', row[9], typeof row[9]);
  console.log('col 10 (RPM):', row[10], typeof row[10]);
  console.log('col 27 (TOTAL PUTUSAN):', row[27], typeof row[27]);
  console.log('col 44 (TOTAL BEAM):', row[44], typeof row[44]);
  console.log('col 48 (EFF WARPING):', row[48], typeof row[48]);
  console.log('col 49 (NO MC):', row[49], typeof row[49]);
  
  // Try to insert just this one row
  console.log('\nTrying to insert first warping row...');
  
  try {
    const kp = String(row[3]).trim();
    const tgl = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
    
    const result = await prisma.warpingRun.create({
      data: {
        kp: kp,
        tgl: tgl,
        kode_full: row[4] ? String(row[4]) : null,
        benang: row[5] ? String(row[5]) : null,
        lot: row[6] ? String(row[6]) : null,
        sp: row[7] ? String(row[7]) : null,
        pt: row[8] ? Math.round(Number(row[8])) : null,
      }
    });
    console.log('Success! Created:', result.id);
  } catch (err: any) {
    console.error('Error:', err.message);
    console.error('Full error:', err);
  }
  
  await prisma.$disconnect();
}

debugWarping().catch(console.error);
