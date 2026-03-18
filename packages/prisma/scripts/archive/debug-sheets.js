const XLSX = require('xlsx');

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

const wb = XLSX.readFile(EXCEL_FILE, { cellDates: true });
const sheet = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows:', data.length);

// Check string dates in M/D/YYYY format
let stringDates = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && typeof row[1] === 'string' && row[1].includes('/')) {
    stringDates.push({ row: i, date: row[1] });
    if (stringDates.length <= 10) console.log(`Row ${i}: ${row[1]}`);
  }
}

console.log('\nTotal string dates:', stringDates.length);
