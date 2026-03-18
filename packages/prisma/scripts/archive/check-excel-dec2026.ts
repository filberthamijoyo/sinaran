import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

// Check rows AFTER row 1990 (the ones with December dates)
console.log('=== Checking rows around the December 2026 dates ===');
for (let i = 1985; i < Math.min(2000, data.length); i++) {
  const row = data[i];
  if (!row) {
    console.log(`Row ${i+1}: EMPTY`);
    continue;
  }
  const raw = row[0];
  const kp = row[3];
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    console.log(`Row ${i+1}: KP=${kp} raw=${raw} -> ${d.toISOString().split('T')[0]}`);
  } else if (typeof raw === 'string') {
    console.log(`Row ${i+1}: KP=${kp} raw=STRING "${raw}"`);
  } else {
    console.log(`Row ${i+1}: KP=${kp} raw=${raw} (type: ${typeof raw})`);
  }
}

console.log('\n=== Total rows in sheet:', data.length);
