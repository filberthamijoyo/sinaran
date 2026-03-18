import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check exact row contents
const saconSheet = workbook.Sheets[workbook.SheetNames[1]];
const saconData = XLSX.utils.sheet_to_json(saconSheet, { header: 1 }) as any[][];

console.log('=== SACON Sheet Structure ===');
console.log('Total rows:', saconData.length);
console.log('\nRow 0 (index 0):');
console.log(saconData[0]);

console.log('\nRow 1 (index 1) - SHOULD BE HEADERS:');
console.log(saconData[1]);

console.log('\nRow 2 (index 2) - First data row:');
console.log(saconData[2]);

console.log('\nRow 3 (index 3):');
console.log(saconData[3]);

// Check header mapping
console.log('\n=== Header mapping ===');
const headers = saconData[1];
headers.forEach((h, i) => {
  console.log(`col ${i}: ${h}`);
});
