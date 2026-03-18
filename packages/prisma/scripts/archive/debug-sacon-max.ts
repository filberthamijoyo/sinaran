import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]]; // SACON sheet
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

let maxVal = -Infinity;
let rows: Array<{ idx: number; raw: any; kp: any }> = [];

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  const raw = row[0];
  const kp = row[3];
  if (typeof raw === 'number') {
    if (raw > maxVal) {
      maxVal = raw;
      rows = [{ idx: i, raw, kp }];
    } else if (raw === maxVal) {
      rows.push({ idx: i, raw, kp });
    }
  } else if (typeof raw === 'string') {
    // keep string dates for later but not used in max
  }
}

console.log('Max numeric raw date (Excel serial):', maxVal);
console.log('Rows with max serial:');
for (const r of rows.slice(0, 20)) {
  const d = new Date(Math.round((r.raw - 25569) * 86400 * 1000));
  console.log(`Row ${r.idx}: raw=${r.raw} KP=${r.kp} -> ${d.toISOString()}`);
}

console.log('\nAlso showing top 10 highest numeric serials:');
const numericRows: Array<{ idx: number; raw: number; kp: any }> = [];
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (row && typeof row[0] === 'number') numericRows.push({ idx: i, raw: row[0], kp: row[3] });
}
numericRows.sort((a, b) => b.raw - a.raw);
for (const r of numericRows.slice(0, 10)) {
  const d = new Date(Math.round((r.raw - 25569) * 86400 * 1000));
  console.log(`Row ${r.idx}: raw=${r.raw} KP=${r.kp} -> ${d.toISOString()}`);
}
