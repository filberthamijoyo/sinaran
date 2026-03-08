import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check the "explained" sheet
const explainedSheet = workbook.Sheets[workbook.SheetNames[0]];
const explainedData = XLSX.utils.sheet_to_json(explainedSheet, { header: 1 }) as any[][];

console.log('=== EXPLAINED Sheet ===');
console.log('Total rows:', explainedData.length);

for (let i = 0; i < Math.min(20, explainedData.length); i++) {
  console.log(`\nRow ${i}:`, explainedData[i]);
}
