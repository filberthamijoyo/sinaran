import * as XLSX from 'xlsx'
import { PrismaClient, Prisma } from '@prisma/client'
import * as path from 'path'

const prisma = new PrismaClient()

function toDecimal(v: any): Prisma.Decimal | null {
  if (v == null || v === '' || v === '-' || isNaN(Number(v))) return null
  return new Prisma.Decimal(Number(v))
}
function toInt(v: any): number | null {
  if (v == null || v === '' || v === '-' || isNaN(Number(v))) return null
  return Math.round(Number(v))
}
function toStr(v: any): string | null {
  if (v == null || v === '') return null
  return String(v).trim()
}

async function importLots(wb: XLSX.WorkBook) {
  console.log('\n--- Importing Lots ---')
  // SPK sheet: row 0 = headers, data starts row 1
  // Column index 3 = "Lot"
  const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets['SPK'], { header: 1, defval: null })
  const seen = new Set<number>()
  let created = 0
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const lotNum = row[3] // "Lot" is at column index 3
    if (lotNum == null || isNaN(Number(lotNum))) continue
    const code = Math.round(Number(lotNum))
    if (seen.has(code)) continue
    seen.add(code)
    await prisma.lot.upsert({
      where: { code },
      update: {},
      create: { code, name: String(code) }
    })
    created++
  }
  console.log(`Lots: ${created} upserted`)
}

async function importSpks(wb: XLSX.WorkBook) {
  console.log('\n--- Importing SPKs + Fiber Usages ---')
  // SPK sheet: row 0 = headers, data starts row 1
  // Col index 4 = "SPK", 28 = "IN (KG)", 30 = "Menghasilkan", 42 = "WASTE", 43 = "LOSS", 44 = "TTL LOSS"
  const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets['SPK'], { header: 1, defval: null })
  let spkCreated = 0, fiberCreated = 0

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const spkName = toStr(row[4]) // "SPK" at col 4
    if (!spkName) continue

    // Lot — col 3 = "Lot"
    let lotId: number | null = null
    const lotNum = row[3]
    if (lotNum != null && !isNaN(Number(lotNum))) {
      const code = Math.round(Number(lotNum))
      const lot = await prisma.lot.findFirst({ where: { code } })
      if (lot) lotId = lot.id
    }

    const existing = await prisma.spk.findFirst({ where: { name: spkName } })
    if (existing) continue

    const spk = await prisma.spk.create({
      data: {
        name: spkName,
        lot_id: lotId,
        mills_unit_id: undefined,
        weight_issued_to_blow_room: toDecimal(row[28]),    // "IN (KG)" at col 28
        yarn_produced_yield_percent:  toDecimal(row[30]),   // "Menghasilkan" at col 30
        hard_waste:                  toDecimal(row[42]),   // "WASTE" at col 42
        invisible:                   toDecimal(row[43]),   // "LOSS" at col 43
        total_waste_and_invisible:   toDecimal(row[44]),  // "TTL LOSS" at col 44
      }
    })
    spkCreated++

    // Fiber mixtures: col pairs 5/6, 7/8, 9/10, 11/12, 13/14, 15/16, 17/18, 19/20, 21/22, 23/24, 25/26
    for (let fi = 0; fi < 11; fi++) {
      const fiberNameIdx = 5 + fi * 2
      const fiberPctIdx  = 6 + fi * 2
      const fiberName = toStr(row[fiberNameIdx])
      const fiberPct  = toDecimal(row[fiberPctIdx])
      if (!fiberName || !fiberPct) continue

      const safeCode = fiberName.length > 50 ? fiberName.substring(0, 50) : fiberName
      let ft = await prisma.fiber_types.findFirst({ where: { code: safeCode } })
      if (!ft) {
        ft = await prisma.fiber_types.create({ data: { code: safeCode, name: fiberName } })
      }

      await prisma.spk_fiber_usages.upsert({
        where: { spk_id_fiber_type_id: { spk_id: spk.id, fiber_type_id: ft.id } },
        update: { weight: fiberPct },
        create: { spk_id: spk.id, fiber_type_id: ft.id, weight: fiberPct }
      })
      fiberCreated++
    }
  }
  console.log(`SPKs: ${spkCreated} created, Fiber usages: ${fiberCreated}`)
}

async function importProductionRecords(wb: XLSX.WorkBook) {
  console.log('\n--- Importing Production Records ---')
  // data produksi harian: row 0 = main headers, row 1 = sub-headers, data starts row 2
  const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets['data produksi harian'], { defval: null, range: 1 })

  // Data starts at row 2 (row 0=main headers, row 1=sub-headers, row 2+=data)

  // Ensure base lookup entries exist
  let muOE   = await prisma.millsUnit.findFirst({ where: { name: 'OE' } })
  if (!muOE)   muOE   = await prisma.millsUnit.upsert({ where: { code: 1 }, update: {}, create: { code: 1, name: 'OE',   letterCode: 'OE' } })
  let muRING = await prisma.millsUnit.findFirst({ where: { name: 'RING' } })
  if (!muRING) muRING = await prisma.millsUnit.upsert({ where: { code: 2 }, update: {}, create: { code: 2, name: 'RING', letterCode: 'RIN' } })

  let ytE  = await prisma.yarnType.findFirst({ where: { name: 'E' } })
  if (!ytE)  ytE  = await prisma.yarnType.upsert({ where: { code: 1 }, update: {}, create: { code: 1, name: 'E',   letterCode: 'E' } })
  let ytS  = await prisma.yarnType.findFirst({ where: { name: 'S' } })
  if (!ytS)  ytS  = await prisma.yarnType.upsert({ where: { code: 2 }, update: {}, create: { code: 2, name: 'S',   letterCode: 'S' } })

  let cnFallback = await prisma.countNe.findFirst()
  if (!cnFallback) {
    cnFallback = await prisma.countNe.create({ data: { value: new Prisma.Decimal(10) } })
  }

  let created = 0, skipped = 0

  for (const row of rows) {
    const rawDate = row['Date']
    if (rawDate == null) { skipped++; continue }

    let productionDate: Date
    if (rawDate instanceof Date) {
      productionDate = rawDate
    } else if (typeof rawDate === 'number') {
      const d = XLSX.SSF.parse_date_code(rawDate)
      productionDate = new Date(d.y, d.m - 1, d.d)
    } else {
      productionDate = new Date(String(rawDate))
    }
    if (isNaN(productionDate.getTime())) { skipped++; continue }

    const year = productionDate.getFullYear()
    const month = productionDate.getMonth() + 1
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    const unitName   = toStr(row['Unit Pabrik'])
    const yarnName   = toStr(row['Yarn Jenis Benang'])
    const countNeVal = row['Count (Ne)']
    if (!unitName || !yarnName || countNeVal == null) { skipped++; continue }

    // Mills unit
    let mu = await prisma.millsUnit.findFirst({ where: { name: unitName } })
    if (!mu) {
      const max = await prisma.millsUnit.aggregate({ _max: { code: true } })
      mu = await prisma.millsUnit.create({
        data: { code: (max._max.code ?? 0) + 1, name: unitName, letterCode: unitName.substring(0,3) }
      })
    }

    // Yarn type
    let yt = await prisma.yarnType.findFirst({ where: { name: yarnName } })
    if (!yt) {
      const max = await prisma.yarnType.aggregate({ _max: { code: true } })
      yt = await prisma.yarnType.create({
        data: { code: (max._max.code ?? 0) + 1, name: yarnName, letterCode: yarnName.substring(0,3) }
      })
    }

    // Count Ne
    const countNeDecimal = new Prisma.Decimal(Number(countNeVal))
    let cn = await prisma.countNe.findFirst({ where: { value: countNeDecimal } })
    if (!cn) cn = await prisma.countNe.create({ data: { value: countNeDecimal } })

    // Lot — "Lot Benang"
    const lotRaw = row['Lot Benang']
    let lotId: number | null = null
    if (lotRaw != null && !isNaN(Number(lotRaw))) {
      const lot = await prisma.lot.findFirst({ where: { code: Math.round(Number(lotRaw)) } })
      if (lot) lotId = lot.id
    }

    // SPK — format "3700.0/JN24/AX"
    const spkRaw = toStr(row['SPK'])
    let spkId: number | null = null
    if (spkRaw) {
      const slashIdx = spkRaw.indexOf('/')
      const spkName = slashIdx > -1 ? spkRaw.substring(slashIdx + 1) : spkRaw
      const spkRec = await prisma.spk.findFirst({ where: { name: spkName } })
      if (spkRec) spkId = spkRec.id
    }

    // Slub code — "Slub Code"
    const slubStr = toStr(row['Slub Code'])
    let slubCodeId: number | null = null
    if (slubStr && slubStr !== '-') {
      let sc = await prisma.slubCode.findFirst({ where: { code: slubStr } })
      if (!sc) sc = await prisma.slubCode.create({ data: { code: slubStr, name: slubStr } })
      slubCodeId = sc.id
    }

    // Numeric fields
    const ConeCheeseVal = toDecimal(row['Berat Cone / Cheese (Kgs)'])
    const coneCheeseKg  = ConeCheeseVal ?? new Prisma.Decimal(0)
    const tmVal        = toDecimal(row['TM']) ?? new Prisma.Decimal(0)
    const tpiVal       = toDecimal(row['TPI']) ?? new Prisma.Decimal(0)
    const speedVal     = toInt(row['Speed']) ?? 0
    const spindelsVal  = toInt(row['Jumlah Spindel / Rotor Terpasang']) ?? 0
    const conesVal     = toInt(row['Jumlah Cones / Cheese']) ?? 0
    const prodKgsVal   = toDecimal(row['Produksi (Kgs)']) ?? new Prisma.Decimal(0)
    const prodLbsVal   = toDecimal(row['Produksi (Lbs)']) ?? new Prisma.Decimal(0)
    const prodBalesVal = toDecimal(row['Aktual Produksi (Bales)']) ?? new Prisma.Decimal(0)
    const prod100Val   = toDecimal(row['100% Produksi (Bales)']) ?? new Prisma.Decimal(0)
    const targetOprVal = toDecimal(row['Target Produksi on Target OPR (Bales)']) ?? new Prisma.Decimal(0)
    const gainLossVal  = toDecimal(row['Keuntungan atau Kerugian Efisiensi Bales on Target OPS / OPR']) ?? new Prisma.Decimal(0)
    const targetOpsOpr  = toDecimal(row['Target OPS / OPR']) ?? new Prisma.Decimal(0)
    const opsAktual    = toDecimal(row['OPS/ OPR Aktual']) ?? new Prisma.Decimal(0)
    const opsWorked    = toDecimal(row['OPS / OPR Worked']) ?? new Prisma.Decimal(0)
    const effProd      = toDecimal(row['Produksi Effisiensi %']) ?? new Prisma.Decimal(0)
    const effKerja     = toDecimal(row['Effisiensi % Kerja']) ?? new Prisma.Decimal(0)
    const powerStop    = toInt(row['Power / electric (min)']) ?? null
    const countMeng    = toInt(row['Count Mengubah (min)']) ?? null
    const creelMeng    = toInt(row['Creel Mengubah (min)']) ?? null
    const prevMtc      = toInt(row['Preventive Mtc/Rotor/Ring Change Stoppage (min)']) ?? null
    const creelShort   = toInt(row['Creel Short Stoppage (min)']) ?? null
    const totalStop    = toInt(row['Total Penghentian (min)']) ?? null
    const spindBekerja  = toDecimal(row['Spindles / Rotors Bekerja']) ?? null
    const spindEff     = toDecimal(row['Spindle / Rotors Effisiensi']) ?? null
    const rugProcPower = toDecimal(row['Kerugian Produksi (Bales) Karena Power Penghentian']) ?? null
    const rugProcCount = toDecimal(row['Kerugian Produksi (Bales) Karena Count Mengubah']) ?? null
    const rugProcCreel = toDecimal(row['Kerugian Produksi (Bales) Karena Creel Mengubah']) ?? null
    const rugProcPrev  = toDecimal(row['Kerugian Produksi (Bales) Karena Preventive MTC./Rotor / Ring Cup Change']) ?? null
    const rugProcCreelSl = toDecimal(row['Kerugian Produksi (Bales) Karena Creel (Sliver/Roving) Short']) ?? null
    const rugProcTotal  = toDecimal(row['Kerugian Total']) ?? null

    await prisma.productionRecord.create({
      data: {
        productionDate: productionDate,
        month: monthStr,
        year: productionDate.getFullYear(),
        millsUnitId: mu.id,
        yarnTypeId: yt.id,
        countNeId: cn.id,
        countNeValue: countNeDecimal,
        slubCodeId,
        lotId,
        spkId,
        beratConeCheeseKg: coneCheeseKg,
        tm: tmVal,
        tpi: tpiVal,
        speed: speedVal,
        jumlahSpindelRotorTerpasang: spindelsVal,
        jumlahConesCheese: conesVal,
        produksiKgs: prodKgsVal,
        produksiLbs: prodLbsVal,
        aktualProduksiBales: prodBalesVal,
        produksi100PercentBales: prod100Val,
        targetProduksiOnTargetOprBales: targetOprVal,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: gainLossVal,
        targetOpsOpr: targetOpsOpr,
        opsOprAktual: opsAktual,
        opsOprWorked: opsWorked,
        produksiEffisiensiPercent: effProd,
        effisiensiKerjaPercent: effKerja,
        powerElectricMin: powerStop,
        countMengubahMin: countMeng,
        creelMengubahMin: creelMeng,
        preventiveMtcMin: prevMtc,
        creelShortStoppageMin: creelShort,
        totalPenghentianMin: totalStop,
        spindlesRotorsBekerja: spindBekerja,
        spindlesRotorsEffisiensi: spindEff,
        powerPenghentian: rugProcPower,
        countMengubahLoss: rugProcCount,
        creelMengubahLoss: rugProcCreel,
        preventiveMtcLoss: rugProcPrev,
        creelShortLoss: rugProcCreelSl,
        kerugianTotal: rugProcTotal,
      }
    })
    created++
    process.stdout.write(`\rProduction: ${created}`)
  }
  console.log(`\nProduction: ${created} created, ${skipped} skipped`)
}

async function importYarnTests(wb: XLSX.WorkBook) {
  console.log('\n--- Importing Yarn Tests ---')
  // USTER Yarn QC: range:4 means header is at row 4 (0-indexed), data starts at row 5
  const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets['USTER Yarn QC'], { defval: null, range: 4 })

  // Get fallback IDs
  const muFallback = await prisma.millsUnit.findFirst()
  const ytFallback = await prisma.yarnType.findFirst()
  const cnFallback = await prisma.countNe.findFirst()
  if (!muFallback || !ytFallback || !cnFallback) {
    console.log('Skipping yarn tests — missing lookup data')
    return
  }

  let created = 0
  for (const row of rows) {
    const rawDate = row['Tangall'] ?? row['Tanggal']
    if (!rawDate) continue

    let testDate: Date
    if (rawDate instanceof Date) testDate = rawDate
    else if (typeof rawDate === 'number') {
      const d = XLSX.SSF.parse_date_code(rawDate)
      testDate = new Date(d.y, d.m - 1, d.d)
    } else { testDate = new Date(rawDate) }
    if (isNaN(testDate.getTime())) continue

    // Lot — col 5 = "Lot"
    const lotStr = toStr(row['Lot'])
    let lotId: number | null = null
    if (lotStr) {
      const lotNum = parseFloat(lotStr.replace(',', '.'))
      if (!isNaN(lotNum)) {
        const lot = await prisma.lot.findFirst({ where: { code: Math.round(lotNum) } })
        if (lot) lotId = lot.id
      }
    }

    // SPK — col 6 = "SPK"
    const spkStr = toStr(row['SPK'])
    let spkId: number | null = null
    if (spkStr) {
      const spk = await prisma.spk.findFirst({ where: { name: spkStr } })
      if (spk) spkId = spk.id
    }

    // Count Ne — col 4 = "Nom. Count"
    const cnVal = row['Nom. Count']
    let cnId = cnFallback.id
    if (cnVal != null && !isNaN(Number(cnVal))) {
      const cn = await prisma.countNe.findFirst({ where: { value: new Prisma.Decimal(Number(cnVal)) } })
      if (cn) cnId = cn.id
    }

    // Yarn type — col 7 = "Yarn Type"
    const yarnTypeName = toStr(row['Yarn Type'])
    let ytId = ytFallback.id
    if (yarnTypeName) {
      const yt = await prisma.yarnType.findFirst({ where: { name: yarnTypeName } })
      if (yt) ytId = yt.id
    }

    // Count description — col 3 = "Count Description"
    const cdCode = toInt(row['Count Description']) ?? undefined

    await prisma.yarnTest.create({
      data: {
        testDate,
        testMonth: toStr(row['Bulan']),
        testYear:  toInt(row['Tahun']),
        countDescriptionCode: cdCode,
        countNeId: cnId,
        lotId,
        spkId,
        yarnTypeId: ytId,
        millsUnitId: muFallback.id,
        // USTER measurements — mapped from actual header names
        meanNe:          toDecimal(row['Mean Ne']),
        cvCountPercent:  toDecimal(row['CV% Count']),
        meanStrengthCn:  toDecimal(row['Mean Strength CN']),
        elongationPercent: toDecimal(row['Elongation%']),
        uPercent:        toDecimal(row['U%']),
        thin50Percent:   toInt(row['Thin-50%']),
        thick50Percent:  toInt(row['Thick\n+50%']),
        neps200Percent:  toInt(row['Neps\n+200%']),
        neps280Percent:  toInt(row['Neps\n+280%']),
        minNe:           toDecimal(row['Min Ne']),
        maxNe:           toDecimal(row['Max Ne']),
        minStrengthCn:   toDecimal(row['Min Strength CN']),
        maxStrengthCn:   toDecimal(row['Max Strength CN']),
        cvStrengthPercent: toDecimal(row['CV% Strength']),
        tenacityCnTex:   toDecimal(row['Tenacity (CN/Tex)']),
        clsp:            toDecimal(row['CLSP']),
        cvB:             toDecimal(row['CV b']),
        cvm:             toDecimal(row['CVm']),
        cvm1m:           toDecimal(row['CVm 1m']),
        cvm3m:           toDecimal(row['CVm 3m']),
        cvm10m:          toDecimal(row['CVm 10m']),
        ipis:            toInt(row['IPIs']),
        oeIpi:           toInt(row['OE IPI']),
        thin30Percent:   toInt(row['Thin-30%']),
        thin40Percent:   toInt(row['Thin-40%']),
        thick35Percent:  toInt(row['Thick\n+35%']),
        neps140Percent:  toInt(row['Neps\n+140%']),
        shortIpi:        toInt(row['Short IPI']),
        hairiness:       toDecimal(row['Hairiness']),
        sh:              toDecimal(row['Sh']),
        s1uPlusS2u:     toDecimal(row['S1u + S2u']),
        s3u:             toDecimal(row['S3u']),
        dr1_5m5Percent:  toDecimal(row['DR 1.5m 5% (%)']),
        remarks:         toStr(row['Remarks']),
        // Raw numeric fields
        sliverRovingNe:   toDecimal(row['Sliver / Roving (Ne)']),
        totalDraft:       toDecimal(row['Total Draft']),
        twistMultiplier:  toDecimal(row['TM α']),
        tpi:              toDecimal(row['TPI']),
        tpm:              toDecimal(row['TPM']),
        actualTwist:      toInt(row['Actual Twist']),
        rotorSpindleSpeed: toInt(row['Rotor /Spindle Speed']),
        machineNo:        toInt(row['MC. No.']),
        sideId:           toInt(row['Side']) ?? undefined,
      }
    })
    created++
  }
  console.log(`Yarn tests: ${created} created`)
}

async function main() {
  const filePath = path.join(__dirname, 'ERP_Scratch_Spinning.xlsx')
  const wb = XLSX.readFile(filePath)
  await importLots(wb)
  await importSpks(wb)
  await importProductionRecords(wb)
  await importYarnTests(wb)
  console.log('\n✓ Spinning import complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
