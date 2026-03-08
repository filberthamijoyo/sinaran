import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check WARPING sheet
const warpingSheet = workbook.Sheets[workbook.SheetNames[2]];
const warpingData = XLSX.utils.sheet_to_json(warpingSheet, { header: 1 }) as any[][];

console.log('=== WARPING Sheet Structure ===');
console.log('Total rows:', warpingData.length);

// Print headers
console.log('\n=== Headers (Row 0) ===');
const headers = warpingData[0];
headers?.forEach((h, i) => console.log(`col ${i}: ${h}`));

// Print first data row
console.log('\n=== First data row (Row 1) ===');
const firstRow = warpingData[1];
firstRow?.forEach((v, i) => console.log(`col ${i}: ${typeof v} = ${JSON.stringify(v)}`));
