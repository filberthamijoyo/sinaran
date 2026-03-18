import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

// Find the row with the HIGHEST date that's still <= Feb 28 2026 (serial 46081)
const feb28Serial = 46081;
console.log('Looking for rows with date <= Feb 28, 2026 (serial', feb28Serial, ')');

let found: Array<{ row: number; kp: any; serial: number; date: string }> = [];
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row || typeof row[0] !== 'number') continue;
  if (row[0] <= feb28Serial) {
    const d = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
    found.push({ row: i+1, kp: row[3], serial: row[0], date: d.toISOString().split('T')[0] });
  }
}

found.sort((a, b) => b.serial - a.serial);
console.log('\nHighest date <= Feb 28, 2026:');
found.slice(0, 10).forEach(r => console.log(`  Row ${r.row}: KP=${r.kp} serial=${r.serial} -> ${r.date}`));

console.log('\nLowest date in Excel (earliest):');
found.sort((a, b) => a.serial - b.serial);
found.slice(0, 5).forEach(r => console.log(`  Row ${r.row}: KP=${r.kp} serial=${r.serial} -> ${r.date}`));

console.log('\nTotal rows with date <= Feb 28, 2026:', found.length);
