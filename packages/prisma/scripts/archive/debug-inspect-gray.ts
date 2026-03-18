import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  const EXCEL_FILE = '/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx';

  // Check Excel file
  const workbook = XLSX.readFile(EXCEL_FILE, { raw: false, cellDates: false, type: 'string' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, range: 4, defval: '' });

  console.log('=== Debug InspectGray ===');
  console.log('Data rows:', data.length);

  const MIN_DATE = new Date('2025-01-01');

  let skippedEmpty = 0;
  let skippedNoKpMatch = 0;
  let skippedPre2025 = 0;
  let skippedFuture = 0;
  let wouldImport = 0;

  // Load valid KPs
  const validKPs = new Set(
    await prisma.salesContract.findMany({
      select: { kp: true }
    }).then(records => records.map(r => r.kp))
  );
  console.log('Valid KPs:', validKPs.size);

  // Parse date
  function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      return new Date((value - 25569) * 86400 * 1000);
    }
    return null;
  }

  function parseString(value: any): string | null {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    return str || null;
  }

  // Count
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (!row || row.length === 0) {
      skippedEmpty++;
      continue;
    }

    const kpValue = parseString(row[2]);
    if (!kpValue) {
      skippedEmpty++;
      continue;
    }

    if (!validKPs.has(kpValue)) {
      skippedNoKpMatch++;
      continue;
    }

    const tgValue = parseDate(row[1]);

    if (!tgValue) {
      skippedEmpty++;
      continue;
    }

    if (tgValue < MIN_DATE) {
      skippedPre2025++;
      continue;
    }

    wouldImport++;
  }

  console.log('\n=== Results ===');
  console.log('Would import:', wouldImport);
  console.log('Skipped empty:', skippedEmpty);
  console.log('Skipped no KP match:', skippedNoKpMatch);
  console.log('Skipped pre-2025:', skippedPre2025);
  console.log('Skipped future:', skippedFuture);

  const sum = skippedEmpty + skippedNoKpMatch + skippedPre2025 + skippedFuture + wouldImport;
  console.log('Sum:', sum);
  console.log('Data length:', data.length);

  await prisma.$disconnect();
}

main().catch(console.error);
