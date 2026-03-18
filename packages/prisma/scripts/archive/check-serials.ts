const XLSX = require('xlsx');

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

const workbookRaw = XLSX.readFile(EXCEL_FILE, { raw: false, cellDates: false, type: 'string' });
const worksheet = workbookRaw.Sheets[workbookRaw.SheetNames[0]];

const serials = new Set<number>();
for (let r = 5; r <= 6300; r++) {
  const v = worksheet['B' + r]?.v;
  const num = Number(v);
  if (v && !isNaN(num)) serials.add(num);
}

console.log('All unique serial numbers (sorted):');
const sorted = [...serials].sort((a, b) => a - b);
sorted.forEach((s: number) => {
  const d = new Date((s - 25569) * 86400 * 1000);
  console.log('  ' + s + ' -> ' + d.toISOString().split('T')[0]);
});
