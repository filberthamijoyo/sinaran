import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== InspectGray date distribution ===");
  const grayDate = await prisma.$queryRaw`
    SELECT EXTRACT(month FROM tg) as month, COUNT(*) as count
    FROM "InspectGrayRecord" 
    GROUP BY 1 ORDER BY 1
  `;
  console.log(grayDate);

  console.log("\n=== InspectGray grade distribution ===");
  const grayGrade = await prisma.$queryRaw`
    SELECT gd, COUNT(*) as count FROM "InspectGrayRecord" 
    GROUP BY gd ORDER BY COUNT(*) DESC
  `;
  console.log(grayGrade);

  console.log("\n=== InspectFinish grade distribution ===");
  const finishGrade = await prisma.$queryRaw`
    SELECT grade, COUNT(*) as count FROM "InspectFinishRecord"
    GROUP BY grade ORDER BY COUNT(*) DESC LIMIT 10
  `;
  console.log(finishGrade);

  console.log("\n=== InspectFinish date distribution ===");
  const finishDate = await prisma.$queryRaw`
    SELECT EXTRACT(month FROM tgl) as month, COUNT(*) as count
    FROM "InspectFinishRecord"
    GROUP BY 1 ORDER BY 1
  `;
  console.log(finishDate);
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
