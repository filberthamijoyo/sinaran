import * as XLSX from 'xlsx';

const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]]; // SACON
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

// KPs with wrong dates
const wrongKPs = new Set([
  'BUQD', 'BUQE', 'BSPB', 'BSBQ', 'BSBS', 'BTBN', 'BTBP', 'BTBL', 'BTBE', 'BTBB', 'BTBJ',
  'BTBD', 'BTBS', 'BTBQ', 'BTPJ', 'BTPE', 'BTBT', 'BSPT', 'BSPQ', 'BSPD', 'BSPE', 'BSPL',
  'BSPN', 'BSPJ', 'BSPP', 'BSPS', 'BTPB', 'BTPP', 'BSJB', 'BSJP', 'BSJN', 'BSJJ', 'BTPN',
  'BTPD', 'BTPS', 'BTPT', 'BSJE', 'BSJD', 'BSJS', 'BSJQ', 'BSNB', 'BSNP', 'BSJT', 'BSJL',
  'BTJB', 'BTPQ', 'BSNT', 'BSNN', 'BSNL', 'BSNE', 'BSND', 'BSNJ', 'BTJL', 'BTJN', 'BTJS',
  'BTJJ', 'BTJP', 'BTJE', 'BSLB', 'BSLJ', 'BSNS', 'BSNQ', 'BSLN', 'BSLP', 'BSLL', 'BTJQ',
  'BTJT', 'BTJD'
]);

console.log('=== Raw Excel values for wrong-date KPs ===\n');

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row?.[3]) continue;
  const kp = String(row[3]).trim();
  if (wrongKPs.has(kp)) {
    const raw = row[0];
    const type = typeof raw;
    let converted = null;
    
    if (type === 'number') {
      converted = new Date(Math.round((raw - 25569) * 86400 * 1000)).toISOString();
    } else if (raw instanceof Date) {
      converted = raw.toISOString();
    } else if (type === 'string') {
      converted = `string: "${raw}"`;
    }
    
    console.log(`KP: ${kp} | raw: ${JSON.stringify(raw)} | type: ${type} | converted: ${converted}`);
  }
}
