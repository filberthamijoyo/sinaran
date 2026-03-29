import * as XLSX from 'xlsx'
import { PrismaClient, Prisma } from '@prisma/client'
import * as path from 'path'

const prisma = new PrismaClient()

function toDecimal(v: any): Prisma.Decimal | null {
  if (v == null || v === '' || isNaN(Number(v))) return null
  return new Prisma.Decimal(Number(v))
}

function toInt(v: any): number | null {
  if (v == null || v === '' || isNaN(Number(v))) return null
  return Math.round(Number(v))
}

async function main() {
  const filePath = path.join(__dirname, 'SUSUT BBSF.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets['Shifted_DATA_SUSUT_BBSF']
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: null })

  // First, wipe existing data so re-run is safe
  await prisma.bBSFSusutRecord.deleteMany({})
  console.log('Cleared existing susut records')

  const records: Prisma.BBSFSusutRecordCreateManyInput[] = []
  let lastDate: Date | null = null

  for (const row of rows) {
    const rawDate = row['Tanggal']
    let tanggal: Date | null = null
    let shift: string | null = null

    if (rawDate instanceof Date || (typeof rawDate === 'number')) {
      // This row has an actual date — it's the first row of a new date group
      if (rawDate instanceof Date) {
        tanggal = rawDate
      } else {
        const d = XLSX.SSF.parse_date_code(rawDate as number)
        tanggal = new Date(d.y, d.m - 1, d.d)
      }
      if (!isNaN(tanggal.getTime())) {
        lastDate = tanggal
      } else {
        tanggal = lastDate
      }
    } else if (typeof rawDate === 'string' && rawDate.trim() !== '') {
      // Shift letter is stored in Tanggal column for non-first rows in group
      shift = rawDate.trim()
      tanggal = lastDate
    } else {
      tanggal = lastDate
    }

    if (!tanggal) continue

    const kp_kode = row['KP KODE'] ? String(row['KP KODE']).trim() : null
    const kp = kp_kode ? kp_kode.substring(0, 4).trim() : null
    if (!kp) continue

    records.push({
      tanggal,
      no: toInt(row['No']),
      kp,
      kp_kode,
      kereta: toInt(row['KERETA']),
      susut_lusi_awal:    toDecimal(row['Susut Awal']),
      set_lusi_awal:      toDecimal(row['Set Awal (%)']),
      susut_lusi_tengah:  toDecimal(row['Tengah']),
      set_lusi_tengah:    toDecimal(row['Set Tengah (%)']),
      susut_lusi_akhir:   toDecimal(row['Akhir']),
      set_lusi_akhir:     toDecimal(row['Set Akhir (%)']),
      susut_pakan_awal:    toDecimal(row['Susut Awal.1']),
      set_pakan_awal:      toDecimal(row['Set Awal (%).1']),
      susut_pakan_tengah:  toDecimal(row['Tengah.1']),
      set_pakan_tengah:    toDecimal(row['Set Tengah (%).1']),
      susut_pakan_akhir:   toDecimal(row['Akhir.1']),
      set_pakan_akhir:     toDecimal(row['Set Akhir (%).1']),
      skew_awal:   toDecimal(row['Skew Awal']),
      skew_tengah: toDecimal(row['Tengah Skew']),
      skew_akhir:  toDecimal(row['Akhir Skew']),
      set_skew:    toDecimal(row['Set Skew']),
      keterangan:  row['Keterangan'] ? String(row['Keterangan']).trim() : null,
    })
  }

  console.log(`Parsed ${records.length} susut records`)

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    await prisma.bBSFSusutRecord.createMany({ data: records.slice(i, i + BATCH) })
    inserted += Math.min(BATCH, records.length - i)
    process.stdout.write(`\rInserted ${inserted}/${records.length}`)
  }
  console.log('\nDone.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
