import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/erp/Data INSPECT FINISH.xlsx', { 
  raw: false, 
  cellDates: false,
  type: 'string'
});
const ws = wb.Sheets['RAW'];
const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });

// Sample rows from late in the dataset (where March 2026 dates should be)
console.log('=== Sample rows from end of file (rows 182000-182847) ===');
for (let i = 182000; i < 182847 && i < data.length; i += 50) {
  const row = data[i];
  if (!row) continue;
  const tgl = row[0];
  const tglPotong = row[5];
  const p = row[9]; // KP
  if (tglPotong || tgl) {
    console.log(`Row ${i}: TGL=${tgl}, TGL_POTONG=${tglPotong}, P=${p}`);
  }
}

// Check what's in TGL column - show raw values
console.log('\n=== First 10 rows - raw values ===');
for (let i = 1; i <= 10; i++) {
  const row = data[i];
  console.log(`Row ${i}:`, { TGL: row[0], TGL_POTONG: row[5], P: row[9] });
}

// Find max TGL_POTONG that looks like a string date (not a serial)
console.log('\n=== Checking TGL_POTONG format ===');
let maxStringDate = null;
let maxStringDateRow = null;
for (let i = 1; i < data.length; i++) {
  const v = data[i]?.[5];
  if (v && typeof v === 'string' && v.includes('/')) {
    const date = new Date(v);
    if (!isNaN(date.getTime())) {
      if (!maxStringDate || date > maxStringDate) {
        maxStringDate = date;
        maxStringDateRow = i;
      }
    }
  }
}
console.log('Max string date in TGL_POTONG:', maxStringDate, 'at row', maxStringDateRow);
