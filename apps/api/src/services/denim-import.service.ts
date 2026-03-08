import * as XLSX from 'xlsx';

// Import prisma the same way it is imported in the existing route files
import { prisma } from '../lib/prisma';

const CHUNK_SIZE = 500; // Insert 500 rows at a time to avoid memory issues

// ─── HELPER: chunk an array into batches ───────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── HELPER: parse an Excel file buffer into rows ──────────────────────────
function parseExcel(buffer: Buffer, sheetIndex = 0): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[sheetIndex];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: null });
}

// Special parser for files where real headers are in row 1 (not row 0)
// This happens when Excel files use merged cells in the header area.
// Row 0 becomes __EMPTY_N placeholders; row 1 has the actual column names.
function parseExcelWithRemappedHeaders(
  buffer: Buffer,
  sheetIndex = 0
): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[sheetIndex];
  const worksheet = workbook.Sheets[sheetName];

  // Get all rows including the header rows
  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    header: 1,  // Return as array of arrays, not objects
  });

  if (raw.length < 3) return [];

  // Row 0 = actual CSV column keys (A, B, C... or __EMPTY_N)
  // Row 1 = real human-readable column names
  // Row 2+ = actual data

  // Build header array from row 1 values (the real column names)
  const headerRow = raw[1] as any[];
  const headers: string[] = headerRow.map((h: any) =>
    h !== null && h !== undefined ? String(h).trim() : ''
  );

  // Convert data rows (row 2 onwards) to objects using the real headers
  const dataRows: Record<string, any>[] = [];
  for (let i = 2; i < raw.length; i++) {
    const rowArr = raw[i] as any[];
    const obj: Record<string, any> = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      if (key) {
        obj[key] = rowArr[j] !== undefined ? rowArr[j] : null;
      }
    }
    dataRows.push(obj);
  }

  return dataRows;
}

// ─── HELPER: safely parse a date value from Excel ──────────────────────────
function toDate(val: any): Date | null {
  if (val === null || val === undefined || val === '') return null;

  // Already a Date object (xlsx with cellDates:true)
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // Excel serial number (e.g. 44660)
  if (typeof val === 'number') {
    // Excel serial: days since 1900-01-01 (with leap year bug)
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    return isNaN(date.getTime()) ? null : date;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Try direct parse first (handles ISO, US formats)
  const direct = new Date(str);
  if (!isNaN(direct.getTime())) return direct;

  // Try DD/MM/YYYY format (common in many countries)
  const ddmmMatch = str.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (ddmmMatch) {
    const day = parseInt(ddmmMatch[1]);
    const month = parseInt(ddmmMatch[2]) - 1;
    let year = parseInt(ddmmMatch[3]);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Try "9-Apr-22" or "09-Apr-2022" format
  const monthNames: Record<string, number> = {
    jan:0, feb:1, mar:2, apr:3, may:4, jun:5,
    jul:6, aug:7, sep:8, oct:9, nov:10, dec:11
  };
  const dmyMatch = str.match(/^(\d{1,2})[-\/\s]([a-zA-Z]{3,})[-\/\s](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const month = monthNames[dmyMatch[2].toLowerCase().slice(0, 3)];
    let year = parseInt(dmyMatch[3]);
    if (year < 100) year += 2000;
    if (month !== undefined) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try "Apr-22" or "Apr 22" (month-year only, set day to 1)
  const myMatch = str.match(/^([a-zA-Z]{3,})[-\/\s](\d{2,4})$/);
  if (myMatch) {
    const month = monthNames[myMatch[1].toLowerCase().slice(0, 3)];
    let year = parseInt(myMatch[2]);
    if (year < 100) year += 2000;
    if (month !== undefined) {
      const d = new Date(year, month, 1);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// ─── HELPER: safely parse a number ─────────────────────────────────────────
function toNum(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

// ─── HELPER: safely parse a string ─────────────────────────────────────────
function toStr(val: any): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT: Sales Contract
// Expected columns: TGL, KP, Permintaan, CODENAME, Kons Kode, KODE, Kat Kode,
//   Ket CT/WS, Ket Warna, Status, TE, SISIR, P (Kons), Ne K Lusi, Ne Lusi,
//   Sp Lusi, Lot Lusi, Ne K Pakan, Ne Pakan, Sp Pakan, J, J/C, B/C,
//   TB, BALE LUSI, TOTAL PAKAN, BALE PAKAN, TS, SACON, ACC / TIDAK ACC,
//   PROSES, Foto Sacon, Remarks
// ═══════════════════════════════════════════════════════════════════════════
export async function importSalesContracts(
  buffer: Buffer,
  sheetIndex = 0
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const rows = parseExcel(buffer, sheetIndex);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  const validRows: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const kp = toStr(row['KP']);
    if (!kp) {
      errors.push(`Row ${i + 2}: missing KP — skipped`);
      continue;
    }
    const tgl = toDate(row['TGL']);
    if (!tgl) {
      errors.push(`Row ${i + 2} (KP=${kp}): invalid TGL — skipped`);
      continue;
    }

    validRows.push({
      kp,
      tgl,
      permintaan:  toStr(row['Permintaan']),
      codename:    toStr(row['CODENAME']),
      kons_kode:   toStr(row['Kons Kode']),
      kode_number: toStr(row['KODE']),
      kat_kode:    toStr(row['Kat Kode']),
      ket_ct_ws:   toStr(row['Ket CT /WS']),
      ket_warna:   toStr(row['Ket Warna']),
      status:      toStr(row['Status']),
      te:          toNum(row['TE']),
      sisir:       toStr(row['SISIR']),
      p_kons:      toStr(row['P (Kons)']),
      ne_k_lusi:   toStr(row['Ne K Lusi']),
      ne_lusi:     toNum(row['Ne Lusi']),
      sp_lusi:     toStr(row['Sp Lusi']),
      lot_lusi:    toStr(row['Lot Lusi']),
      ne_k_pakan:  toStr(row['Ne K Pakan']),
      ne_pakan:    toNum(row['Ne Pakan']),
      sp_pakan:    toStr(row['Sp Pakan']),
      j:           toNum(row['J']),
      j_c:         toNum(row['J/C']),
      b_c:         toNum(row['B/C']),
      tb:          toNum(row['TB']),
      bale_lusi:   toNum(row['BALE LUSI']),
      total_pakan: toNum(row['TOTAL PAKAN']),
      bale_pakan:  toNum(row['BALE PAKAN']),
      ts:          toDate(row['TS']),
      sacon:       row['SACON'] === true || row['SACON'] === 'TRUE',
      acc:         toStr(row['ACC / TIDAK ACC']),
      proses:      toStr(row['PROSES']),
      foto_sacon:  toStr(row['Foto Sacon']),
      remarks:     toStr(row['Remarks']),
    });
  }

  const chunks = chunkArray(validRows, CHUNK_SIZE);
  for (const chunk of chunks) {
    const result = await prisma.salesContract.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += result.count;
    skipped += chunk.length - result.count;
  }

  return { inserted, skipped, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT: Warping
// Expected columns: TGL, KP, START, STOP, KODE, BENANG, LOT, SP, PT, TE,
//   RPM, MTR/MIN, TOTAL PUTUSAN, DATA PUTUSAN, No beam 1 .. No beam 15,
//   PUTUSAN 1 .. PUTUSAN 15, Total Beam, 1 CN, Jam, Total Waktu,
//   EFF WARPING, NO MC, ELONGASI, STRENGTH, CV%, TENSION BADAN,
//   TENSION PINGGIR, LEBAR CREEL
// ═══════════════════════════════════════════════════════════════════════════
export async function importWarping(
  buffer: Buffer,
  sheetIndex = 0
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const rows = parseExcel(buffer, sheetIndex);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Pre-load all existing WarpingRun KPs into a Set for O(1) lookups
  const existingWarping = await prisma.warpingRun.findMany({
    select: { kp: true }
  });
  const existingWarpingKps = new Set(existingWarping.map(r => r.kp));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const kp = toStr(row['KP']);
    if (!kp) {
      errors.push(`Row ${i + 2}: missing KP — skipped`);
      continue;
    }
    const tgl = toDate(row['TGL']);
    if (!tgl) {
      errors.push(`Row ${i + 2} (KP=${kp}): invalid TGL — skipped`);
      continue;
    }

    // Check if WarpingRun already exists for this KP — skip if so (using pre-loaded Set)
    if (existingWarpingKps.has(kp)) {
      skipped++;
      continue;
    }

    // Parse efficiency — might be "69%" or 0.69 or 69
    let effRaw = row['EFF WARPING'];
    let effWarping: number | null = null;
    if (effRaw !== null && effRaw !== undefined) {
      const effStr = String(effRaw).replace('%', '').trim();
      const effNum = parseFloat(effStr);
      if (!isNaN(effNum)) {
        effWarping = effNum > 1 ? effNum / 100 : effNum;
      }
    }

    try {
      // Create WarpingRun
      const warpingRun = await prisma.warpingRun.create({
        data: {
          kp,
          tgl,
          start_time:     toStr(row['START']),
          stop_time:      toStr(row['STOP']),
          kode_full:      toStr(row['KODE']),
          benang:         toStr(row['BENANG']),
          lot:            toStr(row['LOT']),
          sp:             toStr(row['SP']),
          pt:             toNum(row['PT']) ? Math.round(toNum(row['PT'])!) : null,
          te:             toNum(row['TE']),
          rpm:            toNum(row['RPM']) ? Math.round(toNum(row['RPM'])!) : null,
          mtr_min:        toNum(row['MTR/MIN']),
          total_putusan:  toNum(row['TOTAL PUTUSAN']) ? Math.round(toNum(row['TOTAL PUTUSAN'])!) : null,
          data_putusan:   toStr(row['DATA PUTUSAN']),
          total_beam:     toNum(row['Total Beam']) ? Math.round(toNum(row['Total Beam'])!) : null,
          cn_1:           toNum(row['1 CN']),
          jam:            toNum(row['Jam']),
          total_waktu:    toNum(row['Total Waktu']),
          eff_warping:    effWarping,
          no_mc:          toNum(row['NO MC']) ? Math.round(toNum(row['NO MC'])!) : null,
          elongasi:       toNum(row['ELONGASI']),
          strength:       toNum(row['STRENGTH']),
          cv_pct:         toNum(row['CV%']),
          tension_badan:  toNum(row['TENSION BADAN']) ? Math.round(toNum(row['TENSION BADAN'])!) : null,
          tension_pinggir: toNum(row['TENSION PINGGIR']) ? Math.round(toNum(row['TENSION PINGGIR'])!) : null,
          lebar_creel:    toNum(row['LEBAR CREEL']) ? Math.round(toNum(row['LEBAR CREEL'])!) : null,
        },
      });

      inserted++;

      // Add KP to the Set so subsequent rows with same KP are skipped
      existingWarpingKps.add(kp);

      // Create WarpingBeam rows for each beam slot 1–15
      const beamData: any[] = [];
      for (let b = 1; b <= 15; b++) {
        const beamNum = toNum(row[`No\nbeam ${b}`]);
        if (beamNum === null) continue; // empty slot
        beamData.push({
          warping_run_id: warpingRun.id,
          kp,
          position:    b,
          beam_number: Math.round(beamNum),
          putusan:     toNum(row[`PUTUSAN ${b}`]) ? Math.round(toNum(row[`PUTUSAN ${b}`])!) : null,
        });
      }

      if (beamData.length > 0) {
        await prisma.warpingBeam.createMany({
          data: beamData,
          skipDuplicates: true,
        });
      }

    } catch (err: any) {
      errors.push(`Row ${i + 2} (KP=${kp}): ${err.message}`);
    }
  }

  return { inserted, skipped, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT: Indigo
// Expected columns: TANGGAL, MC, KP, CODE, NE, P, TE, BB, SPEED,
//   BAK CELUP, BAK SULFUR, + all chemical columns + machine settings
//   + BAK 1 .. BAK 16
// ═══════════════════════════════════════════════════════════════════════════
export async function importIndigo(
  buffer: Buffer,
  sheetIndex = 0
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const rows = parseExcelWithRemappedHeaders(buffer, sheetIndex);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Pre-load all existing IndigoRun KPs into a Set for O(1) lookups
  const existingIndigo = await prisma.indigoRun.findMany({
    select: { kp: true }
  });
  const existingIndigoKps = new Set(existingIndigo.map(r => r.kp));

  // Only allow KPs that exist in SalesContract (ensures traceability)
  const validSalesKps = await prisma.salesContract.findMany({
    select: { kp: true }
  });
  const validKpsIndigo = new Set(validSalesKps.map(r => r.kp));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const kp = toStr(row['KP']);
    if (!kp) {
      errors.push(`Row ${i + 2}: missing KP — skipped`);
      continue;
    }

    // Skip if IndigoRun already exists for this KP (using pre-loaded Set)
    if (existingIndigoKps.has(kp)) {
      skipped++;
      continue;
    }

    if (!validKpsIndigo.has(kp)) {
      errors.push(`Row ${i + 2} (KP=${kp}): no SalesContract found — skipped`);
      skipped++;
      continue;
    }

    const tanggal = toDate(row['TANGGAL']);
    if (!tanggal) {
      errors.push(`Row ${i + 2} (KP=${kp}): invalid TANGGAL — skipped`);
      continue;
    }

    try {
      await prisma.indigoRun.create({
        data: {
          kp,
          tanggal,
          mc:              toNum(row['MC']) ? Math.round(toNum(row['MC'])!) : null,
          kode_full:       toStr(row['CODE']),
          ne:              toStr(row['NE']),
          p:               toNum(row['P']),
          te:              toNum(row['TE']) ? Math.round(toNum(row['TE'])!) : null,
          bb:              toNum(row['BB']),
          speed:           toNum(row['SPEED']) ? Math.round(toNum(row['SPEED'])!) : null,
          bak_celup:       toNum(row['BAK CELUP']) ? Math.round(toNum(row['BAK CELUP'])!) : null,
          bak_sulfur:      toNum(row['BAK SULFUR']) ? Math.round(toNum(row['BAK SULFUR'])!) : null,
          konst_idg:       toNum(row['KONST IDG']),
          konst_sulfur:    toNum(row['KONST SULFUR']),
          visc:            toNum(row['VISC']),
          ref:             toNum(row['REF']),
          size_box:        toNum(row['SIZE BOX']),
          scoring:         toNum(row['SCORING']) ? Math.round(toNum(row['SCORING'])!) : null,
          jetsize:         toNum(row['JETSIZE']),
          // Sizing chemicals
          polisize_hs:     toNum(row['POLISIZE HS']),
          polisize_1_2:    toNum(row['POLISIZE 1.2']),
          armosize:        toNum(row['ARMOSIZE']),
          armosize_1_1:    toNum(row['ARMOSIZE 1.1']),
          armosize_1_2:    toNum(row['ARMOSIZE 1.2']),
          armosize_1_3:    toNum(row['ARMOSIZE 1.3']),
          armosize_1_5:    toNum(row['ARMOSIZE 1.5']),
          armosize_1_7:    toNum(row['ARMOSIZE 1.7']),
          quqlaxe:         toNum(row['QUQLAXE']),
          armo_c:          toNum(row['ARMO C']),
          vit_e:           toNum(row['VIT E']),
          armo_d:          toNum(row['ARMO D']),
          tapioca:         toNum(row['TAPIOCA']),
          a_308:           toNum(row['A 308']),
          // Dye chemicals
          indigo:              toNum(row['INDIGO']),
          caustic:             toNum(row['CAUSTIC']),
          hydro:               toNum(row['HYDRO']),
          solopol:             toNum(row['SOLOPOL']),
          serawet:             toNum(row['SERAWET']),
          primasol:            toNum(row['PRIMASOL']),
          cottoclarin:         toNum(row['COTTOCLARIN']),
          setamol:             toNum(row['SETAMOL']),
          granular:            toNum(row['GRANULAR']),
          granule:             toNum(row['GRANULE']),
          grain:               toNum(row['GRAIN']),
          wet_matic:           toNum(row['WET MATIC']),
          fisat:               toNum(row['FISAT']),
          breviol:             toNum(row['BREVIOL']),
          csk:                 toNum(row['CSK']),
          comee:               toNum(row['COMEE']),
          dirsol_rdp:          toNum(row['DIRSOL RDP']),
          primasol_nf:         toNum(row['PRIMASOL NF']),
          zolopol_phtr:        toNum(row['ZOLOPOL PHTR/ZB']),
          cottoclarin_2:       toNum(row['COTTOCLARIN_2']),
          sanwet:              toNum(row['SANWET']),
          marcerize_caustic:   toNum(row['MARCERIZE COUSTIC']),
          sanmercer:           toNum(row['SANMERCER']),
          sancomplex:          toNum(row['SANCOMPLEX']),
          exsess_caustic:      toNum(row['EXSESS CAUSTIC']),
          exsess_hydro:        toNum(row['EXSESS HYDRO']),
          dextoor:             toNum(row['DEXTOOR']),
          ltr:                 toNum(row['LTR']),
          diresol_black_kas:   toNum(row['DIRESOL BLACK KAS (ROTKAS)']),
          sansul_sdc:          toNum(row['SANSUL SDC']),
          caustic_2:           toNum(row['CAUSTIC_2']),
          dextros:             toNum(row['DEXTROS']),
          solopol_2:           toNum(row['SOLOPOL_2']),
          primasol_2:          toNum(row['PRIMASOL_2']),
          serawet_2:           toNum(row['SERAWET_2']),
          cottoclarin_3:       toNum(row['COTTOCLARIN_3']),
          saneutral:           toNum(row['SANEUTRAL']),
          dextrose_adjust:     toNum(row['DEXTROSE (ADJUST)']),
          optifik_rsl:         toNum(row['OPTIFIK RSL']),
          ekalin_f:            toNum(row['EKALIN F']),
          solopol_phtr:        toNum(row['SOLOPOL PHTR']),
          // Machine settings
          moisture_mahlo:      toNum(row['MOISTURE MAHLO']),
          temp_dryer:          toNum(row['TEMP DRYER']),
          temp_mid_dryer:      toNum(row['TEMP MID DRYER']),
          temp_size_box_1:     toNum(row['TEMP SIZE BOX 1']),
          temp_size_box_2:     toNum(row['TEMP SIZE BOX 2']),
          size_box_1:          toNum(row['SIZE BOX 1']),
          size_box_2:          toNum(row['SIZE BOX 2']),
          squeezing_roll_1:    toNum(row['SQUEEZING ROLL 1']),
          squeezing_roll_2:    toNum(row['SQUEEZING ROLL 2']),
          immersion_roll:      toNum(row['IMMERSION ROLL']),
          dryer:               toNum(row['DRYER']),
          take_off:            toNum(row['TAKE OFF']),
          winding:             toNum(row['WINDING']),
          press_beam:          toNum(row['PRESS BEAM']),
          hardness:            toNum(row['HARDNESS']),
          hydrolic_pump_1:     toNum(row['HYDROLIC PUMP 1']),
          hydrolic_pump_2:     toNum(row['HYDROLIC PUMP 2']),
          unwinder:            toNum(row['UNWINDER']),
          dyeing_tens_wash:    toNum(row['DYEING TENS WASH']),
          dyeing_tens_warna:   toNum(row['DYEING TENS WARNA']),
          // Quality output
          mc_idg:        toStr(row['MC IDG']),
          strength:      toNum(row['STRENGTH']),
          elongasi_idg:  toNum(row['ELONGASI IDG']),
          cv_pct:        toNum(row['CV%']),
          tenacity:      toNum(row['TENACITY']),
          // BAK vats 1–16
          bak_1:   toNum(row['BAK 1']),
          bak_2:   toNum(row['BAK 2']),
          bak_3:   toNum(row['BAK 3']),
          bak_4:   toNum(row['BAK 4']),
          bak_5:   toNum(row['BAK 5']),
          bak_6:   toNum(row['BAK 6']),
          bak_7:   toNum(row['BAK 7']),
          bak_8:   toNum(row['BAK 8']),
          bak_9:   toNum(row['BAK 9']),
          bak_10:  toNum(row['BAK 10']),
          bak_11:  toNum(row['BAK 11']),
          bak_12:  toNum(row['BAK 12']),
          bak_13:  toNum(row['BAK 13']),
          bak_14:  toNum(row['BAK 14']),
          bak_15:  toNum(row['BAK 15']),
          bak_16:  toNum(row['BAK 16']),
        },
      });

      inserted++;

      // Add KP to the Set so subsequent rows with same KP are skipped
      existingIndigoKps.add(kp);
    } catch (err: any) {
      errors.push(`Row ${i + 2} (KP=${kp}): ${err.message}`);
    }
  }

  return { inserted, skipped, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT: Weaving (called daily — small batches)
// Expected columns: TANGGAL, SHIFT, MACHINE, KP, WARP SUPPLIER, SIZING,
//   BEAM, KODE KAIN, OPERATOR, A%, P%, RPM, KPICKS, METERS,
//   WARP NO, WARP STOP/HR, WARP/STOP,
//   WEFT NO, WEFT STOP/HR, WEFT/STOP,
//   BOBBIN NO, BOBBIN STOP/HR, BOBBIN/STOP,
//   STATTEMPT NO, STATTEMPT STOP/HR, STATTEMPT/STOP,
//   OTHER STOPS NO, OTHER STOPS TIME,
//   LONG STOPS NO, LONG STOPS TIME,
//   M/S, B/HR, MERK, AREA
// ═══════════════════════════════════════════════════════════════════════════
export async function importWeaving(
  buffer: Buffer,
  sheetIndex = 0
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const rows = parseExcel(buffer, sheetIndex);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Pre-load all WarpingBeams into a Map for O(1) lookups
  // Key format: "KP:beam_number" e.g. "BSPD:867"
  const allBeams = await prisma.warpingBeam.findMany({
    select: { id: true, kp: true, beam_number: true }
  });
  const beamMap = new Map<string, number>();
  for (const b of allBeams) {
    beamMap.set(`${b.kp}:${b.beam_number}`, b.id);
  }

  // Only allow KPs that exist in SalesContract (ensures traceability)
  const validSalesKpsWeaving = await prisma.salesContract.findMany({
    select: { kp: true }
  });
  const validKpsWeaving = new Set(validSalesKpsWeaving.map(r => r.kp));

  const validRows: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const kp = toStr(row['KP']);
    if (!kp) {
      errors.push(`Row ${i + 2}: missing KP — skipped`);
      continue;
    }
    const tanggal = toDate(row['TANGGAL']);
    if (!tanggal) {
      errors.push(`Row ${i + 2} (KP=${kp}): invalid TANGGAL — skipped`);
      continue;
    }
    const shift = toNum(row['SHIFT']);
    const machine = toStr(row['MACHINE']);
    const beam = toNum(row['BEAM']);
    if (!shift || !machine || beam === null) {
      errors.push(`Row ${i + 2} (KP=${kp}): missing SHIFT, MACHINE, or BEAM — skipped`);
      continue;
    }

    if (!validKpsWeaving.has(kp)) {
      errors.push(`Row ${i + 2} (KP=${kp}): no SalesContract found — skipped`);
      skipped++;
      continue;
    }

    // Resolve warping_beam_id using pre-loaded Map (O(1) lookup)
    const beamKey = `${kp}:${Math.round(beam)}`;
    const warpingBeamId = beamMap.get(beamKey) ?? null;

    validRows.push({
      kp,
      tanggal,
      shift:            Math.round(shift),
      machine,
      warp_supplier:    toStr(row['WARP SUPPLIER']),
      sizing:           toStr(row['SIZING']),
      beam:             Math.round(beam),
      kode_kain:        toStr(row['KODE KAIN']),
      operator:         toStr(row['OPERATOR']),
      a_pct:            toNum(row['A%']),
      p_pct:            toNum(row['P%']),
      rpm:              toNum(row['RPM']),
      kpicks:           toNum(row['KPICKS']),
      meters:           toNum(row['METERS']),
      warp_no:          toNum(row['WARP NO']) ? Math.round(toNum(row['WARP NO'])!) : null,
      warp_stop_hr:     toNum(row['WARP STOP/HR']),
      warp_per_stop:    toNum(row['WARP/STOP']),
      weft_no:          toNum(row['WEFT NO']) ? Math.round(toNum(row['WEFT NO'])!) : null,
      weft_stop_hr:     toNum(row['WEFT STOP/HR']),
      weft_per_stop:    toNum(row['WEFT/STOP']),
      bobbin_no:        toNum(row['BOBBIN NO']) ? Math.round(toNum(row['BOBBIN NO'])!) : null,
      bobbin_stop_hr:   toNum(row['BOBBIN STOP/HR']),
      bobbin_per_stop:  toNum(row['BOBBIN/STOP']),
      stattempt_no:        toNum(row['STATTEMPT NO']) ? Math.round(toNum(row['STATTEMPT NO'])!) : null,
      stattempt_stop_hr:   toNum(row['STATTEMPT STOP/HR']),
      stattempt_per_stop:  toNum(row['STATTEMPT/STOP']),
      other_stops_no:   toNum(row['OTHER STOPS NO']) ? Math.round(toNum(row['OTHER STOPS NO'])!) : null,
      other_stops_time: toStr(row['OTHER STOPS TIME']),
      long_stops_no:    toNum(row['LONG STOPS NO']) ? Math.round(toNum(row['LONG STOPS NO'])!) : null,
      long_stops_time:  toStr(row['LONG STOPS TIME']),
      m_s:              toNum(row['M/S']),
      b_hr:             toNum(row['B/HR']),
      merk:             toStr(row['MERK']),
      area:             toStr(row['AREA']),
      warping_beam_id:  warpingBeamId,
    });
  }

  const chunks = chunkArray(validRows, CHUNK_SIZE);
  for (const chunk of chunks) {
    const result = await prisma.weavingRecord.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += result.count;
    skipped += chunk.length - result.count;
  }

  return { inserted, skipped, errors };
}
