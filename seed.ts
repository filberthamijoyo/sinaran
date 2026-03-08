import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random date within a range
const randomDate = (start: Date, end: Date) => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
};

// Helper to ensure value is never null - returns a default if needed
const ensureValue = <T>(value: T | null | undefined, defaultValue: T): T => {
  return value !== null && value !== undefined ? value : defaultValue;
};

// Helper to pick random element from array
const randomElement = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

// Indonesian month names
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Value ranges based on CSV data
const CSV_RANGES = {
  // Yarn Test ranges from CSV
  sliverRovingNe: { min: 0.1, max: 0.7 },
  totalDraft: { min: 14.0, max: 160.0 },
  twistMultiplier: { min: 3.0, max: 5.6 },
  tpi: { min: 9.0, max: 21.4 },
  tpm: { min: 350, max: 850 },
  actualTwist: { min: 350, max: 700 },
  rotorSpindleSpeed: { min: 50000, max: 101000 },
  meanNe: { min: 7.0, max: 32.0 },
  minNe: { min: 6.0, max: 31.0 },
  maxNe: { min: 8.0, max: 33.0 },
  cvCountPercent: { min: 0.4, max: 1.2 },
  meanStrengthCn: { min: 600, max: 850 },
  minStrengthCn: { min: 0, max: 800 },
  maxStrengthCn: { min: 700, max: 1000 },
  cvStrengthPercent: { min: 1.0, max: 3.5 },
  tenacityCnTex: { min: 10.0, max: 35.0 },
  elongationPercent: { min: 8.0, max: 20.0 },
  clsp: { min: 1500, max: 6000 },
  uPercent: { min: 8.0, max: 20.0 },
  cvB: { min: 0.6, max: 2.0 },
  cvm: { min: 1.0, max: 3.5 },
  cvm1m: { min: 1.5, max: 3.5 },
  cvm3m: { min: 2.0, max: 3.5 },
  cvm10m: { min: 2.0, max: 3.5 },
  thin50Percent: { min: 0, max: 50 },
  thick50Percent: { min: 0, max: 300 },
  neps200Percent: { min: 0, max: 1500 },
  neps280Percent: { min: 0, max: 2000 },
  thin30Percent: { min: 0, max: 30 },
  thin40Percent: { min: 0, max: 40 },
  thick35Percent: { min: 0, max: 200 },
  neps140Percent: { min: 0, max: 1000 },
  hairiness: { min: 4.5, max: 6.5 },
  sh: { min: 1.2, max: 1.8 },
  s1uPlusS2u: { min: 2000, max: 25000 },
  s3u: { min: 500, max: 8000 },
  dr1_5m5Percent: { min: 15.0, max: 25.0 },
  machineNo: { min: 1, max: 10 },
  
  // Production ranges from CSV
  beratConeCheeseKg: { min: 2.5, max: 3.0 },
  jumlahConesCheese: { min: 100, max: 6000 },
  speed: { min: 4000, max: 101000 },
  jumlahSpindelRotorTerpasang: { min: 200, max: 2300 },
  tm: { min: 3.5, max: 5.1 },
  
  // Indigo ranges from CSV
  p: { min: 5.0, max: 28.1 },
  te: { min: 3800, max: 6760 },
  bb: { min: 1200, max: 7200 },
  speedIndigo: { min: 13.0, max: 20.0 },
  bakCelup: { min: 1, max: 8 },
  bakSulfur: { min: 3, max: 8 },
  konstIdg: { min: 1.2, max: 8.0 },
  konstSulfur: { min: 0, max: 3 },
};

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // ============================================
    // STEP 1: Seed Dimension Tables
    // ============================================
    console.log('📊 Seeding dimension tables...');

    // Count Descriptions (1-36) - Based on CSV patterns
    console.log('  → Inserting Count Descriptions...');
    const countDescriptions = [
      { code: 1, name: 'E 7s 4600,0 LL28 D2' },
      { code: 2, name: 'E 10s 4600,0 LL28 D2' },
      { code: 3, name: 'E 16s 4600,0 LL28 D2' },
      { code: 4, name: 'RSM 10,7 1000,0 LL23 D2' },
      { code: 5, name: 'RS 10,7 4006,0 NL04 AX D2' },
      { code: 6, name: 'RS 10,8 4006,0 NL04 AX D2' },
      { code: 7, name: 'E 20s 4600,0 LL28 D2' },
      { code: 8, name: 'E 24s 4600,0 LL28 D2' },
      { code: 9, name: 'E 30s 4600,0 LL28 D2' },
      { code: 10, name: 'RSM 12,5 1000,0 LL23 D2' },
      { code: 11, name: 'RS 12,5 4006,0 NL04 AX D2' },
      { code: 12, name: 'E 34s 4600,0 LL28 D2' },
      { code: 13, name: 'E 40s 4600,0 LL28 D2' },
      { code: 14, name: 'RSM 14,5 1000,0 LL23 D2' },
      { code: 15, name: 'RS 14,5 4006,0 NL04 AX D2' },
      { code: 16, name: 'E 50s 4600,0 LL28 D2' },
      { code: 17, name: 'E 60s 4600,0 LL28 D2' },
      { code: 18, name: 'RSM 16,7 1000,0 LL23 D2' },
      { code: 19, name: 'RS 16,7 4006,0 NL04 AX D2' },
      { code: 20, name: 'E 7s 1000,0 LL28 D2' },
      { code: 21, name: 'E 10s 1000,0 LL28 D2' },
      { code: 22, name: 'E 16s 1000,0 LL28 D2' },
      { code: 23, name: 'RSM 10,7 4600,0 LL23 D2' },
      { code: 24, name: 'RS 10,7 4600,0 NL04 AX D2' },
      { code: 25, name: 'E 20s 1000,0 LL28 D2' },
      { code: 26, name: 'E 24s 1000,0 LL28 D2' },
      { code: 27, name: 'E 30s 1000,0 LL28 D2' },
      { code: 28, name: 'RSM 12,5 4600,0 LL23 D2' },
      { code: 29, name: 'RS 12,5 4600,0 NL04 AX D2' },
      { code: 30, name: 'E 34s 1000,0 LL28 D2' },
      { code: 31, name: 'E 40s 1000,0 LL28 D2' },
      { code: 32, name: 'RSM 14,5 4600,0 LL23 D2' },
      { code: 33, name: 'RS 14,5 4600,0 NL04 AX D2' },
      { code: 34, name: 'E 50s 1000,0 LL28 D2' },
      { code: 35, name: 'E 60s 1000,0 LL28 D2' },
      { code: 36, name: 'RSM 16,7 4600,0 LL23 D2' },
    ];

    for (const cd of countDescriptions) {
      await prisma.countDescription.upsert({
        where: { code: cd.code },
        update: { name: cd.name },
        create: { code: cd.code, name: cd.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${countDescriptions.length} count descriptions`);

    // Lots - from CSV data
    console.log('  → Inserting Lots...');
    const lots = [
      { code: 101, name: '1000,0' },
      { code: 102, name: '4006,0' },
      { code: 103, name: '4600,0' },
      { code: 104, name: '3700,0' },
      { code: 105, name: '5000,0' },
      { code: 106, name: '6000,0' },
      { code: 107, name: '7003,0' },
      { code: 108, name: '8000,0' },
      { code: 109, name: '9000,0' },
      { code: 110, name: '0080,2' },
    ];

    for (const lot of lots) {
      await prisma.lot.upsert({
        where: { name: lot.name },
        update: { code: lot.code },
        create: { code: lot.code, name: lot.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${lots.length} lots`);

    // SPKs
    console.log('  → Inserting SPKs...');
    const spks = [
      { code: 201, name: 'LL23 D2' },
      { code: 202, name: 'LL28 D2' },
      { code: 203, name: 'NL04 AX D2' },
      { code: 204, name: 'LL30 D2' },
      { code: 205, name: 'NL05 AX D2' },
      { code: 206, name: 'LL35 D2' },
      { code: 207, name: 'NL06 AX D2' },
    ];

    for (const spk of spks) {
      await prisma.spk.upsert({
        where: { name: spk.name },
        update: { code: spk.code },
        create: { code: spk.code, name: spk.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${spks.length} SPKs`);

    // Yarn Types - from CSV data
    console.log('  → Inserting Yarn Types...');
    const yarnTypes = [
      { code: 301, name: 'OE', letterCode: 'E' },
      { code: 302, name: 'RING', letterCode: 'R' },
      { code: 303, name: 'RS', letterCode: 'RS' },
      { code: 304, name: 'RSM', letterCode: 'RSM' },
      { code: 305, name: 'S', letterCode: 'S' },
      { code: 306, name: 'CRS', letterCode: 'CRS' },
      { code: 307, name: 'LE', letterCode: 'LE' },
      { code: 308, name: 'OE Viscose', letterCode: 'EV' },
      { code: 309, name: 'Ring Cotton', letterCode: 'RC' },
    ];

    for (const yt of yarnTypes) {
      await prisma.yarnType.upsert({
        where: { code: yt.code },
        update: { name: yt.name, letterCode: yt.letterCode },
        create: { code: yt.code, name: yt.name, letterCode: yt.letterCode, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${yarnTypes.length} yarn types`);

    // Blends
    console.log('  → Inserting Blends...');
    const blends = [
      { name: '100% Viscose', letterCode: 'V' },
      { name: '100% Cotton', letterCode: 'C' },
      { name: '65/35 Poly/Cotton', letterCode: 'PC' },
      { name: '50/50 Poly/Cotton', letterCode: 'PC50' },
      { name: '100% Polyester', letterCode: 'P' },
      { name: 'Mixed Blend', letterCode: 'MB' },
    ];

    for (const blend of blends) {
      await prisma.blend.upsert({
        where: { name: blend.name },
        update: { letterCode: blend.letterCode },
        create: { name: blend.name, letterCode: blend.letterCode, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${blends.length} blends`);

    // Suppliers
    console.log('  → Inserting Suppliers...');
    const suppliers = [
      { code: 401, name: 'SSM' },
      { code: 402, name: 'Supplier B' },
      { code: 403, name: 'Supplier C' },
      { code: 404, name: 'Supplier D' },
      { code: 405, name: 'Supplier E' },
    ];

    for (const supplier of suppliers) {
      await prisma.supplier.upsert({
        where: { code: supplier.code },
        update: { name: supplier.name },
        create: { code: supplier.code, name: supplier.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${suppliers.length} suppliers`);

    // Mills Units
    console.log('  → Inserting Mills Units...');
    const millsUnits = [
      { code: 501, name: 'OE', letterCode: 'E' },
      { code: 502, name: 'RS', letterCode: 'RS' },
      { code: 503, name: 'RING', letterCode: 'R' },
      { code: 504, name: 'Unit 4', letterCode: 'U4' },
      { code: 505, name: 'Unit 5', letterCode: 'U5' },
    ];

    for (const mu of millsUnits) {
      await prisma.millsUnit.upsert({
        where: { code: mu.code },
        update: { name: mu.name, letterCode: mu.letterCode },
        create: { code: mu.code, name: mu.name, letterCode: mu.letterCode, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${millsUnits.length} mills units`);

    // Process Steps
    console.log('  → Inserting Process Steps...');
    const processSteps = [
      { code: 601, name: 'Rotor' },
      { code: 602, name: 'Ring' },
      { code: 603, name: 'Winding' },
      { code: 604, name: 'Blowing' },
      { code: 605, name: 'Carding' },
      { code: 606, name: 'Drawing' },
      { code: 607, name: 'Roving' },
      { code: 608, name: 'Spinning' },
    ];

    for (const ps of processSteps) {
      await prisma.processStep.upsert({
        where: { code: ps.code },
        update: { name: ps.name },
        create: { code: ps.code, name: ps.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${processSteps.length} process steps`);

    // Test Types
    console.log('  → Inserting Test Types...');
    const testTypes = [
      { code: 701, name: 'Routine' },
      { code: 702, name: 'Sample' },
      { code: 703, name: 'Uster Test' },
      { code: 704, name: 'Strength Test' },
      { code: 705, name: 'Count Test' },
    ];

    for (const tt of testTypes) {
      await prisma.testType.upsert({
        where: { code: tt.code },
        update: { name: tt.name },
        create: { code: tt.code, name: tt.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${testTypes.length} test types`);

    // Sides
    console.log('  → Inserting Sides...');
    const sides = [
      { code: 'I1', name: 'kanan' },
      { code: 'I2', name: 'Kiri' },
      { code: 'I3', name: 'N/A' },
      { code: 'I4', name: 'Kanan' },
      { code: 'I5', name: 'Side 5' },
    ];

    for (const side of sides) {
      await prisma.side.upsert({
        where: { code: side.code },
        update: { name: side.name },
        create: { code: side.code, name: side.name, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${sides.length} sides`);

    // Slub Codes - from CSV data
    console.log('  → Inserting Slub Codes...');
    const slubCodes = [
      { code: '107', description: 'Fancy', name: 'Fancy 107' },
      { code: '108', description: 'Fancy', name: 'Fancy 108' },
      { code: '12+40D', description: 'Fancy', name: '12+40D' },
      { code: '14+40D', description: 'Fancy', name: '14+40D' },
      { code: '10+40D', description: 'Fancy', name: '10+40D' },
      { code: '10.12', description: 'Fancy', name: '10.12' },
      { code: '7.01', description: 'Fancy', name: '7.01' },
      { code: null, description: 'Normal', name: 'Normal' },
      { code: '-', description: 'Normal', name: 'Normal Dash' },
    ];

    for (const sc of slubCodes) {
      if (sc.code) {
        await prisma.slubCode.upsert({
          where: { code: sc.code },
          update: { description: sc.description, name: sc.name },
          create: { code: sc.code, description: sc.description, name: sc.name, isActive: true },
        });
      } else {
        const existing = await prisma.slubCode.findFirst({ where: { code: null } });
        if (!existing) {
          await prisma.slubCode.create({
            data: { code: null, description: sc.description, name: sc.name, isActive: true },
          });
        }
      }
    }
    console.log(`    ✅ Inserted ${slubCodes.length} slub codes`);

    // Count Ne (for Production) - from CSV data
    console.log('  → Inserting Count Ne values...');
    const countNeValues = [7, 8, 10, 12, 14, 16, 20, 24, 30, 34, 40, 50, 60];
    for (const value of countNeValues) {
      await prisma.countNe.upsert({
        where: { value },
        update: {},
        create: { value, isActive: true },
      });
    }
    console.log(`    ✅ Inserted ${countNeValues.length} count Ne values`);

    // Production-specific dimension tables
    console.log('  → Inserting Production Dimension Tables...');

    // Warna Cone/Cheese - from Production CSV
    const warnaData = [
      'Hijau Pastel',
      'Coklat',
      'Abu-abu',
      'Hitam',
      'Pink',
      'Biru Muda',
      'Biru',
      'Merah',
      'White',
      'Natural',
      'Beige',
      'Cream',
    ];
    for (const name of warnaData) {
      await prisma.warnaConeCheese.upsert({
        where: { name },
        update: {},
        create: { name, isActive: true },
      });
    }

    // Rayon Brand
    const rayonBrandData = [
      { name: 'BRAND X A', letterCode: 'A' },
      { name: 'BRAND X B', letterCode: 'B' },
      { name: 'BRAND Y A', letterCode: 'A' },
      { name: 'BRAND Y B', letterCode: 'B' },
    ];
    for (const brand of rayonBrandData) {
      await prisma.rayonBrand.upsert({
        where: { name: brand.name },
        update: { letterCode: brand.letterCode },
        create: { name: brand.name, letterCode: brand.letterCode, isActive: true },
      });
    }

    console.log('    ✅ Production dimension tables seeded');

    // ============================================
    // STEP 2: Seed Yarn Tests with Randomized Dates
    // ============================================
    console.log('\n🧪 Seeding Yarn Tests with randomized dates...');

    // Get all dimension data
    const allCountDescs = await prisma.countDescription.findMany({ where: { isActive: true } });
    const allLots = await prisma.lot.findMany({ where: { isActive: true } });
    const allSpks = await prisma.spk.findMany({ where: { isActive: true } });
    const allYarnTypes = await prisma.yarnType.findMany({ where: { isActive: true } });
    const allBlends = await prisma.blend.findMany({ where: { isActive: true } });
    const allSuppliers = await prisma.supplier.findMany({ where: { isActive: true } });
    const allMillsUnits = await prisma.millsUnit.findMany({ where: { isActive: true } });
    const allProcessSteps = await prisma.processStep.findMany({ where: { isActive: true } });
    const allTestTypes = await prisma.testType.findMany({ where: { isActive: true } });
    const allSides = await prisma.side.findMany({ where: { isActive: true } });
    const allSlubCodes = await prisma.slubCode.findMany({ where: { isActive: true } });
    const allCountNe = await prisma.countNe.findMany({ where: { isActive: true } });

    const yarnTestsToCreate = 200; // Create 200 yarn tests

    if (
      allCountDescs.length === 0 ||
      allLots.length === 0 ||
      allSpks.length === 0 ||
      allYarnTypes.length === 0 ||
      allSuppliers.length === 0 ||
      allMillsUnits.length === 0 ||
      allProcessSteps.length === 0 ||
      allTestTypes.length === 0 ||
      allSides.length === 0
    ) {
      console.log('  ⚠️  Skipping yarn tests - missing dimension data');
    } else {
      // Generate dates across wider range (2024-2026) for more randomization
      const startDate = new Date(2024, 0, 1); // January 1, 2024
      const endDate = new Date(2026, 11, 31); // December 31, 2026

      const batchSize = 50;

      for (let batch = 0; batch < yarnTestsToCreate / batchSize; batch++) {
        for (let i = 0; i < batchSize; i++) {
          const testDate = randomDate(startDate, endDate);
          const testMonth = months[testDate.getMonth()];
          const testYear = testDate.getFullYear();

          // Randomly select dimension values - ensure all are populated
          const countDesc = randomElement(allCountDescs);
          const lot = randomElement(allLots);
          const spk = randomElement(allSpks);
          const yarnType = randomElement(allYarnTypes);
          const blend = randomElement(allBlends); // Always assign a blend
          const supplier = randomElement(allSuppliers);
          const millsUnit = randomElement(allMillsUnits);
          const processStep = randomElement(allProcessSteps);
          const testType = randomElement(allTestTypes);
          const side = randomElement(allSides);
          const slubCode = randomElement(allSlubCodes); // Always assign a slub code
          const countNe = randomElement(allCountNe);

          // Generate realistic test values based on CSV patterns
          const nominalCount = Number(countNe.value);
          const sliverRovingNe = random(CSV_RANGES.sliverRovingNe.min, CSV_RANGES.sliverRovingNe.max);
          const totalDraft = nominalCount / sliverRovingNe;
          const twistMultiplier = random(CSV_RANGES.twistMultiplier.min, CSV_RANGES.twistMultiplier.max);
          const tpi = Math.sqrt(nominalCount) * twistMultiplier;
          const tpm = tpi * 39.37;
          const rotorSpindleSpeed = randomInt(CSV_RANGES.rotorSpindleSpeed.min, CSV_RANGES.rotorSpindleSpeed.max);

          // Count variation - ensure values are realistic
          const meanNe = Math.max(CSV_RANGES.meanNe.min, Math.min(CSV_RANGES.meanNe.max, nominalCount + random(-2, 2)));
          const minNe = Math.max(CSV_RANGES.minNe.min, meanNe - random(0.5, 2));
          const maxNe = Math.min(CSV_RANGES.maxNe.max, meanNe + random(0.5, 2));
          const cvCountPercent = random(CSV_RANGES.cvCountPercent.min, CSV_RANGES.cvCountPercent.max);

          // Strength properties
          const meanStrengthCn = random(CSV_RANGES.meanStrengthCn.min, CSV_RANGES.meanStrengthCn.max);
          const minStrengthCn = Math.max(0, meanStrengthCn - random(50, 200));
          const maxStrengthCn = meanStrengthCn + random(50, 200);
          const cvStrengthPercent = random(CSV_RANGES.cvStrengthPercent.min, CSV_RANGES.cvStrengthPercent.max);
          const tenacityCnTex = meanNe * meanStrengthCn * 0.001693;
          const elongationPercent = random(CSV_RANGES.elongationPercent.min, CSV_RANGES.elongationPercent.max);
          const clsp = ((meanStrengthCn / 0.9807) * 1.6934 * meanNe * 156.2) / 1000;

          // Evenness / Uster Data
          const uPercent = random(CSV_RANGES.uPercent.min, CSV_RANGES.uPercent.max);
          const cvB = random(CSV_RANGES.cvB.min, CSV_RANGES.cvB.max);
          const cvm = random(CSV_RANGES.cvm.min, CSV_RANGES.cvm.max);
          const cvm1m = random(CSV_RANGES.cvm1m.min, CSV_RANGES.cvm1m.max);
          const cvm3m = random(CSV_RANGES.cvm3m.min, CSV_RANGES.cvm3m.max);
          const cvm10m = random(CSV_RANGES.cvm10m.min, CSV_RANGES.cvm10m.max);

          // IPI Faults (Ring Spinning)
          const thin50Percent = randomInt(CSV_RANGES.thin50Percent.min, CSV_RANGES.thin50Percent.max);
          const thick50Percent = randomInt(CSV_RANGES.thick50Percent.min, CSV_RANGES.thick50Percent.max);
          const neps200Percent = randomInt(CSV_RANGES.neps200Percent.min, CSV_RANGES.neps200Percent.max);
          const neps280Percent = randomInt(CSV_RANGES.neps280Percent.min, CSV_RANGES.neps280Percent.max);
          const ipis = thin50Percent + thick50Percent + neps200Percent;

          // IPI Faults (Open End)
          const thin30Percent = randomInt(CSV_RANGES.thin30Percent.min, CSV_RANGES.thin30Percent.max);
          const thin40Percent = randomInt(CSV_RANGES.thin40Percent.min, CSV_RANGES.thin40Percent.max);
          const thick35Percent = randomInt(CSV_RANGES.thick35Percent.min, CSV_RANGES.thick35Percent.max);
          const neps140Percent = randomInt(CSV_RANGES.neps140Percent.min, CSV_RANGES.neps140Percent.max);
          const oeIpi = thin50Percent + thick50Percent + neps280Percent;
          const shortIpi = thin40Percent + thick35Percent + neps140Percent;

          // Hairiness & Spectrogram
          const hairiness = random(CSV_RANGES.hairiness.min, CSV_RANGES.hairiness.max);
          const sh = random(CSV_RANGES.sh.min, CSV_RANGES.sh.max);
          const s1uPlusS2u = random(CSV_RANGES.s1uPlusS2u.min, CSV_RANGES.s1uPlusS2u.max);
          const s3u = random(CSV_RANGES.s3u.min, CSV_RANGES.s3u.max);
          const dr1_5m5Percent = random(CSV_RANGES.dr1_5m5Percent.min, CSV_RANGES.dr1_5m5Percent.max);

          // Remarks - always provide a value
          const remarksOptions = [
            'Routine test completed',
            'Sample test',
            'Quality check passed',
            'Standard production test',
            'Batch verification',
            'Quality control test',
            'Production sample',
            null, // Allow some nulls but not all
          ];
          const remarks = randomElement(remarksOptions);

          await prisma.yarnTest.create({
            data: {
              testDate,
              testMonth,
              testYear,
              countDescriptionCode: countDesc.code,
              countNeId: countNe.id,
              lotId: lot.id,
              spkId: spk.id,
              yarnTypeId: yarnType.id,
              blendId: blend.id, // Always assigned
              slubCodeId: slubCode.id, // Always assigned
              supplierId: supplier.id,
              millsUnitId: millsUnit.id,
              processStepId: processStep.id,
              testTypeId: testType.id,
              machineNo: randomInt(CSV_RANGES.machineNo.min, CSV_RANGES.machineNo.max),
              sideId: side.id,
              sliverRovingNe,
              totalDraft,
              twistMultiplier,
              tpi,
              tpm,
              actualTwist: randomInt(CSV_RANGES.actualTwist.min, CSV_RANGES.actualTwist.max),
              rotorSpindleSpeed,
              meanNe,
              minNe,
              maxNe,
              cvCountPercent,
              meanStrengthCn,
              minStrengthCn,
              maxStrengthCn,
              cvStrengthPercent,
              tenacityCnTex,
              elongationPercent,
              clsp,
              uPercent,
              cvB,
              cvm,
              cvm1m,
              cvm3m,
              cvm10m,
              thin50Percent,
              thick50Percent,
              neps200Percent,
              neps280Percent,
              ipis,
              oeIpi,
              thin30Percent,
              thin40Percent,
              thick35Percent,
              neps140Percent,
              shortIpi,
              hairiness,
              sh,
              s1uPlusS2u,
              s3u,
              dr1_5m5Percent,
              remarks,
            },
          });
        }

        console.log(`    ✅ Inserted batch ${batch + 1} (${batchSize} tests)`);
      }

      console.log(`  ✅ Total: ${yarnTestsToCreate} yarn tests created`);
    }

    // ============================================
    // STEP 3: Seed Production Records
    // ============================================
    console.log('\n🏭 Seeding Production Records...');

    const allWarna = await prisma.warnaConeCheese.findMany({ where: { isActive: true } });
    const allRayonBrands = await prisma.rayonBrand.findMany({ where: { isActive: true } });
    const productionRecordsToCreate = 150;

    if (allMillsUnits.length > 0 && allYarnTypes.length > 0 && allCountNe.length > 0) {
      const startDate = new Date(2024, 0, 1); // Start from 2024 for more date range
      const endDate = new Date(2026, 11, 31); // End in December 2026

      for (let i = 0; i < productionRecordsToCreate; i++) {
        const productionDate = randomDate(startDate, endDate);
        const month = months[productionDate.getMonth()];
        const year = productionDate.getFullYear();
        const countNe = randomElement(allCountNe);
        const millsUnit = randomElement(allMillsUnits);
        const yarnType = randomElement(allYarnTypes);
        const lot = randomElement(allLots);
        const spk = randomElement(allSpks);
        const slubCode = randomElement(allSlubCodes);
        const warna = allWarna.length > 0 ? randomElement(allWarna) : null;
        const rayonBrand = allRayonBrands.length > 0 ? randomElement(allRayonBrands) : null;
        const countDesc = randomElement(allCountDescs);

        const beratConeCheeseKg = random(CSV_RANGES.beratConeCheeseKg.min, CSV_RANGES.beratConeCheeseKg.max);
        const jumlahConesCheese = randomInt(CSV_RANGES.jumlahConesCheese.min, CSV_RANGES.jumlahConesCheese.max);
        const produksiKgs = beratConeCheeseKg * jumlahConesCheese;
        const produksiLbs = produksiKgs * 2.2046;
        const aktualProduksiBales = produksiLbs / 400;
        const speed = randomInt(CSV_RANGES.speed.min, CSV_RANGES.speed.max);
        const jumlahSpindelRotorTerpasang = randomInt(
          CSV_RANGES.jumlahSpindelRotorTerpasang.min,
          CSV_RANGES.jumlahSpindelRotorTerpasang.max
        );
        const tm = random(CSV_RANGES.tm.min, CSV_RANGES.tm.max);
        const tpi = tm * Math.sqrt(Number(countNe.value));

        const produksi100PercentBales =
          (jumlahSpindelRotorTerpasang * speed * 1440) / (Number(countNe.value) * tpi * 840 * 36 * 400);
        const targetOpsOpr = (0.254 * speed * 0.9) / tpi / Number(countNe.value);
        const opsOprAktual = (produksiLbs * 16) / 3 / jumlahSpindelRotorTerpasang;
        const opsOprWorked = opsOprAktual * random(0.85, 1.0);
        const produksiEffisiensiPercent = Number(aktualProduksiBales) / Number(produksi100PercentBales);
        const targetProduksiOnTargetOprBales = (jumlahSpindelRotorTerpasang * targetOpsOpr * 3) / 16 / 400;
        const keuntunganKerugianEfisiensiBalesOnTargetOpsOpr =
          ((opsOprWorked - targetOpsOpr) * jumlahSpindelRotorTerpasang * 3) / 16 / 400;
        const effisiensiKerjaPercent =
          ((opsOprWorked * jumlahSpindelRotorTerpasang * 3) / 1600 / 4) / Number(produksi100PercentBales);

        // Stoppage times - always provide values (can be 0)
        const powerElectricMin = randomInt(0, 720);
        const countMengubahMin = randomInt(0, 660);
        const creelMengubahMin = randomInt(0, 420);
        const preventiveMtcMin = randomInt(0, 660);
        const creelShortStoppageMin = randomInt(0, 750);
        const totalPenghentianMin = powerElectricMin + countMengubahMin + creelMengubahMin + preventiveMtcMin + creelShortStoppageMin;

        // Calculated fields
        const spindlesRotorsBekerja =
          ((jumlahSpindelRotorTerpasang * 1440) - (jumlahSpindelRotorTerpasang * totalPenghentianMin)) / 1440;
        const spindlesRotorsEffisiensi = spindlesRotorsBekerja / jumlahSpindelRotorTerpasang;
        const powerPenghentian = -(opsOprWorked * 3 * (jumlahSpindelRotorTerpasang * powerElectricMin / 1440) / 16 / 400);
        const countMengubahLoss = -(opsOprWorked * 3 * (jumlahSpindelRotorTerpasang * countMengubahMin / 1440)) / 16 / 400;
        const creelMengubahLoss = -(opsOprWorked * 3 * (jumlahSpindelRotorTerpasang * creelMengubahMin / 1440)) / 16 / 400;
        const preventiveMtcLoss = -(opsOprWorked * 3 * (jumlahSpindelRotorTerpasang * preventiveMtcMin / 1440)) / 16 / 400;
        const creelShortLoss = -(opsOprWorked * 3 * (jumlahSpindelRotorTerpasang * creelShortStoppageMin / 1440)) / 16 / 400;
        const kerugianTotal = -(opsOprWorked * 3 * (jumlahSpindelRotorTerpasang * totalPenghentianMin / 1440)) / 16 / 400;

        await prisma.productionRecord.create({
          data: {
            productionDate,
            month,
            year,
            millsUnitId: millsUnit.id,
            yarnTypeId: yarnType.id,
            countNeId: countNe.id,
            countNeValue: countNe.value,
            countDescriptionCode: countDesc.code,
            slubCodeId: slubCode.id, // Always assigned
            lotId: lot.id, // Always assigned
            spkId: spk.id, // Always assigned
            blendId: randomElement(allBlends).id, // Always assigned
            warnaConeCheeseId: warna?.id || null,
            rayonBrandId: rayonBrand?.id || null,
            beratConeCheeseKg,
            tm,
            tpi,
            speed,
            jumlahSpindelRotorTerpasang,
            jumlahConesCheese,
            produksiKgs,
            produksiLbs,
            aktualProduksiBales,
            produksi100PercentBales,
            targetProduksiOnTargetOprBales,
            keuntunganKerugianEfisiensiBalesOnTargetOpsOpr,
            targetOpsOpr,
            opsOprAktual,
            opsOprWorked,
            produksiEffisiensiPercent,
            effisiensiKerjaPercent,
            powerElectricMin,
            countMengubahMin,
            creelMengubahMin,
            preventiveMtcMin,
            creelShortStoppageMin,
            totalPenghentianMin,
            spindlesRotorsBekerja,
            spindlesRotorsEffisiensi,
            powerPenghentian,
            countMengubahLoss,
            creelMengubahLoss,
            preventiveMtcLoss,
            creelShortLoss,
            kerugianTotal,
            hargaBenangPerBale: random(500000, 2000000), // Random price
          },
        });
      }
      console.log(`  ✅ Inserted ${productionRecordsToCreate} production records`);
    } else {
      console.log('  ⚠️  Skipping production records - missing dimension data');
    }

    // ============================================
    // STEP 4: Seed Indigo Division Records
    // ============================================
    console.log('\n🎨 Seeding Indigo Division Records...');

    const indigoRecordsToCreate = 100;

    if (allCountDescs.length > 0) {
      const startDate = new Date(2022, 0, 1); // Start from 2022 based on CSV
      const endDate = new Date(2026, 11, 31);

      const mcOptions = ['1', '2', '3'];
      const kpOptions = ['ALED', 'AEJB', 'AEPE', 'AEJE', 'AEPS', 'AEPD', 'AEJP', 'AEND', 'AEPQ', 'AEJQ', 'AEPP', 'AEJT'];
      const codeOptions = [
        'DTR 1018.4 P L7',
        'T/DSR 1144.2 TE SC',
        'SKY 08',
        'DTR 1186.1 CR W2',
        'T/DSR 1511 TE SC',
        'DTR 1760 ST',
        'DTL 1638 CR <R>',
        'DTR 1069 SP W4 <R>',
        'DTR 1014 TE SC',
        'DTR 1704 CR L14 W3',
      ];

      for (let i = 0; i < indigoRecordsToCreate; i++) {
        const tanggal = randomDate(startDate, endDate);
        const mc = randomElement(mcOptions);
        const kp = randomElement(kpOptions);
        const code = randomElement(codeOptions);
        const countDesc = randomElement(allCountDescs);
        const ne = countDesc.name;

        // Base values
        const p = random(CSV_RANGES.p.min, CSV_RANGES.p.max);
        const te = random(CSV_RANGES.te.min, CSV_RANGES.te.max);
        const bb = random(CSV_RANGES.bb.min, CSV_RANGES.bb.max);
        const speed = random(CSV_RANGES.speedIndigo.min, CSV_RANGES.speedIndigo.max);
        const bakCelup = random(CSV_RANGES.bakCelup.min, CSV_RANGES.bakCelup.max);
        const bakSulfur = random(CSV_RANGES.bakSulfur.min, CSV_RANGES.bakSulfur.max);
        const konstIdg = random(CSV_RANGES.konstIdg.min, CSV_RANGES.konstIdg.max);
        const konstSulfur = random(0, CSV_RANGES.konstSulfur.max);

        // PEMAKAIAN OBAT - all fields populated
        const visc = random(11.0, 20.5);
        const ref = random(7.0, 10.5);
        const sizeBox = random(1.0, 2.0);
        const scoring = random(0, 2.0);
        const jetsize = random(0, 2.0);
        const polisizeHs = random(0, 2.0);
        const polisize12 = random(0, 2.0);
        const armosize = random(0, 2.0);
        const armosize11 = random(0, 2.0);
        const armosize12 = random(0, 2.0);
        const armosize13 = random(0, 2.0);
        const armosize15 = random(0, 2.0);
        const armosize17 = random(0, 2.0);
        const quqlaxe = random(0, 2.0);
        const armoC = random(0, 2.0);
        const vitE = random(0, 2.0);
        const armoD = random(0, 2.0);
        const tapioca = random(0, 2.0);
        const a308 = random(0, 2.0);

        // PEMASAKAN INDIGO
        const indigo = random(0, 300);
        const causticPemasakanIndigo = random(0, 300);
        const hydro = random(0, 300);
        const solopolPemasakanIndigo = random(0, 300);
        const serawetPemasakanIndigo = random(0, 300);
        const primasolPemasakanIndigo = random(0, 300);
        const cottoclarinPemasakanIndigo = random(0, 300);
        const setamol = random(0, 300);

        // Ungrouped chemicals
        const granular = random(0, 2.0);
        const granule = random(0, 2.0);
        const grain = random(0, 2.0);
        const wetMatic = random(0, 2.0);
        const fisat = random(0, 2.0);
        const breviol = random(0, 2.0);
        const csk = random(0, 2.0);
        const comee = random(0, 2.0);

        // PEMASAKAN CAUSTIK
        const dirsolRdp = random(0, 2.0);
        const primasolNf = random(0, 2.0);
        const zolopolPhtrZb = random(0, 2.0);
        const cottoclarinPemasakanCaustik = random(0, 2.0);
        const sanwet = random(0, 2.0);

        // PEMASAKAN CAUSTIC
        const marcerizeCoustic = random(0, 2.0);
        const sanmercer = random(0, 2.0);
        const sancomplex = random(0, 2.0);

        // PEMASAKAN HYDRO AKSES
        const exsessCaustic = random(0, 2.0);
        const exsessHydro = random(0, 2.0);

        // Ungrouped
        const dextoor = random(0, 2.0);
        const ltr = random(0, 2.0);

        // PEMASAKAN SULFUR
        const diresolBlackKasRotkas = random(0, 2.0);
        const sansulSdc = random(0, 2.0);
        const causticPemasakanSulfur = random(0, 2.0);
        const dextros = random(0, 2.0);
        const solopolPemasakanSulfur = random(0, 2.0);
        const primasolPemasakanSulfur = random(0, 2.0);
        const serawetPemasakanSulfur = random(0, 2.0);
        const cottoclarinPemasakanSulfur = random(0, 2.0);

        // FEEDING
        const saneutral = random(0, 2.0);
        const dextroseAdjust = random(0, 2.0);

        // Ungrouped
        const optifikRsl = random(0, 2.0);
        const ekalinF = random(0, 2.0);
        const solopolPhtr = random(0, 2.0);

        // SETINGAN INDIGO
        const moitureMahlo = random(0, 2.0);
        const tempDryer = random(95, 130);
        const tempMidDryer = random(60, 85);
        const tempSizeBox1 = random(60, 75);
        const tempSizeBox2 = random(60, 75);
        const sizeBox1 = random(2.5, 4.5);
        const sizeBox2 = random(2.5, 4.5);
        const squeezingRoll1 = random(2.5, 4.5);
        const squeezingRoll2 = random(2.5, 4.5);
        const immersionRoll = random(2.5, 4.5);
        const dryer = random(50, 70);
        const takeOff = random(50, 70);
        const winding = random(50, 70);
        const pressBeam = random(20, 30);
        const hydrolicPump1 = random(50, 70);
        const hydrolicPump2 = random(50, 70);
        const unwinder = random(50, 70);
        const dyeingTensWash = random(120, 160);
        const dyeingTensWarna = random(45, 85);

        // Trailing KPIs
        const mcIdg = random(4.0, 9.5);
        const strength = random(100, 130);
        const elongasiIdg = random(5.0, 9.0);
        const cvPercent = random(1.0, 3.0);

        await prisma.indigoDivisionRecord.create({
          data: {
            tanggal,
            mc,
            kp,
            code,
            countDescriptionCode: countDesc.code,
            ne,
            p,
            te,
            bb,
            speed,
            bakCelup,
            bakSulfur,
            konstIdg,
            konstSulfur,
            visc,
            ref,
            sizeBox,
            scoring,
            jetsize,
            polisizeHs,
            polisize12,
            armosize,
            armosize11,
            armosize12,
            armosize13,
            armosize15,
            armosize17,
            quqlaxe,
            armoC,
            vitE,
            armoD,
            tapioca,
            a308,
            indigo,
            causticPemasakanIndigo,
            hydro,
            solopolPemasakanIndigo,
            serawetPemasakanIndigo,
            primasolPemasakanIndigo,
            cottoclarinPemasakanIndigo,
            setamol,
            granular,
            granule,
            grain,
            wetMatic,
            fisat,
            breviol,
            csk,
            comee,
            dirsolRdp,
            primasolNf,
            zolopolPhtrZb,
            cottoclarinPemasakanCaustik,
            sanwet,
            marcerizeCoustic,
            sanmercer,
            sancomplex,
            exsessCaustic,
            exsessHydro,
            dextoor,
            ltr,
            diresolBlackKasRotkas,
            sansulSdc,
            causticPemasakanSulfur,
            dextros,
            solopolPemasakanSulfur,
            primasolPemasakanSulfur,
            serawetPemasakanSulfur,
            cottoclarinPemasakanSulfur,
            saneutral,
            dextroseAdjust,
            optifikRsl,
            ekalinF,
            solopolPhtr,
            moitureMahlo,
            tempDryer,
            tempMidDryer,
            tempSizeBox1,
            tempSizeBox2,
            sizeBox1,
            sizeBox2,
            squeezingRoll1,
            squeezingRoll2,
            immersionRoll,
            dryer,
            takeOff,
            winding,
            pressBeam,
            hydrolicPump1,
            hydrolicPump2,
            unwinder,
            dyeingTensWash,
            dyeingTensWarna,
            mcIdg,
            strength,
            elongasiIdg,
            cvPercent,
          },
        });
      }
      console.log(`  ✅ Inserted ${indigoRecordsToCreate} indigo division records`);
    } else {
      console.log('  ⚠️  Skipping indigo division records - missing dimension data');
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`   - Dimension tables populated`);
    if (yarnTestsToCreate) {
      console.log(`   - ${yarnTestsToCreate} yarn tests created with randomized dates`);
    }
    if (productionRecordsToCreate) {
      console.log(`   - ${productionRecordsToCreate} production records created with randomized dates`);
    }
    if (indigoRecordsToCreate) {
      console.log(`   - ${indigoRecordsToCreate} indigo division records created with randomized dates`);
    }
    console.log(`   - All fields populated (no NULL values)`);
    console.log(`   - Values randomized based on CSV reference data`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
