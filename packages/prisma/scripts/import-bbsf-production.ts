import * as XLSX from 'xlsx'
import { PrismaClient, Prisma } from '@prisma/client'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, 'PRODUKSI BBSF.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // Row 0: "BBSF" title row
  // Row 1: TGL SHIFT KP KODE QTY (merged)
  // Row 2: LINE 1 LINE 2 LINE 3
  // Row 3+: actual data
  const records: Prisma.BBSFProductionRecordCreateManyInput[] = []
  const lineLabels = ['LINE 1', 'LINE 2', 'LINE 3']
  const lineColIndexes = [4, 5, 6]

  for (let i = 3; i < raw.length; i++) {
    const row = raw[i]
    if (!row || !row[0]) continue

    const rawDate = row[0]
    let tanggal: Date
    if (typeof rawDate === 'number') {
      tanggal = XLSX.SSF.parse_date_code(rawDate) as unknown as Date
      const d = XLSX.SSF.parse_date_code(rawDate)
      tanggal = new Date(d.y, d.m - 1, d.d)
    } else if (rawDate instanceof Date) {
      tanggal = rawDate
    } else {
      tanggal = new Date(rawDate)
    }

    if (isNaN(tanggal.getTime())) continue

    const shift = row[1] != null ? String(row[1]).trim() : null
    const kp = row[2] != null ? String(row[2]).trim() : null
    const kode = row[3] != null ? String(row[3]).trim() : null

    if (!kp || kp === 'KP' || kp === 'SAMPLE') continue

    for (let li = 0; li < lineColIndexes.length; li++) {
      const rawQty = row[lineColIndexes[li]]
      if (rawQty == null || rawQty === '' || isNaN(Number(rawQty))) continue
      const qty = Number(rawQty)
      if (qty <= 0) continue

      records.push({
        tanggal,
        shift,
        kp,
        kode,
        qty: new Prisma.Decimal(qty),
        line: lineLabels[li],
      })
    }
  }

  console.log(`Parsed ${records.length} production records`)

  const BATCH = 500
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    await prisma.bBSFProductionRecord.createMany({
      data: records.slice(i, i + BATCH),
      skipDuplicates: true,
    })
    inserted += Math.min(BATCH, records.length - i)
    process.stdout.write(`\rInserted ${inserted}/${records.length}`)
  }
  console.log('\nDone.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
