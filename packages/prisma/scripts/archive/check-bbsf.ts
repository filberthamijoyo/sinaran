const XLSX = require('xlsx');

const bbsfFile = '/Users/filberthamijoyo/Downloads/erp/DATA BBSF.xlsx';
const wb = XLSX.readFile(bbsfFile, { raw: false, cellDates: false, type: 'string' });

const sheets = wb.SheetNames;
console.log('=== All Sheets in DATA BBSF.xlsx ===\n');
console.log('Sheets:', sheets.join(', '));

sheets.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  console.log(`\n========== ${sheetName} ==========`);
  
  // Find header row (row with TGL)
  let headerRow = 1;
  for (let r = 1; r <= 10; r++) {
    if (ws['A' + r]?.v === 'TGL') {
      headerRow = r;
      break;
    }
  }
  
  console.log('Header row:', headerRow);
  
  // Get all columns with values in header row
  const cols = [];
  for (let col = 'A'.charCodeAt(0); col <= 'ZZ'.charCodeAt(0); col++) {
    const colStr = col <= 'Z'.charCodeAt(0) 
      ? String.fromCharCode(col) 
      : 'A' + String.fromCharCode(col - 26);
    const val = ws[colStr + headerRow]?.v;
    if (val !== undefined && val !== null && val !== '') {
      cols.push({ col: colStr, name: val });
    } else if (!val && cols.length > 5) {
      // Assume we've passed the last column
      break;
    }
  }
  
  console.log('Columns (' + cols.length + '):');
  cols.forEach(c => console.log('  ' + c.col + ': ' + c.name));
  
  // Show sample data row
  const dataRow = headerRow + 1;
  console.log('\nSample row ' + dataRow + ':');
  cols.slice(0, 10).forEach(c => {
    const v = ws[c.col + dataRow]?.v;
    console.log('  ' + c.col + ' (' + c.name + '): ' + (v || '').toString().slice(0, 30));
  });
});
