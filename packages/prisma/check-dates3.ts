import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('=== Converting highest Excel serial numbers ===');
const highSerials = [46358, 46357, 46356, 46355, 46354];
for (const serial of highSerials) {
  // Standard Excel conversion
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  console.log(`Excel ${serial} -> ${date.toISOString().split('T')[0]}`);
}

console.log('\n=== Check rows with high serial numbers ===');
for (let i = 2; i < Math.min(data.length, 2000); i++) {
  const row = data[i];
  if (row && typeof row[0] === 'number' && row[0] > 46300) {
    const date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
    console.log(`Row ${i}: KP=${row[3]}, Excel=${row[0]}, Converted=${date.toISOString().split('T')[0]}`);
  }
}

// Let's also check what XLSX library returns
console.log('\n=== Using XLSX utility to parse dates ===');
for (let i = 2; i < 5; i++) {
  const cell = ws['A' + (i + 1)];
  console.log(`Cell A${i+1}:`, cell?.v, cell?.t);
}
