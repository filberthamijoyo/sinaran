import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

// Count number of rows with dates > Feb 28 2026 (serial > 46081)
const feb28Serial = 46081;
let count = 0;
const highDates: Array<{row: number, kp: any, serial: number}> = [];

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row || typeof row[0] !== 'number') continue;
  if (row[0] > feb28Serial) {
    count++;
    highDates.push({ row: i+1, kp: row[3], serial: row[0] });
    if (highDates.length <= 10) {
      const d = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
      console.log(`Row ${i+1}: KP=${row[3]} serial=${row[0]} -> ${d.toISOString().split('T')[0]}`);
    }
  }
}

console.log('\nTotal rows with date > Feb 28, 2026:', count);
