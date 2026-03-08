import * as XLSX from 'xlsx';
import * as fs from 'fs';

const buffer = fs.readFileSync(
  '/Users/filberthamijoyo/Downloads/erp/csv/Warping.csv'
);
const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

console.log('Total rows:', rows.length);
console.log('\nAll column headers:');
console.log(Object.keys(rows[0]));
console.log('\nFirst row values:');
console.log(rows[0]);
console.log('\nSecond row values:');
console.log(rows[1]);
