import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('=== Last 20 rows of SACON sheet (checking raw dates) ===');
const start = Math.max(2, data.length - 20);
for (let i = start; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  const kp = row[3];
  const raw = row[0];
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    console.log(`Row ${i+1}: KP=${kp} raw=${raw} -> ${d.toISOString().split('T')[0]}`);
  }
}

console.log('\n=== Rows with highest serial numbers ===');
let highRows: Array<{ idx: number; kp: any; serial: number }> = [];
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (row && typeof row[0] === 'number') {
    highRows.push({ idx: i+1, kp: row[3], serial: row[0] });
  }
}
highRows.sort((a, b) => b.serial - a.serial);
console.log('Top 10 highest:');
highRows.slice(0, 10).forEach(r => {
  const d = new Date(Math.round((r.serial - 25569) * 86400 * 1000));
  console.log(`Row ${r.idx}: KP=${r.kp} serial=${r.serial} -> ${d.toISOString().split('T')[0]}`);
});

// Also check what the max serial should be for Feb 28 2026
console.log('\n=== What serial should Feb 28 2026 be? ===');
const feb28_2026 = new Date(2026, 1, 28);
const serial = Math.round((feb28_2026.getTime() / 86400000) + 25569);
console.log('Feb 28, 2026 -> Excel serial:', serial);
