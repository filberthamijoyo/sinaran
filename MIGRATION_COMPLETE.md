# Migration Complete: Monorepo with Unified API

## ✅ Migration Summary

Successfully migrated from microservices architecture to a monorepo with unified API and database.

## What Was Done

### 1. Monorepo Structure ✅
- Created workspace structure with `apps/` and `packages/`
- Set up npm workspaces in root `package.json`
- Moved frontend to `apps/frontend/`
- Created unified API in `apps/api/`
- Created shared Prisma package in `packages/prisma/`

### 2. Unified Database Schema ✅
- Merged Quality and Production Prisma schemas into one unified schema
- Unified shared dimension tables:
  - `Lot` (merged from Quality `Lot` and Production `LotBenang`)
  - `Spk` (unified)
  - `YarnType` (merged from Quality `YarnType` and Production `YarnJenisBenang`)
  - `SlubCode` (unified)
- Kept module-specific tables separate:
  - Quality: `CountDescription`, `Supplier`, `MillsUnit`, `ProcessStep`, `TestType`, `Side`
  - Production: `CountNe`, `UnitPabrik`, `WarnaConeCheese`, `RayonBrand`

### 3. Unified API Server ✅
- Created single Express server in `apps/api/`
- Combined quality and production routes
- Updated routes to use unified Prisma client
- Removed sync code (no longer needed)

### 4. Frontend Updates ✅
- Updated API configuration to use unified endpoint
- Changed from separate ports (3001, 4001) to single port (3001)

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env` file in `apps/api/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_sinaran"
PORT=3001
FRONTEND_URL="http://localhost:3000"
NODE_ENV=development
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate --workspace=@erp-sinaran/prisma
```

### 4. Run Database Migrations
```bash
npm run prisma:migrate --workspace=@erp-sinaran/prisma
```

### 5. Start Development
```bash
# Terminal 1: Start API server
npm run dev:api

# Terminal 2: Start frontend
npm run dev:frontend
```

## File Structure

```
erp_sinaran/
├── apps/
│   ├── frontend/          # React app
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── api/               # Unified Express API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── quality.ts
│       │   │   └── production.ts
│       │   ├── lib/
│       │   │   └── prisma.ts
│       │   ├── utils/
│       │   │   ├── calculations.ts
│       │   │   └── serialization.ts
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── prisma/            # Shared Prisma schema
│       ├── schema.prisma
│       └── package.json
├── services/              # OLD - Can be removed after migration verified
│   ├── quality-service/
│   └── production-service/
├── package.json           # Root workspace config
└── MIGRATION_COMPLETE.md
```

## Benefits Achieved

✅ **Simplified Development**: One repo, one database, one API server  
✅ **No Sync Code**: Removed ~500 lines of sync logic  
✅ **Better Consistency**: Single source of truth, ACID transactions  
✅ **Easier Deployment**: One service to deploy  
✅ **Shared Code**: Common utilities and Prisma schema  

## Breaking Changes

### API Endpoints
- Quality endpoints: `/api/quality/*` (unchanged)
- Production endpoints: `/api/production/*` (unchanged)
- Health check: `/api/health` (new unified endpoint)

### Database Schema Changes
- `ProductionRecord.yarnJenisBenangId` → `ProductionRecord.yarnTypeId`
- `ProductionRecord.lotBenangId` → `ProductionRecord.lotId`
- Production routes updated to use unified `Lot` and `YarnType` tables

### Environment Variables
- Removed: `QUALITY_PORT`, `PRODUCTION_PORT`, `PRODUCTION_DATABASE_URL`
- Added: `PORT` (unified API port), single `DATABASE_URL`

## Migration Notes

- Old service directories in `services/` can be removed after verifying migration
- Sync code (`sharedDataClient.ts`, `sharedDataSync.ts`) removed - no longer needed
- Frontend API config updated to use unified endpoint

## Troubleshooting

If you encounter issues:

1. **Prisma Client not found**: Run `npm run prisma:generate` in the prisma package
2. **Database connection errors**: Check `DATABASE_URL` in `.env`
3. **Port conflicts**: Ensure port 3001 is available for the unified API
4. **Frontend can't connect**: Verify `REACT_APP_API_BASE_URL` and `REACT_APP_API_PORT` in frontend `.env`
