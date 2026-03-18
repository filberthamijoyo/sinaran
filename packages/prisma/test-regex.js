const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('=== Step 1: Decode InspectFinishRecord SN ===\n');

  // First, let's check the regex pattern on actual data
  console.log('Testing regex patterns on sample data:');
  
  const samples = await prisma.$queryRaw`
    SELECT DISTINCT sn FROM "InspectFinishRecord" WHERE sn IS NOT NULL LIMIT 30
  `;
  
  for (const s of samples) {
    const sn = s.sn;
    if (!sn) continue;
    
    // Try the pattern: 2 letters + 2 digits for machine + variable digits for beam + lot pattern
    // Pattern: ^([A-Z]{2})(\d{2})(\d+)((?:[A-Z]\d+[A-Z N]|[A-Z]{1,3}))$
    // More flexible: machine can be 2-3 letters
    const p1 = /^([A-Z]{2})(\d{2})(\d+)((?:[A-Z]\d+[A-Z N]|[A-Z]*))$/;
    const p2 = /^([A-Z]{1,3})(\d{2})(\d+)((?:[A-Z]\d+[A-Z N]|[A-Z]*))$/;
    const p3 = /^([A-Z]+)(\d{2})(\d{2,4})([A-Z]\d+[A-Z])$/;
    const p4 = /^([A-Z]{2,3})(\d{2})(\d+)(\w+)$/;
    
    let matched = false;
    for (const p of [p1, p2, p3, p4]) {
      const m = sn.match(p);
      if (m) {
        console.log(`  "${sn}" -> machine=${m[1]}${m[2]}, beam=${m[3]}, lot=${m[4]} (matched ${p})`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      console.log(`  "${sn}" -> NO MATCH`);
    }
  }

  console.log('\n=== DONE ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
