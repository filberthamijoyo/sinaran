import * as XLSX from 'xlsx';

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

const wb = XLSX.readFile(EXCEL_FILE, { raw: false, cellDates: true });
const sheet = wb.Sheets['RAW'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, cellDates: true }) as any[][];

console.log('Total rows:', data.length);

// Sample first 20 rows to see date formats
console.log('\n=== Sample date values from column 1 (TG) ===');
for (let i = 1; i <= 20; i++) {
  const row = data[i];
  if (row && row[1] !== undefined) {
    console.log(`Row ${i}:`, row[1], '| type:', typeof row[1], '| instanceof Date:', row[1] instanceof Date);
  }
}

// Check date range
const dates: Date[] = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && row[1]) {
    let d: Date | null = null;
    if (row[1] instanceof Date) {
      d = row[1];
    } else if (typeof row[1] === 'string') {
      const parsed = new Date(row[1]);
      if (!isNaN(parsed.getTime())) d = parsed;
    } else if (typeof row[1] === 'number') {
      d = new Date((row[1] - 25569) * 86400 * 1000);
    }
    if (d && d.getFullYear() >= 2025) {
      dates.push(d);
    }
  }
}

if (dates.length > 0) {
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  console.log('\n=== Date Range (2025+) ===');
  console.log('Min date:', min.toISOString().split('T')[0]);
  console.log('Max date:', max.toISOString().split('T')[0]);
  console.log('Total dates >= 2025:', dates.length);
}
