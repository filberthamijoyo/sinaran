const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_c6JfMBL7Pjno@ep-plain-dust-a1bggj1v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  // 1. InspectGray KP values
  const inspectGrayKPs = [
    'BRNS', 'BRPE', 'BOTQ', 'BRJL', 'BRPT', 'BSQS', 'BRNT', 'BRBQ', 'BRBN', 'BRBS',
    'BSQL', 'BRTE', 'BRBD', 'BRPP', 'BRBL', 'BPQP', 'BRBE', 'BRLD', 'BRPB', 'BRDB'
  ];
  
  // 2. BBSF KP values (from all 3 sheets)
  const bbsfKP_WASHING = [
    'BKTS', 'BKLB', 'BKDL', 'BKSP', 'BKTP', 'BKDJ', 'BKNQ', 'BKED', 'BKTD', 'BJDP',
    'BKTT', 'BKEQ', 'BKTN', 'BKJJ', 'BKLE', 'BKDP', 'BKNS', 'BKTB', 'BKLQ', 'BKDB'
  ];
  const bbsfKP_SANFOR1 = [
    'BKJJ', 'BKLE', 'BKEL', 'BKLS', 'BKJT', 'BKND', 'BKTT', 'BJDP', 'BKEQ', 'BKTN',
    'BKDP', 'BKTD', 'BKTS', 'BJBD', 'BILD', 'BKLN', 'BKSE', 'BKNL', 'BJBB', 'BJNT'
  ];
  const bbsfKP_SANFOR2 = [
    'BKTT', 'BJDP', 'BKEQ', 'BKTN', 'BKJJ', 'BKDP', 'BKLE', 'BKEL', 'BKLS', 'BKTJ',
    'BKND', 'BKTS', 'BJBD', 'BILD', 'BKLN', 'BKSE', 'BKNL', 'BKLQ', 'BKET', 'BKQB'
  ];
  
  // 3. InspectFinish SN values
  const inspectFinishSN = [
    'Y04156F08L', 'Y04132F21L', 'AE05138F18L', 'K0135F18L', 'D08171F15L', 'K02182F17L', 
    'D0870F23L', 'K024074F25L', 'T08600F24L', 'Q041069F22L', 'T07860F17L', 'J04649F18L',
    'K05836F22L', 'W031096F17L', 'O04634F08L', 'O051014F08L', 'O05684F16L', 'O051011F24L', 
    'O041014F08L', 'O04706F23L'
  ];
  
  // 4. InspectFinish P (fabric code) values
  const inspectFinishP = [
    'BHQE', 'BHJT', 'BHDD', 'BIST', 'BIQP', 'BHPQ', 'BHJD', 'BHED', 'BHBJ', 'BHJB',
    'BHLJ', 'BGNB', 'BFPJ', 'BHLT', 'BHQB', 'BITP', 'BHPL', 'BIQJ', 'BIDB', 'BIQL'
  ];
  
  // 5. InspectFinish Column3 values
  const inspectFinishCol3 = [
    'FL22/2-3', 'FL27/2-3', 'FL27/0-1', 'FL27/1-2', 'FL28/2-3', 'FL28/1-2', 'FL28/0-1',
    'FL26/2-3', 'FL26/1-2', 'FL26/0-1', 'ML01/2-3', 'ML01/0-1', 'ML01/1-2', 'FL22/1-2',
    'FL22/0-1', 'FL24/0-1', 'FL24/2-3', 'FL25/1-2', 'FL25/2-3', 'FL21/1-2'
  ];

  console.log("=== 1. Checking InspectGray KP against SalesContract.kp ===");
  const grayMatches = await prisma.salesContract.findMany({
    where: { kp: { in: inspectGrayKPs } },
    select: { kp: true }
  });
  console.log("Matches found:", grayMatches.length);
  console.log(grayMatches.map(r => r.kp));

  console.log("\n=== 2. Checking BBSF WASHING KP against SalesContract.kp ===");
  const bbsf1Matches = await prisma.salesContract.findMany({
    where: { kp: { in: bbsfKP_WASHING } },
    select: { kp: true }
  });
  console.log("Matches found:", bbsf1Matches.length);
  console.log(bbsf1Matches.map(r => r.kp));

  console.log("\n=== 3. Checking BBSF SANFOR PERTAMA KP against SalesContract.kp ===");
  const bbsf2Matches = await prisma.salesContract.findMany({
    where: { kp: { in: bbsfKP_SANFOR1 } },
    select: { kp: true }
  });
  console.log("Matches found:", bbsf2Matches.length);
  console.log(bbsf2Matches.map(r => r.kp));

  console.log("\n=== 4. Checking BBSF SANFOR KEDUA KP against SalesContract.kp ===");
  const bbsf3Matches = await prisma.salesContract.findMany({
    where: { kp: { in: bbsfKP_SANFOR2 } },
    select: { kp: true }
  });
  console.log("Matches found:", bbsf3Matches.length);
  console.log(bbsf3Matches.map(r => r.kp));

  console.log("\n=== 5. Checking InspectFinish SN against SalesContract.kp ===");
  const ifSNMatches = await prisma.salesContract.findMany({
    where: { kp: { in: inspectFinishSN } },
    select: { kp: true }
  });
  console.log("Matches found:", ifSNMatches.length);
  console.log(ifSNMatches.map(r => r.kp));

  console.log("\n=== 6. Checking InspectFinish P against SalesContract.kp ===");
  const ifPMatches = await prisma.salesContract.findMany({
    where: { kp: { in: inspectFinishP } },
    select: { kp: true }
  });
  console.log("Matches found:", ifPMatches.length);
  console.log(ifPMatches.map(r => r.kp));

  console.log("\n=== 7. Checking InspectFinish Column3 against SalesContract.kp ===");
  const ifCol3Matches = await prisma.salesContract.findMany({
    where: { kp: { in: inspectFinishCol3 } },
    select: { kp: true }
  });
  console.log("Matches found:", ifCol3Matches.length);
  console.log(ifCol3Matches.map(r => r.kp));
  
  // Also check codename
  console.log("\n=== 8. Checking InspectFinish P against SalesContract.codename ===");
  const ifPCodenameMatches = await prisma.salesContract.findMany({
    where: { codename: { in: inspectFinishP } },
    select: { kp: true, codename: true }
  });
  console.log("Matches found:", ifPCodenameMatches.length);
  console.log(ifPCodenameMatches.map(r => ({ kp: r.kp, codename: r.codename })));
  
  // Check what codename values look like
  console.log("\n=== Sample SalesContract codename values ===");
  const sampleCodename = await prisma.salesContract.findMany({
    take: 20,
    select: { kp: true, codename: true }
  });
  console.log(sampleCodename);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
