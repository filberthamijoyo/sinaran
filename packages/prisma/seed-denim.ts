/**
 * Seed script for Indigo/Weaving (Denim) Division
 * Inserts one complete example record through the full pipeline for KP = "BSPD"
 * 
 * Usage:
 *   cd packages/prisma && dotenv -e ../../.env -- npx ts-node seed-denim.ts
 * 
 * Or if ts-node not available:
 *   cd packages/prisma && dotenv -e ../../.env -- node -r ts-node/register seed-denim.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for Indigo/Weaving Division...\n');

  // STEP 1 — SalesContract
  console.log('STEP 1: Creating SalesContract...');
  const salesContract = await prisma.salesContract.create({
    data: {
      kp: "BSPD",
      tgl: new Date("2026-01-10"),
      permintaan: "Prince Yuji",
      codename: "DTR 1069 SP",
      kons_kode: "DTR",
      kode_number: "1069",
      kat_kode: "SP",
      ne_lusi: 10,
      ne_pakan: 10,
      sp_lusi: "SSM",
      sp_pakan: "SSM",
      tb: 2380,
      acc: "ACC",
      proses: "PROSES",
      sacon: true,
    },
  });
  console.log(`  ✓ SalesContract created: ${salesContract.kp}\n`);

  // STEP 2 — WarpingRun
  console.log('STEP 2: Creating WarpingRun...');
  const warpingRun = await prisma.warpingRun.create({
    data: {
      kp: "BSPD",
      tgl: new Date("2026-01-15"),
      start_time: "08:00:00",
      stop_time: "16:00:00",
      kode_full: "DTR 1069 SP L4 W4",
      sp: "SSM",
      rpm: 500,
      total_beam: 3,
      eff_warping: 0.69,
    },
  });
  console.log(`  ✓ WarpingRun created: ${warpingRun.kp} (ID: ${warpingRun.id})\n`);

  // STEP 3 — WarpingBeam (3 beams)
  console.log('STEP 3: Creating WarpingBeam (3 beams)...');
  const beam1 = await prisma.warpingBeam.create({
    data: {
      warping_run_id: warpingRun.id,
      kp: "BSPD",
      position: 1,
      beam_number: 867,
      putusan: 7,
    },
  });
  console.log(`  ✓ WarpingBeam 1: beam_number=${beam1.beam_number} (ID: ${beam1.id})`);

  const beam2 = await prisma.warpingBeam.create({
    data: {
      warping_run_id: warpingRun.id,
      kp: "BSPD",
      position: 2,
      beam_number: 654,
      putusan: 6,
    },
  });
  console.log(`  ✓ WarpingBeam 2: beam_number=${beam2.beam_number} (ID: ${beam2.id})`);

  const beam3 = await prisma.warpingBeam.create({
    data: {
      warping_run_id: warpingRun.id,
      kp: "BSPD",
      position: 3,
      beam_number: 720,
      putusan: 5,
    },
  });
  console.log(`  ✓ WarpingBeam 3: beam_number=${beam3.beam_number} (ID: ${beam3.id})\n`);

  // STEP 4 — IndigoRun
  console.log('STEP 4: Creating IndigoRun...');
  const indigoRun = await prisma.indigoRun.create({
    data: {
      kp: "BSPD",
      tanggal: new Date("2026-01-19"),
      mc: 3,
      kode_full: "DTR 1069 SP L4 W4 2 CT 5",
      speed: 20,
      indigo: 3.5,
      caustic: 2.8,
      hydro: 1.2,
      temp_dryer: 135,
      bak_1: 60,
      bak_2: 60,
      bak_3: 65,
    },
  });
  console.log(`  ✓ IndigoRun created: ${indigoRun.kp} (ID: ${indigoRun.id})\n`);

  // STEP 5 — WeavingRecord (3 records, one per beam)
  console.log('STEP 5: Creating WeavingRecord (3 records)...');

  const weaving1 = await prisma.weavingRecord.create({
    data: {
      kp: "BSPD",
      warping_beam_id: beam1.id, // beam 867
      tanggal: new Date("2026-01-19"),
      shift: 2,
      machine: "X-01",
      sizing: "indigo 3",
      beam: 867,
      kode_kain: "DTR 1069 SPL4W4",
      operator: "NITA FEBIYANTI",
      a_pct: 42.497,
      p_pct: 79.685,
      rpm: 550.77,
      meters: 50.695,
      warp_no: 7,
      weft_no: 2,
      merk: "SINARAN",
    },
  });
  console.log(`  ✓ WeavingRecord 1: machine=${weaving1.machine}, beam=${weaving1.beam} (ID: ${weaving1.id})`);

  const weaving2 = await prisma.weavingRecord.create({
    data: {
      kp: "BSPD",
      warping_beam_id: beam2.id, // beam 654
      tanggal: new Date("2026-01-20"),
      shift: 1,
      machine: "T-02",
      sizing: "indigo 3",
      beam: 654,
      kode_kain: "DTR 1069 SPL4W4",
      operator: "YESTI PADILAH",
      a_pct: 53.188,
      p_pct: 83.702,
      rpm: 500.67,
      meters: 57.926,
      merk: "SINARAN",
    },
  });
  console.log(`  ✓ WeavingRecord 2: machine=${weaving2.machine}, beam=${weaving2.beam} (ID: ${weaving2.id})`);

  const weaving3 = await prisma.weavingRecord.create({
    data: {
      kp: "BSPD",
      warping_beam_id: beam3.id, // beam 720
      tanggal: new Date("2026-01-20"),
      shift: 2,
      machine: "S-05",
      sizing: "indigo 3",
      beam: 720,
      kode_kain: "DTR 1069 SPL4W4",
      operator: "YULI YULIANTI 2",
      a_pct: 66.484,
      p_pct: 91.956,
      rpm: 550.26,
      meters: 79.462,
      merk: "SINARAN",
    },
  });
  console.log(`  ✓ WeavingRecord 3: machine=${weaving3.machine}, beam=${weaving3.beam} (ID: ${weaving3.id})\n`);

  // STEP 6 — InspectGrayRecord (2 rolls from beam 867 on machine X-01)
  console.log('STEP 6: Creating InspectGrayRecord (2 records)...');

  const inspect1 = await prisma.inspectGrayRecord.create({
    data: {
      kp: "BSPD",
      weaving_record_id: weaving1.id, // link to machine X-01
      tg: new Date("2026-01-20"),
      mc: "X01",
      bm: 867,
      sn: "J19N",
      sn_combined: "X01867J19N",
      no_pot: 1,
      sj: 120,
      actual_meters: 121.1,
      opg: "TH",
      tgl_potong: new Date("2026-01-20"),
    },
  });
  console.log(`  ✓ InspectGrayRecord 1: mc=${inspect1.mc}, bm=${inspect1.bm}, no_pot=${inspect1.no_pot} (ID: ${inspect1.id})`);

  const inspect2 = await prisma.inspectGrayRecord.create({
    data: {
      kp: "BSPD",
      weaving_record_id: weaving1.id, // link to machine X-01
      tg: new Date("2026-01-21"),
      mc: "X01",
      bm: 867,
      sn: "J19N",
      sn_combined: "X01867J19N",
      no_pot: 2,
      sj: 120,
      actual_meters: 119.6,
      opg: "TH",
      tgl_potong: new Date("2026-01-21"),
    },
  });
  console.log(`  ✓ InspectGrayRecord 2: mc=${inspect2.mc}, bm=${inspect2.bm}, no_pot=${inspect2.no_pot} (ID: ${inspect2.id})\n`);

  // VERIFICATION: Fetch SalesContract with ALL nested relations
  console.log('🔍 Verification: Fetching SalesContract with all relations...\n');
  
  const result = await prisma.salesContract.findUnique({
    where: { kp: "BSPD" },
    include: {
      warping_run: {
        include: {
          beams: true,
        },
      },
      indigo_run: true,
      weaving_records: {
        include: {
          warping_beam: true,
        },
      },
      inspect_gray: true,
    },
  });

  console.log('📦 Full Result:');
  console.log(JSON.stringify(result, null, 2));

  // Record counts
  console.log('\n📊 Record Counts:');
  console.log(`  SalesContract: ${await prisma.salesContract.count({ where: { kp: "BSPD" } })}`);
  console.log(`  WarpingRun: ${await prisma.warpingRun.count({ where: { kp: "BSPD" } })}`);
  console.log(`  WarpingBeam: ${await prisma.warpingBeam.count({ where: { kp: "BSPD" } })}`);
  console.log(`  IndigoRun: ${await prisma.indigoRun.count({ where: { kp: "BSPD" } })}`);
  console.log(`  WeavingRecord: ${await prisma.weavingRecord.count({ where: { kp: "BSPD" } })}`);
  console.log(`  InspectGrayRecord: ${await prisma.inspectGrayRecord.count({ where: { kp: "BSPD" } })}`);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
