import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];

console.log('Checking raw cell A1992:');
const cell = ws['A1992'];
console.log('  Cell value:', cell?.v);
console.log('  Cell type:', cell?.t);
console.log('  Cell w (formatted):', cell?.w);

console.log('\nChecking raw cell A1996:');
const cell2 = ws['A1996'];
console.log('  Cell value:', cell2?.v);
console.log('  Cell type:', cell2?.t);
console.log('  Cell w (formatted):', cell2?.w);

// Also check some numeric cells
console.log('\nChecking raw cell A1831 (serial 46082):');
const cell3 = ws['A1831'];
console.log('  Cell value:', cell3?.v);
console.log('  Cell type:', cell3?.t);
console.log('  Cell w (formatted):', cell3?.w);
