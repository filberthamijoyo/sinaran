import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
console.log('Sheet names:', workbook.SheetNames);

// Check SACON sheet
const saconSheet = workbook.Sheets[workbook.SheetNames[0]];
const saconData = XLSX.utils.sheet_to_json(saconSheet, { header: 1 }) as any[][];
console.log('\n=== SACON Sheet ===');
console.log('Total rows:', saconData.length);
console.log('Row 0 (index 0):', saconData[0]);
console.log('Row 1 (index 1):', saconData[1]);
console.log('Row 2 (index 2):', saconData[2]);

// Check WARPING sheet
const warpingSheet = workbook.Sheets[workbook.SheetNames[1]];
const warpingData = XLSX.utils.sheet_to_json(warpingSheet, { header: 1 }) as any[][];
console.log('\n=== WARPING Sheet ===');
console.log('Total rows:', warpingData.length);
console.log('Row 0 (index 0):', warpingData[0]);
console.log('Row 1 (index 1):', warpingData[1]);

// Check INDIGO sheet
const indigoSheet = workbook.Sheets[workbook.SheetNames[2]];
const indigoData = XLSX.utils.sheet_to_json(indigoSheet, { header: 1 }) as any[][];
console.log('\n=== INDIGO Sheet ===');
console.log('Total rows:', indigoData.length);
console.log('Row 0 (index 0):', indigoData[0]);
console.log('Row 1 (index 1):', indigoData[1]);
console.log('Row 2 (index 2):', indigoData[2]);

// Check DATALOG sheet
const datalogSheet = workbook.Sheets[workbook.SheetNames[3]];
const datalogData = XLSX.utils.sheet_to_json(datalogSheet, { header: 1 }) as any[][];
console.log('\n=== DATALOG Sheet ===');
console.log('Total rows:', datalogData.length);
console.log('Row 0 (index 0):', datalogData[0]);
console.log('Row 1 (index 1):', datalogData[1]);
