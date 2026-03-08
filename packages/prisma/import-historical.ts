import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
const EXCEL_PATH = '/Users/filberthamijoyo/Downloads/erp/CSV/ERP SCRATCH.xlsx';
const WEAVING_CSV_PATH = '/Users/filberthamijoyo/Downloads/erp/CSV/Weaving.csv';
const CUTOFF = new Date(2025, 0, 1);

function isOnOrAfter2025(d: Date | null): boolean {
  return d !== null && d >= CUTOFF;
}

function parseSaconDate(val: any): Date | null {
  if (!val) return null;
  const s = String(val).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

function parseWarpingDate(val: any): Date | null {
  if (!val) return null;
  const s = String(val).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const year = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3]);
  const d = new Date(year, parseInt(m[2]) - 1, parseInt(m[1]));
      return isNaN(d.getTime()) ? null : d;
}

function parseIndigoDate(val: any): Date | null {
  if (!val) return null;
  const s = String(val).trim();
  const months: Record<string, number> = {
    jan:0, feb:1, mar:2, apr:3, may:4, jun:5,
    jul:6, aug:7, sep:8, oct:9, nov:10, dec:11
  };
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (!m) return null;
  const month = months[m[2].toLowerCase()];
  if (month === undefined) return null;
  const year = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3]);
  const d = new Date(year, month, parseInt(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

function parseISODate(val: any): Date | null {
  if (!val) return null;
  const s = String(val).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function toStr(val: any): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === '' || s === '-' ? null : s;
}

function toFloat(val: any): number | null {
  if (val === null || val === undefined) return null;
  const n = parseFloat(String(val).replace(/,/g, '.').trim());
  return isNaN(n) ? null : n;
}

function toInt(val: any): number | null {
  const f = toFloat(val);
  return f === null ? null : Math.round(f);
}

function toBool(val: any): boolean {
  const s = String(val ?? '').trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES';
}

function mapPipelineStatus(acc: any, proses: any): string {
  const a = toStr(acc)?.toUpperCase() ?? '';
  const p = toStr(proses)?.toUpperCase() ?? '';
  if (a === 'TIDAK ACC') return 'REJECTED';
  if (p === 'BATAL' || p === 'CANCEL') return 'REJECTED';
  if (p === 'PENDING' || p === 'MENUNGGU') return 'PENDING_APPROVAL';
  if (a === 'ACC') return 'COMPLETE';
  return 'PENDING_APPROVAL';
}

async function truncateAll() {
  console.log('Truncating all tables...');
  await prisma.weavingRecord.deleteMany();
  await prisma.warpingBeam.deleteMany();
  await prisma.warpingRun.deleteMany();
  await prisma.indigoRun.deleteMany();
  await prisma.salesContract.deleteMany();
  console.log('Done. All tables empty.');
}

async function importSacon() {
  console.log('\n=== Importing SACON ===');
  const wb = XLSX.readFile(EXCEL_PATH, { raw: false, cellDates: false });
  const sheet = wb.Sheets['SACON'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as any[][];

  let ok = 0, skipped = 0, errors = 0;

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[3]) { skipped++; continue; }
    const kp = toStr(row[3]);
    if (!kp) { skipped++; continue; }
    const tgl = parseSaconDate(row[0]);
    if (!tgl || !isOnOrAfter2025(tgl)) { skipped++; continue; }

    try {
      await prisma.salesContract.upsert({
        where: { kp },
        create: {
          kp, tgl,
          permintaan:      toStr(row[1]),
          codename:        toStr(row[2]),
          kons_kode:       toStr(row[4]),
          kode_number:     toStr(row[5]),
          kat_kode:        toStr(row[6]),
          ket_ct_ws:       toStr(row[7]),
          ket_warna:       toStr(row[8]),
          status:          toStr(row[9]),
          te:              toFloat(row[10]),
          sisir:           toStr(row[11]),
          p_kons:          toStr(row[12]),
          ne_k_lusi:       toStr(row[13]),
          ne_lusi:         toFloat(row[14]),
          sp_lusi:         toStr(row[15]),
          lot_lusi:        toStr(row[16]),
          ne_k_pakan:      toStr(row[17]),
          ne_pakan:        toFloat(row[18]),
          sp_pakan:        toStr(row[19]),
          j:               toFloat(row[20]),
          j_c:             toFloat(row[21]),
          b_c:             toFloat(row[22]),
          tb:              toFloat(row[23]),
          bale_lusi:       toFloat(row[25]),
          total_pakan:     toFloat(row[26]),
          bale_pakan:      toFloat(row[27]),
          ts:              parseSaconDate(row[28]),
          sacon:           toBool(row[29]),
          acc:             toStr(row[30]),
          proses:          toStr(row[31]),
          foto_sacon:      toStr(row[32]),
          remarks:         toStr(row[33]),
          pipeline_status: mapPipelineStatus(row[30], row[31]),
          kp_status:       'ACTIVE',
          is_active:       true,
        },
        update: {
          tgl,
          permintaan:      toStr(row[1]),
          codename:        toStr(row[2]),
          pipeline_status: mapPipelineStatus(row[30], row[31]),
        }
      });
      ok++;
      if (ok % 100 === 0) console.log(`  ${ok} imported...`);
    } catch (e: any) {
      errors++;
      if (errors <= 5) console.error(`  Row ${i+1} KP=${kp}: ${e.message}`);
    }
  }
  console.log(`SACON done: ${ok} imported, ${skipped} skipped, ${errors} errors`);
}

async function importWarping() {
  console.log('\n=== Importing WARPING ===');
  const wb = XLSX.readFile(EXCEL_PATH, { raw: false, cellDates: false });
  const sheet = wb.Sheets['WARPING'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as any[][];

  let ok = 0, skipped = 0, errors = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[3]) { skipped++; continue; }
    const kp = toStr(row[3]);
    if (!kp) { skipped++; continue; }
    const tgl = parseWarpingDate(row[0]);
    if (!tgl || !isOnOrAfter2025(tgl)) { skipped++; continue; }

    try {
      const run = await prisma.warpingRun.upsert({
        where: { kp },
        create: {
          kp, tgl,
          start:           toStr(row[1]),
          stop:            toStr(row[2]),
          kode_full:       toStr(row[4]),
          benang:          toStr(row[5]),
          lot:             toStr(row[6]),
          sp:              toStr(row[7]),
          pt:              toInt(row[8]),
          te:              toFloat(row[9]),
          rpm:             toFloat(row[10]),
          mtr_min:         toFloat(row[11]),
          total_putusan:   toInt(row[27]),
          total_beam:      toInt(row[44]),
          cn_1:            toFloat(row[45]),
          jam:             toFloat(row[46]),
          total_waktu:     toFloat(row[47]),
          eff_warping:     toFloat(row[48]),
          no_mc:           toInt(row[49]),
          elongasi:        toFloat(row[50]),
          strength:        toFloat(row[51]),
          cv_pct:          toFloat(row[52]),
          tension_badan:   toInt(row[53]),
          tension_pinggir: toInt(row[54]),
          lebar_creel:     toInt(row[55]),
        },
        update: {
          tgl,
          kode_full:   toStr(row[4]),
          total_beam:  toInt(row[44]),
          eff_warping: toFloat(row[48]),
        }
      });

      // Import beam numbers (cols 29-43) and putusan (cols 12-26)
      for (let pos = 1; pos <= 15; pos++) {
        const beamNum = toInt(row[28 + pos]);
        if (!beamNum || beamNum <= 0) continue;
        const putusan = toInt(row[11 + pos]);
        
        // Skip if beam already exists at this position (handles duplicate KPs in Excel)
        const existing = await prisma.warpingBeam.findFirst({
          where: { warping_run_id: run.id, position: pos }
        });
        if (existing) continue;
        
        await prisma.warpingBeam.upsert({
          where: { kp_beam_number: { kp, beam_number: beamNum } },
          create: {
            warping_run_id: run.id,
            kp,
            position: pos,
            beam_number: beamNum,
            putusan: putusan ?? null,
          },
          update: { position: pos, putusan: putusan ?? null }
        });
      }
      ok++;
      if (ok % 100 === 0) console.log(`  ${ok} imported...`);
    } catch (e: any) {
      errors++;
      if (errors <= 5) console.error(`  Row ${i+1} KP=${kp}: ${e.message}`);
    }
  }
  console.log(`WARPING done: ${ok} imported, ${skipped} skipped, ${errors} errors`);
}

async function importIndigo() {
  console.log('\n=== Importing INDIGO ===');
  const wb = XLSX.readFile(EXCEL_PATH, { raw: false, cellDates: false });
  const sheet = wb.Sheets['INDIGO'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as any[][];

  let ok = 0, skipped = 0, errors = 0;

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[2]) { skipped++; continue; }
    const kp = toStr(row[2]);
    if (!kp) { skipped++; continue; }
    const tanggal = parseIndigoDate(row[0]);
    if (!tanggal || !isOnOrAfter2025(tanggal)) { skipped++; continue; }

    try {
      await prisma.indigoRun.upsert({
        where: { kp },
        create: {
          kp, tanggal, tgl: tanggal,
          mc:              toFloat(row[1]),
          kode_full:       toStr(row[3]),
          ne:              toStr(row[4]),
          p:               toFloat(row[5]),
          te:              toFloat(row[6]),
          bb:              toFloat(row[7]),
          speed:           toFloat(row[8]),
          bak_celup:       toFloat(row[9]),
          bak_sulfur:      toFloat(row[10]),
          konst_idg:       toFloat(row[11]),
          konst_sulfur:    toFloat(row[12]),
          visc:            toFloat(row[13]),
          ref:             toFloat(row[14]),
          size_box:        toFloat(row[15]),
          scoring:         toFloat(row[16]),
          jetsize:         toFloat(row[17]),
          polisize_hs:     toFloat(row[18]),
          polisize_1_2:    toFloat(row[19]),
          armosize:        toFloat(row[20]),
          armosize_1_1:    toFloat(row[21]),
          armosize_1_2:    toFloat(row[22]),
          armosize_1_3:    toFloat(row[23]),
          armosize_1_5:    toFloat(row[24]),
          armosize_1_7:    toFloat(row[25]),
          quqlaxe:         toFloat(row[26]),
          armo_c:          toFloat(row[27]),
          vit_e:           toFloat(row[28]),
          armo_d:          toFloat(row[29]),
          tapioca:         toFloat(row[30]),
          a_308:           toFloat(row[31]),
          indigo:          toFloat(row[32]),
          caustic:         toFloat(row[33]),
          hydro:           toFloat(row[34]),
          solopol:         toFloat(row[35]),
          serawet:         toFloat(row[36]),
          primasol:        toFloat(row[37]),
          cottoclarin:     toFloat(row[38]),
          setamol:         toFloat(row[39]),
          granular:        toFloat(row[40]),
          granule:         toFloat(row[41]),
          grain:           toFloat(row[42]),
          wet_matic:       toFloat(row[43]),
          fisat:           toFloat(row[44]),
          breviol:         toFloat(row[45]),
          csk:             toFloat(row[46]),
          comee:           toFloat(row[47]),
          dirsol_rdp:      toFloat(row[48]),
          primasol_nf:     toFloat(row[49]),
          zolopol_phtr:    toFloat(row[50]),
          cottoclarin_2:   toFloat(row[51]),
          sanwet:          toFloat(row[52]),
          marcerize_caustic: toFloat(row[53]),
          sanmercer:       toFloat(row[54]),
          sancomplex:      toFloat(row[55]),
          exsess_caustic:  toFloat(row[56]),
          exsess_hydro:    toFloat(row[57]),
          dextoor:         toFloat(row[58]),
          ltr:             toFloat(row[59]),
          diresol_black_kas: toFloat(row[60]),
          sansul_sdc:      toFloat(row[61]),
          caustic_2:       toFloat(row[62]),
          dextros:         toFloat(row[63]),
          solopol_2:       toFloat(row[64]),
          primasol_2:      toFloat(row[65]),
          serawet_2:       toFloat(row[66]),
          cottoclarin_3:   toFloat(row[67]),
          saneutral:       toFloat(row[68]),
          dextrose_adjust: toFloat(row[69]),
          optifik_rsl:     toFloat(row[70]),
          ekalin_f:        toFloat(row[71]),
          solopol_phtr:    toFloat(row[72]),
          moisture_mahlo:  toFloat(row[73]),
          temp_dryer:      toFloat(row[74]),
          temp_mid_dryer:  toFloat(row[75]),
          temp_size_box_1: toFloat(row[76]),
          temp_size_box_2: toFloat(row[77]),
          size_box_1:      toFloat(row[78]),
          size_box_2:      toFloat(row[79]),
          squeezing_roll_1: toFloat(row[80]),
          squeezing_roll_2: toFloat(row[81]),
          immersion_roll:  toFloat(row[82]),
          dryer:           toFloat(row[83]),
          take_off:        toFloat(row[84]),
          winding:         toFloat(row[85]),
          press_beam:      toFloat(row[86]),
          hydrolic_pump_1: toFloat(row[87]),
          hydrolic_pump_2: toFloat(row[88]),
          unwinder:        toFloat(row[89]),
          dyeing_tens_wash: toFloat(row[90]),
          dyeing_tens_warna: toFloat(row[91]),
          mc_idg:          toStr(row[92]),
          strength:        toFloat(row[93]),
          elongasi_idg:    toFloat(row[94]),
          cv_pct:          toFloat(row[95]),
        },
        update: { tanggal, tgl: tanggal, kode_full: toStr(row[3]) }
      });
      ok++;
      if (ok % 100 === 0) console.log(`  ${ok} imported...`);
    } catch (e: any) {
      errors++;
      if (errors <= 5) console.error(`  Row ${i+1} KP=${kp}: ${e.message}`);
    }
  }
  console.log(`INDIGO done: ${ok} imported, ${skipped} skipped, ${errors} errors`);
}

async function importWeaving() {
  console.log('\n=== Importing WEAVING from CSV ===');
  const csvRaw = fs.readFileSync(WEAVING_CSV_PATH, 'utf-8');
  const rows = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ';',
    bom: true,
  });

  let ok = 0, skipped = 0, errors = 0;

  for (const row of rows) {
    const kp = toStr(row['KP']);
    if (!kp) { skipped++; continue; }
    const tanggal = parseISODate(row['TANGGAL']);
    if (!tanggal) { skipped++; continue; }
    const shift = toStr(row['SHIFT']) ?? '';
    const machine = toStr(row['MACHINE']) ?? '';

    try {
      await prisma.weavingRecord.upsert({
        where: {
          kp_tanggal_shift_machine: { kp, tanggal, shift, machine }
        },
        create: {
          kp, tanggal, tgl: tanggal, shift, machine,
          warp_supplier:    toStr(row['WARP SUPPLIER']),
          sizing:           toStr(row['SIZING']),
          beam:             toInt(row['BEAM']),
          kode_kain:        toStr(row['KODE KAIN']),
          operator:         toStr(row['OPERATOR']),
          a_pct:            toFloat(row['A%']),
          p_pct:            toFloat(row['P%']),
          rpm:              toFloat(row['RPM']),
          kpicks:           toFloat(row['KPICKS']),
          meters:           toFloat(row['METERS']),
          warp_no:          toInt(row['WARP NO']),
          warp_stop_hr:     toFloat(row['WARP STOP/HR']),
          warp_per_stop:    toFloat(row['WARP/STOP']),
          weft_no:          toInt(row['WEFT NO']),
          weft_stop_hr:     toFloat(row['WEFT STOP/HR']),
          weft_per_stop:    toFloat(row['WEFT/STOP']),
          bobbin_no:        toInt(row['BOBBIN NO']),
          bobbin_stop_hr:   toFloat(row['BOBBIN STOP/HR']),
          bobbin_per_stop:  toFloat(row['BOBBIN/STOP']),
          other_stops_no:   toInt(row['OTHER STOPS NO']),
          other_stops_time: toStr(row['OTHER STOPS TIME']),
          long_stops_no:    toInt(row['LONG STOPS NO']),
          long_stops_time:  toStr(row['LONG STOPS TIME']),
          m_s:              toFloat(row['M/S']),
          b_hr:             toFloat(row['B/HR']),
          merk:             toStr(row['MERK']),
          area:             toStr(row['AREA']),
          stattempt_no:       toInt(row['STATTEMPT NO']),
          stattempt_stop_hr:  toFloat(row['STATTEMPT STOP/HR']),
          stattempt_per_stop: toFloat(row['STATTEMPT/STOP']),
          source:           'HISTORICAL',
        },
        update: {
          a_pct:  toFloat(row['A%']),
          p_pct:  toFloat(row['P%']),
          meters: toFloat(row['METERS']),
          beam:   toInt(row['BEAM']),
        }
      });
      ok++;
      if (ok % 500 === 0) console.log(`  ${ok} imported...`);
    } catch (e: any) {
      errors++;
      if (errors <= 5) console.error(`  KP=${kp} ${tanggal} shift=${shift} machine=${machine}: ${e.message}`);
    }
  }
  console.log(`WEAVING done: ${ok} imported, ${skipped} skipped, ${errors} errors`);
}

async function main() {
  await truncateAll();
  await importSacon();
  await importWarping();
  await importIndigo();
  await importWeaving();
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
