# Database Recovery Guide

## ⚠️ NEVER run `prisma db push --force-reset` — it wipes all data
## Always use `npx prisma migrate dev --name <change>` for schema changes

## Recovery Order (after full wipe)

Run each script in order. Wait for confirmation before next step.

1. npx prisma migrate deploy  (apply schema)
2. dotenv -e ../../.env -- npx ts-node import-historical.ts
   Expected: 1,336 SC / 1,277 WarpingRun / 13,008 WarpingBeam / 1,270 IndigoRun
3. dotenv -e ../../.env -- npx ts-node backfill-kp-sequence.ts
4. dotenv -e ../../.env -- npx ts-node import-fabric-spec.ts
5. dotenv -e ../../.env -- npx ts-node scripts/import-inspect-gray.ts
   Expected: ~8,092 records
6. dotenv -e ../../.env -- npx ts-node scripts/import-bbsf.ts
   Expected: ~10,404 WashingRun / ~20,598 SanforRun / ~216 ServiceRecord
7. dotenv -e ../../.env -- npx ts-node scripts/import-inspect-finish.ts
   Expected: ~173,500 records

Note: WeavingRecord repopulates automatically via TRIPUTRA live sync

## Verification SQL
SELECT 'SalesContract' as tbl, COUNT(*) FROM "SalesContract"
UNION ALL SELECT 'WarpingRun', COUNT(*) FROM "WarpingRun"
UNION ALL SELECT 'IndigoRun', COUNT(*) FROM "IndigoRun"
UNION ALL SELECT 'InspectGrayRecord', COUNT(*) FROM "InspectGrayRecord"
UNION ALL SELECT 'BBSFWashingRun', COUNT(*) FROM "BBSFWashingRun"
UNION ALL SELECT 'BBSFSanforRun', COUNT(*) FROM "BBSFSanforRun"
UNION ALL SELECT 'InspectFinishRecord', COUNT(*) FROM "InspectFinishRecord";
