import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check WARPING sheet more specifically
const warpingSheet = workbook.Sheets[workbook.SheetNames[2]];
const warpingData = XLSX.utils.sheet_to_json(warpingSheet, { header: 1 }) as any[][];

// Check rows around where the first error occurs
console.log('=== Checking WARPING rows around error point ===');
for (let i = 1108; i < 1115; i++) {
  if (warpingData[i]) {
    console.log(`\nRow ${i}:`);
    console.log('  All values:', JSON.stringify(warpingData[i]));
    console.log('  col 0 (TGL):', warpingData[i][0], typeof warpingData[i][0]);
    console.log('  col 1 (START):', warpingData[i][1], typeof warpingData[i][1]);
    console.log('  col 2 (STOP):', warpingData[i][2], typeof warpingData[i][2]);
    console.log('  col 3 (KP):', warpingData[i][3], typeof warpingData[i][3]);
    console.log('  col 4 (KODE):', warpingData[i][4], typeof warpingData[i][4]);
  }
}
