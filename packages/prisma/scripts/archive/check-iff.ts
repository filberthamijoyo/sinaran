const XLSX = require('xlsx');

const iffFile = '/Users/filberthamijoyo/Downloads/erp/Data INSPECT FINISH.xlsx';
const wb = XLSX.readFile(iffFile, { raw: false, cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];

console.log('=== InspectFinish Excel Sample Data ===');
console.log('Header (row 1):');
console.log('  A:', ws['A1']?.v); // TGL
console.log('  B:', ws['B1']?.v); // PT  
console.log('  C:', ws['C1']?.v); // (empty)
console.log('  D:', ws['D1']?.v); // T
console.log('  E:', ws['E1']?.v); // SN
console.log('  F:', ws['F1']?.v); // TGL POTONG
console.log('  G:', ws['G1']?.v); // SHIFT
console.log('  H:', ws['H1']?.v); // OPR

console.log('\nFirst 10 data rows:');
for (let r = 2; r <= 11; r++) {
  const tgl = ws['D' + r]?.v; // Column D has the serial date
  const tglStr = typeof tgl === 'number' 
    ? new Date((tgl - 25569) * 86400 * 1000).toISOString().split('T')[0] 
    : tgl;
  console.log('Row ' + r + ': TGL=' + tglStr + ' | SN=' + ws['E' + r]?.v + ' | SHIFT=' + ws['G' + r]?.v + ' | OPR=' + ws['H' + r]?.v + ' | KP=' + ws['J' + r]?.v);
}
