const XLSX = require('xlsx');

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

const wb = XLSX.readFile(EXCEL_FILE, { cellDates: false, raw: true });
const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

function parseCell(ws, col, row) {
  const addr = XLSX.utils.encode_cell({ c: col, r: row });
  const cell = ws[addr];
  return cell ? cell.v : null;
}

function parseDate(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return null;
    return new Date(d.y, d.m - 1, d.d);
  }
  if (typeof val === 'string') {
    const m = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  }
  if (val instanceof Date) {
    return val;
  }
  return null;
}

const MIN_DATE = new Date('2025-01-01');
const MAX_DATE = new Date('2026-03-16');

const dates = [];
for (let r = 5; r <= range.e.r; r++) {
  const val = parseCell(ws, 1, r);
  const d = parseDate(val);
  if (d && d >= MIN_DATE && d <= MAX_DATE) {
    dates.push(d);
  }
}

console.log('Total rows in date range:', dates.length);

const months = {};
dates.forEach(d => {
  const key = d.toISOString().slice(0, 7);
  months[key] = (months[key] || 0) + 1;
});

console.log('\nMonth distribution (within range):');
Object.keys(months).sort().forEach(k => console.log(`${k}: ${months[k]}`));

console.log('\nTotal:', dates.length);
