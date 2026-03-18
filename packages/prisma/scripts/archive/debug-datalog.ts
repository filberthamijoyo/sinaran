import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check DATALOG sheet more carefully
const datalogSheet = workbook.Sheets[workbook.SheetNames[4]];
const datalogData = XLSX.utils.sheet_to_json(datalogSheet, { header: 1 }) as any[][];

console.log('=== DATALOG Sheet ===');
console.log('Total rows:', datalogData.length);

console.log('\nRow 0:', datalogData[0]?.slice(0, 10));
console.log('Row 1:', datalogData[1]?.slice(0, 10));
console.log('Row 2:', datalogData[2]?.slice(0, 10));
console.log('Row 3:', datalogData[3]?.slice(0, 10));

// Try to find where real data starts
for (let i = 0; i < Math.min(30, datalogData.length); i++) {
  const row = datalogData[i];
  if (row && row[3] && typeof row[3] === 'string' && row[3].trim().length > 0) {
    console.log('\nFirst data row found at index', i);
    console.log('Full row:', row.slice(0, 15));
    break;
  }
}
