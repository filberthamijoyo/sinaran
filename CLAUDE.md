# Sinaran ERP — Claude Code Context

## Project
Custom denim manufacturing ERP for JD Denim / Sinaran textile factory.
Full production pipeline: Sales Contract → Warping → Indigo → Weaving → Inspect Gray → BBSF → Inspect Finish → Complete

## Tech Stack
- Frontend: Next.js + React (TypeScript), Tailwind CSS — apps/frontend/
- Backend: Node.js + Express (TypeScript) — apps/api/src/routes/denim.ts
- Database: PostgreSQL (Neon) via Prisma ORM — packages/prisma/schema.prisma
- Monorepo root: ~/erp-sinaran/
- Deployed: Vercel (frontend) + Render (backend) + Neon (database)

## CRITICAL RULES — NEVER VIOLATE
1. NEVER run prisma db push --force-reset — this wipes ALL data (happened once, full re-import required)
2. ALWAYS use npx prisma migrate dev --name <migration-name> for schema changes
3. ALWAYS use npx prisma migrate deploy for production deployments
4. Read the relevant file BEFORE suggesting changes — never guess field names
5. One concern per change — never bundle schema + API + frontend in one step

## Dev Commands
- Frontend dev: cd apps/frontend && npm run dev (port 3000)
- Backend dev: cd apps/api && npm run dev
- Prisma studio: cd packages/prisma && npx prisma studio
- Type check: cd apps/frontend && npx tsc --noEmit
- Run import scripts: cd packages/prisma && dotenv -e ../../.env -- npx ts-node <script>.ts

## KP Code Cipher
4-char format. Positions 1-2: A-Z. Positions 3-4: digit cipher QSDTELNJPB (Q=0 B=9)
Encoder/Decoder: apps/api/src/lib/kp.ts
generateNextKP() must be wrapped in a Prisma $transaction — race condition risk

## Database — Key Tables & Row Counts (as of 2026-03-16)
- SalesContract: 1,336 rows
- WarpingRun: 1,277 | WarpingBeam: 13,008
- IndigoRun: 1,270
- WeavingRecord: 245,938 rows (grows via TRIPUTRA live sync)
- InspectGrayRecord: ~8,092
- BBSFWashingRun: 10,404 | BBSFSanforRun: 20,598 | BBSFServiceRecord: 216
- InspectFinishRecord: 173,500

## Missing Indexes — Sprint 1 Priority
WeavingRecord is missing composite indexes (245k rows, causes slow analytics):
- @@index([kp, tanggal])
- @@index([machine, tanggal])
- @@index([kp, machine])
Add with: npx prisma migrate dev --name add-weaving-indexes

## Design System (neumorphism — 2026-03-22)
- Base surface: #E0E5EC — every background, card, input uses this exact color
- Shadows: inline style={{ boxShadow }} only — NEVER Tailwind arbitrary shadow classes
- No borders on cards — depth via dual rgba shadows only
- Fonts: Plus Jakarta Sans (display) + DM Sans (body) + IBM Plex Mono (KP codes)

## Pipeline Status Flow
PENDING_APPROVAL → WARPING → INDIGO → WEAVING → INSPECT_GRAY → BBSF → INSPECT_FINISH → COMPLETE
PENDING_APPROVAL → REJECTED

## Roles
- factory: create orders, enter pipeline data, confirm stages
- jakarta: approve/reject orders, view analytics
- admin: full access

## Key File Map
apps/api/src/routes/denim.ts                                      all API routes
apps/api/src/lib/kp.ts                                            KP encoder/decoder/generator
packages/prisma/schema.prisma                                     full database schema
apps/frontend/components/denim/admin/OrderDetailPage.tsx          order detail page
apps/frontend/components/denim/admin/AnalyticsPage.tsx            analytics + KP comparison

## Known Bug — Active
Analytics Tab 3 KP Comparison: Warping/Indigo/Weaving rows show dashes
Root cause: GET /admin/pipeline/:kp returns weaving as raw array. Frontend expects weavingSummary object.
Fix prompts: HANDOFF_2026-03-22.md Section 7, Prompts A + B + C

## Database Recovery Order
1. npx prisma migrate deploy
2. dotenv -e ../../.env -- npx ts-node import-historical.ts
3. dotenv -e ../../.env -- npx ts-node backfill-kp-sequence.ts
4. dotenv -e ../../.env -- npx ts-node import-fabric-spec.ts
5. dotenv -e ../../.env -- npx ts-node scripts/import-inspect-gray.ts
6. dotenv -e ../../.env -- npx ts-node scripts/import-bbsf.ts
7. dotenv -e ../../.env -- npx ts-node scripts/import-inspect-finish.ts
8. dotenv -e ../../.env -- npx ts-node scripts/backfill-sn-decode.ts
9. WeavingRecord repopulates via TRIPUTRA live sync
