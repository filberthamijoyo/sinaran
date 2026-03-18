import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx', { cellDates: true });
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('=== Checking dates with cellDates: true ===');
console.log('Total rows:', data.length);

// Check first few rows
console.log('\nFirst data rows (2-6):');
for (let i = 2; i <= 6; i++) {
  const row = data[i];
  const raw = row[0];
  console.log(`Row ${i+1}: raw=${JSON.stringify(raw)} (type: ${typeof raw}), KP=${row[3]}`);
}

// Check the December 2026 KPs
console.log('\nRows with December 2026 dates:');
const decKPs = ['BSPB', 'BSBQ', 'BSBS', 'BUQD', 'BUQE'];
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  const kp = row[3];
  if (decKPs.includes(kp)) {
    const raw = row[0];
    console.log(`Row ${i+1}: KP=${kp}, raw=${JSON.stringify(raw)} (type: ${typeof raw})`);
  }
}

// Check rows with future dates
console.log('\n=== Checking for future dates (> Mar 5, 2026) ===');
let count = 0;
const cutoff = new Date('2026-03-05');
for (let i = 2; i < data.length; i++) {
  const row = data[i];
  const raw = row[0];
  if (raw instanceof Date && raw > cutoff) {
    count++;
    if (count <= 10) {
      console.log(`Row ${i+1}: KP=${row[3]}, date=${raw.toISOString().split('T')[0]}`);
    }
  }
}
console.log('Total rows with date > Mar 5, 2026:', count);
