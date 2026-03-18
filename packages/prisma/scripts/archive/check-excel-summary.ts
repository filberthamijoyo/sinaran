import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('=== Summary ===');
console.log('Total data rows (excluding header):', data.length - 2);

// Count numeric dates vs string dates
let numericCount = 0;
let stringCount = 0;
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row || !row[0]) continue;
  if (typeof row[0] === 'number') numericCount++;
  else if (typeof row[0] === 'string') stringCount++;
}

console.log('Rows with numeric dates:', numericCount);
console.log('Rows with string dates:', stringCount);

// What dates do the numeric ones represent?
const numericDates: number[] = [];
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (row && typeof row[0] === 'number') numericDates.push(row[0]);
}
numericDates.sort((a, b) => a - b);

console.log('\nDate range from NUMERIC cells:');
const minD = new Date(Math.round((numericDates[0] - 25569) * 86400 * 1000));
const maxD = new Date(Math.round((numericDates[numericDates.length - 1] - 25569) * 86400 * 1000));
console.log('  Min:', numericDates[0], '->', minD.toISOString().split('T')[0]);
console.log('  Max:', numericDates[numericDates.length - 1], '->', maxD.toISOString().split('T')[0]);
