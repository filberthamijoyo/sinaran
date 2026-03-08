import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('=== Find minimum Excel serial number ===');
let minSerial = Infinity;
let minRow = -1;
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (row && typeof row[0] === 'number' && row[0] < minSerial) {
    minSerial = row[0];
    minRow = i;
  }
}
console.log('Minimum Excel serial:', minSerial, 'at row', minRow);
if (minSerial !== Infinity) {
  const date = new Date(Math.round((minSerial - 25569) * 86400 * 1000));
  console.log('Converted date:', date.toISOString().split('T')[0]);
}

// Check first 50 rows for date patterns
console.log('\n=== First 50 rows dates ===');
for (let i = 2; i < Math.min(52, data.length); i++) {
  const row = data[i];
  if (row) {
    const dateVal = row[0];
    let dateStr = 'N/A';
    if (typeof dateVal === 'number') {
      dateStr = new Date(Math.round((dateVal - 25569) * 86400 * 1000)).toISOString().split('T')[0];
    } else if (typeof dateVal === 'string') {
      dateStr = 'string: ' + dateVal;
    }
    console.log(`Row ${i}: KP=${row[3]}, Date=${dateStr}`);
  }
}
