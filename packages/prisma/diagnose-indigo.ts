import * as XLSX from 'xlsx';
import * as fs from 'fs';

const buffer = fs.readFileSync(
  '/Users/filberthamijoyo/Downloads/erp/csv/Indigo.csv'
);
const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false }); // WITHOUT cellDates
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Use array mode to see raw rows WITHOUT date conversion
const raw: any[][] = XLSX.utils.sheet_to_json(worksheet, {
  defval: null,
  header: 1,
}) as any[][];

console.log('First 5 data rows (without cellDates):');
for (let i = 2; i < 7; i++) {
  console.log(`\nRow ${i}:`);
  const rowArr = raw[i] as any[];
  console.log('  Col 0 (TANGGAL):', rowArr[0], typeof rowArr[0]);
  console.log('  Col 1 (MC):', rowArr[1], typeof rowArr[1]);
  console.log('  Col 2 (KP):', rowArr[2], typeof rowArr[2]);
}
