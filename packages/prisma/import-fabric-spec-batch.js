const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function main() {
  const csvPath = '/Users/filberthamijoyo/Downloads/erp/CSV/ERP SCRATCH - Copy of DATABASE KODE.csv';
  
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  console.log('CSV file read successfully');

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const validRecords = records.filter(
    (r) => r['ITEM'] && r['ITEM'].trim() !== ''
  );

  console.log(`Processing ${validRecords.length} fabric specs...`);

  // First delete all existing records
  console.log('Deleting existing records...');
  await prisma.fabricSpec.deleteMany({});
  console.log('Deleted.');

  // Process in batches of 50
  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize);
    const data = batch.map(r => ({
      item: r['ITEM']?.trim(),
      kons_kode: r['Kons Kode']?.trim() || '',
      kode: r['KODE']?.trim() || '',
      kat_kode: r['KAT KODE']?.trim() || '',
      te: r['TE'] ? parseInt(r['TE']) || null : null,
      lusi_type: r['L']?.trim() || null,
      lusi_ne: r['LUSI']?.trim() || null,
      pakan_type: r['P']?.trim() || null,
      pakan_ne: r['PAKAN']?.trim() || null,
      sisir: r['SISIR']?.trim() || null,
      pick: r['PICK'] ? parseInt(r['PICK']) || null : null,
      anyaman: r['ANY']?.trim() || null,
      arah: r['ARAH']?.trim() || null,
      lg_inches: r['LG"'] ? parseFloat(r['LG"']) || null : null,
      lf_inches: r['LF"'] ? parseFloat(r['LF"']) || null : null,
      susut_pakan: r['Susut Pakan(%)'] ? parseFloat(r['Susut Pakan(%)']) || null : null,
      warna: r['WARNA']?.trim() || null,
      pretreatment: r['PRETREATMENT']?.trim() || null,
      indigo_i: r['I'] ? parseFloat(r['I']) || null : null,
      indigo_bak_i: r['Bak I'] ? parseInt(r['Bak I']) || null : null,
      sulfur_s: r['S'] ? parseFloat(r['S']) || null : null,
      sulfur_bak_s: r['Bak S'] ? parseInt(r['Bak S']) || null : null,
      posttreatment: r['POSTTREATMENT']?.trim() || null,
      finish: r['FINISH']?.trim() || null,
      oz_g: r['OZ G'] ? parseFloat(r['OZ G']) || null : null,
      oz_f: r['OZ F'] ? parseFloat(r['OZ F']) || null : null,
      p_kons: r['P (Kons)']?.trim() || null,
      remarks: r['Remarks']?.trim() || null,
    })).filter(r => r.item); // Filter out any with empty item

    try {
      await prisma.fabricSpec.createMany({ data, skipDuplicates: true });
      inserted += data.length;
      console.log(`Inserted ${inserted}/${validRecords.length}...`);
    } catch (e) {
      console.error(`Error inserting batch ${i}:`, e.message);
    }
  }

  console.log(`Done. Total inserted: ${inserted}`);
  await prisma.$disconnect();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
