import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check WARPING sheet - look for rows with different column counts
const warpingSheet = workbook.Sheets[workbook.SheetNames[2]];
const warpingData = XLSX.utils.sheet_to_json(warpingSheet, { header: 1 }) as any[][];

console.log('=== Checking WARPING sheet for issues ===');
console.log('Total rows:', warpingData.length);

// Check first 10 rows
for (let i = 1; i < 10; i++) {
  console.log(`Row ${i}: columns = ${warpingData[i]?.length || 0}, KP = ${warpingData[i]?.[3]}`);
}

// Check around where errors start (row 1100+)
console.log('\n=== Around row 1100 ===');
for (let i = 1098; i < 1105; i++) {
  if (warpingData[i]) {
    console.log(`Row ${i}: columns = ${warpingData[i].length}, KP = ${warpingData[i][3]}, data = ${JSON.stringify(warpingData[i].slice(0, 5))}`);
  }
}

// Check max columns
let maxCols = 0;
for (let i = 1; i < Math.min(2000, warpingData.length); i++) {
  if (warpingData[i] && warpingData[i].length > maxCols) {
    maxCols = warpingData[i].length;
  }
}
console.log('\nMax columns in first 2000 rows:', maxCols);
