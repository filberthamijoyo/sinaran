import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]]; // SACON sheet
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('SACON total rows:', data.length);

// Find rows with the latest dates (last 10 rows in the sheet)
const lastRows = data.slice(-10);
lastRows.forEach((row, i) => {
  const idx = data.length - 10 + i;
  const raw = row?.[0];
  const kp = row?.[3];
  console.log(`Row ${idx}: raw date = ${raw}, type = ${typeof raw}, KP = ${kp}`);
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    console.log(`  -> Converted (25569): ${d.toISOString()}`);
  }
});

// Also check first rows
console.log('\nFirst data rows (2-5):');
data.slice(2, 6).forEach((row, i) => {
  const idx = 2 + i;
  const raw = row?.[0];
  const kp = row?.[3];
  console.log(`Row ${idx}: raw = ${raw}, type = ${typeof raw}, KP = ${kp}`);
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    console.log(`  -> Converted (25569): ${d.toISOString()}`);
  }
});
