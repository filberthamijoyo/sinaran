import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

function parseDateSerial(n: number): Date | null {
  const date = new Date((n - 25569) * 86400 * 1000);
  if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
  return date;
}

function parseDateMDY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
  if (y < 2000 || y > 2026) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (value.getFullYear() < 2000 || value.getFullYear() > 2026) return null;
    return value;
  }
  if (typeof value === 'number') {
    return parseDateSerial(value);
  }
  const str = String(value).trim();
  if (!str) return null;
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2026) return null;
  return parsed;
}

async function main() {
  console.log('=== Checking InspectGray Excel date range ===\n');
  
  // Read Excel file
  console.log(`Reading Excel file: ${EXCEL_FILE}`);
  const workbook = XLSX.readFile(EXCEL_FILE, { 
    raw: false, 
    cellDates: false,
    type: 'string'
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header at row 5 (index 4)
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
    header: 1,
    range: 4,
    defval: ''
  });
  
  console.log(`Total data rows (excluding header): ${data.length}`);
  
  // Analyze date range
  console.log('\n=== Date distribution (TG column) ===');
  
  const dateCounts: Record<string, number> = {};
  let validDates = 0;
  let nullDates = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const tgValue = parseDate(row[1]);
    if (tgValue) {
      validDates++;
      const key = tgValue.toISOString().split('T')[0];
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    } else {
      nullDates++;
    }
  }
  
  console.log(`Valid dates: ${validDates}`);
  console.log(`Null/invalid dates: ${nullDates}`);
  
  const sortedDates = Object.keys(dateCounts).sort();
  console.log(`\nDate range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
  console.log(`Total unique dates: ${sortedDates.length}`);
  
  // Show first 10 and last 10 dates
  console.log('\nFirst 10 dates:');
  sortedDates.slice(0, 10).forEach(d => console.log(`  ${d}: ${dateCounts[d]} rows`));
  console.log('\nLast 10 dates:');
  sortedDates.slice(-10).forEach(d => console.log(`  ${d}: ${dateCounts[d]} rows`));
  
  // Count rows in 2026-01-01 to 2026-02-25 range
  const MIN_DATE = new Date('2026-01-01');
  const MAX_DATE = new Date('2026-02-25');
  MAX_DATE.setHours(23, 59, 59, 999);
  
  let countInRange = 0;
  let countAfterFeb25 = 0;
  let countBeforeJan1 = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const tgValue = parseDate(row[1]);
    if (tgValue) {
      if (tgValue >= MIN_DATE && tgValue <= MAX_DATE) {
        countInRange++;
      } else if (tgValue > MAX_DATE) {
        countAfterFeb25++;
      } else if (tgValue < MIN_DATE) {
        countBeforeJan1++;
      }
    }
  }
  
  console.log('\n=== Breakdown by date range ===');
  console.log(`Rows with date in 2026-01-01 to 2026-02-25: ${countInRange}`);
  console.log(`Rows with date after 2026-02-25: ${countAfterFeb25}`);
  console.log(`Rows with date before 2026-01-01: ${countBeforeJan1}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });