import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');

// Check more rows of SACON sheet
const saconSheet = workbook.Sheets[workbook.SheetNames[1]]; // SACON is index 1
const saconData = XLSX.utils.sheet_to_json(saconSheet, { header: 1 }) as any[][];
console.log('=== SACON Sheet (more details) ===');
console.log('Total rows:', saconData.length);
console.log('Row 0:', saconData[0]);
console.log('Row 1:', saconData[1]);
console.log('Row 2:', saconData[2]);
console.log('Row 3:', saconData[3]);
console.log('Row 4:', saconData[4]);
console.log('Row 5:', saconData[5]);

// Check actual data rows in SACON
console.log('\n=== Looking for real data in SACON ===');
for (let i = 0; i < Math.min(20, saconData.length); i++) {
  const row = saconData[i];
  if (row && row.length > 0 && row[0]) {
    console.log(`Row ${i}:`, row.slice(0, 5));
  }
}

// Check first few WARPING data rows
const warpingSheet = workbook.Sheets[workbook.SheetNames[2]];
const warpingData = XLSX.utils.sheet_to_json(warpingSheet, { header: 1 }) as any[][];
console.log('\n=== WARPING Sheet ===');
console.log('Total rows:', warpingData.length);
console.log('Row 0 (index 0):', warpingData[0]?.slice(0, 5));
console.log('Row 1 (index 1):', warpingData[1]?.slice(0, 5));
console.log('Row 2 (index 2):', warpingData[2]?.slice(0, 5));
console.log('Row 3 (index 3):', warpingData[3]?.slice(0, 5));

// Check INDIGO
const indigoSheet = workbook.Sheets[workbook.SheetNames[3]];
const indigoData = XLSX.utils.sheet_to_json(indigoSheet, { header: 1 }) as any[][];
console.log('\n=== INDIGO Sheet ===');
console.log('Total rows:', indigoData.length);
console.log('Row 0 (index 0):', indigoData[0]?.slice(0, 5));
console.log('Row 1 (index 1):', indigoData[1]?.slice(0, 5));
console.log('Row 2 (index 2):', indigoData[2]?.slice(0, 5));

// Check DATALOG more carefully
const datalogSheet = workbook.Sheets[workbook.SheetNames[4]];
const datalogData = XLSX.utils.sheet_to_json(datalogSheet, { header: 1 }) as any[][];
console.log('\n=== DATALOG Sheet ===');
console.log('Total rows:', datalogData.length);
console.log('Row 0 (index 0):', datalogData[0]?.slice(0, 10));
console.log('Row 1 (index 1):', datalogData[1]?.slice(0, 10));
console.log('Row 2 (index 2):', datalogData[2]?.slice(0, 10));
console.log('Row 3 (index 3):', datalogData[3]?.slice(0, 10));
console.log('Row 4 (index 4):', datalogData[4]?.slice(0, 10));
