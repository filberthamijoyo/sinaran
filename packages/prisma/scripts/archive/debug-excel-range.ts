import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const INSPECT_FINISH_FILE = '/Users/filberthamijoyo/Downloads/erp/Data INSPECT FINISH.xlsx';

const COL_INDICES = {
  TGL: 3,
  P: 9, // KP
};

const MONTH_MAP: Record<string, number> = {
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
};

function parseSerialDate(n: number): Date | null {
  const date = new Date((n - 25569) * 86400 * 1000);
  if (date.getFullYear() < 2000 || date.getFullYear() > 2026) return null;
  return date;
}

function parseDateMonYY(str: string): Date | null {
  const trimmed = str.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})-([a-z]+)-(\d{2})$/);
  if (!match) return null;
  
  const d = parseInt(match[1], 10);
  const monthName = match[2];
  const m = MONTH_MAP[monthName];
  let y = parseInt(match[3], 10);
  
  if (!m || isNaN(d) || isNaN(y)) return null;
  
  y = 2000 + y;
  if (y < 2000 || y > 2026) return null;
  
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
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

function parseDateDMY(str: string): Date | null {
  const parts = str.trim().split(/[/-]/);
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  let y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (y < 100) y += y < 50 ? 2000 : 1900;
  if (y < 2000 || y > 2026) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function parseTglDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (value.getFullYear() < 2000 || value.getFullYear() > 2026) return null;
    return value;
  }
  if (typeof value === 'number') {
    return parseSerialDate(value);
  }
  const str = String(value).trim();
  if (!str) return null;
  
  const monYY = parseDateMonYY(str);
  if (monYY) return monYY;
  
  const mdy = parseDateMDY(str);
  if (mdy) return mdy;
  
  const dmy = parseDateDMY(str);
  if (dmy) return dmy;
  
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2026) return null;
  return parsed;
}

function parseString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

async function main() {
  console.log('=== Checking actual data range in Excel ===\n');
  
  // Read Excel file
  console.log(`Reading Excel file: ${INSPECT_FINISH_FILE}`);
  const workbook = XLSX.readFile(INSPECT_FINISH_FILE, { 
    raw: false, 
    cellDates: true,
    type: 'string'
  });
  
  const worksheet = workbook.Sheets['RAW'];
  
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
    header: 1,
    defval: ''
  });
  
  console.log(`Total rows including header: ${data.length}`);
  
  // Check first few rows to see structure
  console.log('\n=== First 10 rows (showing TGL and KP) ===');
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    const tgl = row[COL_INDICES.TGL];
    const kp = row[COL_INDICES.P];
    console.log(`Row ${i}: TGL=${tgl}, KP=${kp}`);
  }
  
  // Check rows 5-10 (0-indexed) which would be rows 6-11 in Excel
  console.log('\n=== Rows 5-15 (Excel rows 6-16) - checking TGL and KP ===');
  for (let i = 5; i < Math.min(16, data.length); i++) {
    const row = data[i];
    const tgl = row[COL_INDICES.TGL];
    const kp = row[COL_INDICES.P];
    console.log(`Excel Row ${i+1}: TGL=${tgl}, KP=${kp}`);
  }
  
  // Count total non-empty rows with valid KP and date in 2026 range
  console.log('\n=== Analyzing data range ===');
  
  const MIN_DATE = new Date('2026-01-01');
  const MAX_DATE = new Date('2026-02-25');
  
  let rowsWithData = 0;
  let rowsWithKP = 0;
  let rowsIn2026Range = 0;
  
  // Sample some rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    rowsWithData++;
    
    const kp = parseString(row[COL_INDICES.P]);
    if (kp) rowsWithKP++;
    
    const tgl = parseTglDate(row[COL_INDICES.TGL]);
    if (tgl && tgl >= MIN_DATE && tgl <= MAX_DATE) {
      rowsIn2026Range++;
    }
  }
  
  console.log(`Rows with any data: ${rowsWithData}`);
  console.log(`Rows with KP: ${rowsWithKP}`);
  console.log(`Rows in 2026-01-01 to 2026-02-25 range: ${rowsIn2026Range}`);
  
  // Check how many unique dates
  console.log('\n=== Date distribution ===');
  const dateCounts: Record<string, number> = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const tgl = parseTglDate(row[COL_INDICES.TGL]);
    if (tgl) {
      const key = tgl.toISOString().split('T')[0];
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    }
  }
  
  const sortedDates = Object.keys(dateCounts).sort();
  console.log(`Date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
  console.log(`Total unique dates: ${sortedDates.length}`);
  
  // Show first 10 and last 10 dates
  console.log('\nFirst 10 dates:');
  sortedDates.slice(0, 10).forEach(d => console.log(`  ${d}: ${dateCounts[d]} rows`));
  console.log('\nLast 10 dates:');
  sortedDates.slice(-10).forEach(d => console.log(`  ${d}: ${dateCounts[d]} rows`));
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });