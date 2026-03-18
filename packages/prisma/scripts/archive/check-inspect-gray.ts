import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx', { raw: false, cellDates: false, type: 'string' });
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });

console.log('=== Headers (row 0) ===');
for (let c = 0; c < 30; c++) {
  console.log('Col ' + c + ':', data[0]?.[c]);
}

console.log('\n=== Sample data rows ===');
for (let r = 1; r <= 5; r++) {
  console.log('Row ' + r + ':', data[r]?.slice(0, 10));
}
