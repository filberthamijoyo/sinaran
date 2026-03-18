import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/erp/Data INSPECT FINISH.xlsx', { 
  raw: false, 
  cellDates: false,
  type: 'string'
});
const ws = wb.Sheets['RAW'];
const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });

// Count rows with each date range
let count46084 = 0; // March 3
let count46085 = 0; // March 4
let count46086 = 0; // March 5
let count46087 = 0; // March 6
let count46088plus = 0;
let maxSerialFound = 0;

for (let i = 1; i < data.length; i++) {
  const v = data[i]?.[5]; // TGL_POTONG column
  if (!v) continue;
  
  const num = parseInt(v, 10);
  if (isNaN(num)) continue;
  
  if (num > maxSerialFound) maxSerialFound = num;
  
  if (num === 46084) count46084++;
  else if (num === 46085) count46085++;
  else if (num === 46086) count46086++;
  else if (num === 46087) count46087++;
  else if (num >= 46088) count46088plus++;
}

console.log('=== TGL_POTONG date distribution (Excel serials) ===');
console.log('Serial 46084 (Mar 3):', count46084);
console.log('Serial 46085 (Mar 4):', count46085);
console.log('Serial 46086 (Mar 5):', count46086);
console.log('Serial 46087 (Mar 6):', count46087);
console.log('Serial >= 46088:', count46088plus);
console.log('Max serial found:', maxSerialFound);

// Now convert maxSerialFound to date
function excelSerialToDate(serial) {
  return new Date((serial - 25569) * 86400 * 1000);
}
console.log('Max serial date:', excelSerialToDate(maxSerialFound).toISOString());

// Sample rows with March 4-6 dates
console.log('\n=== Sample rows with March 4-6 ===');
let count = 0;
for (let i = 1; i < data.length && count < 10; i++) {
  const v = data[i]?.[5];
  const num = parseInt(v, 10);
  if (num >= 46085 && num <= 46087) {
    console.log(`Row ${i}: TGL_POTONG=${num} (${excelSerialToDate(num).toISOString().split('T')[0]}), KP=${data[i][9]}`);
    count++;
  }
}
