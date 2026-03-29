import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

type StageDef = {
  key: string;
  label: string;
  abbrev: string;
  acc: boolean;
};

const STAGES: StageDef[] = [
  { key: 'PENDING_APPROVAL', label: 'Pending Approval', abbrev: 'PA', acc: false },
  { key: 'WARPING',          label: 'Warping',          abbrev: 'WP', acc: true  },
  { key: 'INDIGO',           label: 'Indigo',           abbrev: 'ID', acc: true  },
  { key: 'WEAVING',          label: 'Weaving',          abbrev: 'WV', acc: true  },
  { key: 'INSPECT_GRAY',     label: 'Inspect Gray',     abbrev: 'IG', acc: true  },
  { key: 'BBSF',             label: 'BBSF',             abbrev: 'BB', acc: true  },
  { key: 'INSPECT_FINISH',   label: 'Inspect Finish',   abbrev: 'IF', acc: true  },
];

async function upsertContract(
  kp: string,
  stage: StageDef,
  created: number,
  updated: number,
): Promise<{ kp: string; action: string }> {
  const existing = await prisma.salesContract.findUnique({ where: { kp } });

  await prisma.salesContract.upsert({
    where: { kp },
    create: {
      kp,
      codename:     `DTR TEST ${stage.abbrev}`,
      permintaan:   'Test Customer',
      kat_kode:     'SC',
      tgl:          new Date('2026-03-01'),
      pipeline_status: stage.key,
      sacon:        stage.key === 'SACON',
      acc:          stage.acc ? 'true' : null,
      te:           4260,
      ket_warna:    'Indigo Blue',
      status:       'active',
      is_active:    true,
    },
    update: {
      codename:        `DTR TEST ${stage.abbrev}`,
      permintaan:      'Test Customer',
      kat_kode:        'SC',
      tgl:             new Date('2026-03-01'),
      pipeline_status: stage.key,
      sacon:           stage.key === 'SACON',
      acc:             stage.acc ? 'true' : null,
      te:              4260,
      ket_warna:       'Indigo Blue',
      status:          'active',
      is_active:       true,
    },
  });

  return { kp, action: existing ? 'updated' : 'created' };
}

async function main() {
  console.log('Injecting test pipeline data…\n');

  const results: { kp: string; action: string }[] = [];

  for (const stage of STAGES) {
    for (let i = 1; i <= 3; i++) {
      const kp = `TEST_${stage.abbrev}_${i}`;
      const result = await upsertContract(kp, stage, 0, 0);
      results.push(result);
    }
  }

  const created = results.filter(r => r.action === 'created').length;
  const updated = results.filter(r => r.action === 'updated').length;

  console.log(`\nDone — ${created} created, ${updated} updated (${results.length} total)`);

  // Migrate any legacy SACON test records to PENDING_APPROVAL
  await prisma.salesContract.updateMany({
    where: { kp: { startsWith: 'TEST_SC_' } },
    data: { pipeline_status: 'PENDING_APPROVAL', sacon: false },
  });
  console.log('Migrated TEST_SC_* records from SACON → PENDING_APPROVAL');

  // Spot-check
  const all = await prisma.salesContract.findMany({
    where: { kp: { startsWith: 'TEST_' } },
    orderBy: { kp: 'asc' },
  });
  console.log('\nRecords in DB:');
  for (const sc of all) {
    console.log(`  ${sc.kp.padEnd(16)} | ${sc.pipeline_status.padEnd(18)} | acc=${sc.acc ?? 'null'} | sacon=${sc.sacon}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
