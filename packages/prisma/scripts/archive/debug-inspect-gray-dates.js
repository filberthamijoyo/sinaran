const XLSX = require('xlsx');

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

// Try with cellDates: true
const wb = XLSX.readFile(EXCEL_FILE, { cellDates: true });
const sheet = wb.Sheets['Sheet1'];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', data.length);

console.log('\n=== Sample data rows with cellDates: true ===');
for (let i = 1; i <= 10; i++) {
  const row = data[i];
  if (row && row[1] !== undefined) {
    console.log(`Row ${i}, col 1:`, row[1], '| type:', typeof row[1], '| instanceof Date:', row[1] instanceof Date);
  }
}

// Count valid dates
let validCount = 0;
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && row[1]) {
    let d = null;
    const val = row[1];
    if (val instanceof Date) {
      d = val;
    } else if (typeof val === 'number') {
      d = new Date((val - 25569) * 86400 * 1000);
    } else if (typeof val === 'string') {
      d = new Date(val);
    }
    if (d && !isNaN(d.getTime()) && d.getFullYear() >= 2025) {
      validCount++;
    }
  }
}
console.log('\n=== Valid dates (2025+):', validCount, '===');
