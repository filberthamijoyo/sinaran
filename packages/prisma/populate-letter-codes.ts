/**
 * Migration script to populate letterCode values for existing records
 * Run this BEFORE applying the schema change that makes letterCode required
 * 
 * Usage:
 *   npx tsx packages/prisma/populate-letter-codes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a letter code from a name or code
 * This is a fallback - users should update these via admin panel
 */
function generateLetterCode(name: string, code?: number | null): string {
  // Try to extract meaningful letters from name
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    // Take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase().substring(0, 10);
  } else if (words.length === 1) {
    // Take first 2-3 letters
    return words[0].substring(0, 3).toUpperCase();
  }
  // Fallback: use code if available
  if (code) {
    return `C${code}`.substring(0, 10);
  }
  // Last resort: use first 10 chars of name
  return name.substring(0, 10).toUpperCase();
}

async function populateLetterCodes() {
  console.log('🔄 Starting letterCode population...\n');

  try {
    // 1. Populate MillsUnit letterCodes
    console.log('1️⃣ Populating MillsUnit letterCodes...');
    const millsUnits = await prisma.millsUnit.findMany({
      where: { letterCode: null },
    });
    
    if (millsUnits.length > 0) {
      console.log(`   Found ${millsUnits.length} MillsUnits without letterCode`);
      for (const unit of millsUnits) {
        const letterCode = generateLetterCode(unit.name, unit.code);
        await prisma.millsUnit.update({
          where: { id: unit.id },
          data: { letterCode },
        });
        console.log(`   ✓ ${unit.name} (code: ${unit.code}) → letterCode: "${letterCode}"`);
      }
    } else {
      console.log('   ✓ All MillsUnits already have letterCode');
    }

    // 2. Populate YarnType letterCodes
    console.log('\n2️⃣ Populating YarnType letterCodes...');
    const yarnTypes = await prisma.yarnType.findMany({
      where: { letterCode: null },
    });
    
    if (yarnTypes.length > 0) {
      console.log(`   Found ${yarnTypes.length} YarnTypes without letterCode`);
      for (const yarnType of yarnTypes) {
        const letterCode = generateLetterCode(yarnType.name, yarnType.code);
        await prisma.yarnType.update({
          where: { id: yarnType.id },
          data: { letterCode },
        });
        console.log(`   ✓ ${yarnType.name} (code: ${yarnType.code}) → letterCode: "${letterCode}"`);
      }
    } else {
      console.log('   ✓ All YarnTypes already have letterCode');
    }

    // 3. Populate Blend letterCodes
    console.log('\n3️⃣ Populating Blend letterCodes...');
    const blends = await prisma.blend.findMany({
      where: { letterCode: null },
    });
    
    if (blends.length > 0) {
      console.log(`   Found ${blends.length} Blends without letterCode`);
      for (const blend of blends) {
        const letterCode = generateLetterCode(blend.name);
        await prisma.blend.update({
          where: { id: blend.id },
          data: { letterCode },
        });
        console.log(`   ✓ ${blend.name} → letterCode: "${letterCode}"`);
      }
    } else {
      console.log('   ✓ All Blends already have letterCode');
    }

    console.log('\n✅ LetterCode population complete!');
    console.log('\n⚠️  IMPORTANT: Review and update letterCode values via Admin Panel');
    console.log('   The generated values are placeholders and should be updated with correct codes.');
    console.log('\n📝 Next step: Run "npm run db:push" in packages/prisma to apply schema changes');

  } catch (error) {
    console.error('❌ Error populating letterCodes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
populateLetterCodes()
  .then(() => {
    console.log('\n✨ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
