# Migration Plan: Microservices → Monorepo

## Current State Analysis

### Current Architecture
- **Quality Service**: Separate Express server, separate database
- **Production Service**: Separate Express server, separate database  
- **Frontend**: React app in root directory
- **Sync Mechanism**: ~500 lines of API-based sync code
- **Issues**: Data consistency, sync complexity, dual database management

### Problems Identified
1. Complex sync logic between services
2. Two databases to maintain and backup
3. Data consistency challenges
4. More infrastructure overhead
5. Harder local development (need to run 2+ services)

## Recommended Approach: Monorepo + Unified Database

### Benefits
✅ **Simpler Development**: One repo, one database, easier local setup  
✅ **Better Consistency**: Single source of truth, no sync needed  
✅ **Easier Deployment**: One API server, one database  
✅ **Shared Code**: Common utilities, types, and Prisma schema  
✅ **Better DX**: Single `npm install`, unified scripts  

### Structure Options

## Option A: Unified API (RECOMMENDED)

```
erp_sinaran/
├── apps/
│   ├── frontend/              # React app
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── api/                   # Single Express API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── quality.ts
│       │   │   └── production.ts
│       │   ├── lib/
│       │   │   └── prisma.ts   # Single Prisma client
│       │   └── server.ts
│       └── package.json
├── packages/
│   └── prisma/                # Shared Prisma schema
│       ├── schema.prisma      # Unified schema
│       └── package.json
├── package.json               # Root workspace
└── turbo.json                 # Turborepo (optional)
```

**Pros:**
- Single API server (simpler deployment)
- One database connection
- Shared Prisma schema
- Easier to add cross-module features

**Cons:**
- Less isolation between modules
- Single deployment unit

## Option B: Monorepo with Separate Services

```
erp_sinaran/
├── apps/
│   └── frontend/
├── services/
│   ├── quality-service/       # Keep as separate service
│   │   ├── src/
│   │   └── package.json
│   └── production-service/    # Keep as separate service
│       ├── src/
│       └── package.json
├── packages/
│   └── prisma/                # Shared Prisma schema
│       └── schema.prisma     # Unified schema
├── package.json               # Root workspace
└── turbo.json
```

**Pros:**
- Service isolation maintained
- Can scale services independently
- Clearer boundaries

**Cons:**
- Still need to run multiple services
- More complex deployment

## Migration Steps

### Phase 1: Setup Monorepo Structure

1. **Install workspace manager** (npm workspaces or pnpm/yarn workspaces)
   ```bash
   # Update root package.json
   {
     "workspaces": [
       "apps/*",
       "services/*",
       "packages/*"
     ]
   }
   ```

2. **Move frontend to apps/**
   ```bash
   mkdir -p apps/frontend
   mv src apps/frontend/
   mv public apps/frontend/
   mv package.json apps/frontend/
   ```

3. **Create unified Prisma package**
   ```bash
   mkdir -p packages/prisma
   # Merge both schemas into one
   ```

### Phase 2: Unify Database

1. **Merge Prisma Schemas**
   - Combine `quality-service/prisma/schema.prisma` + `production-service/prisma/schema.prisma`
   - Remove duplicate dimension tables
   - Keep module-specific tables separate

2. **Create Unified Database**
   - Migrate data from both databases to one
   - Update connection strings

3. **Remove Sync Code**
   - Delete `sharedDataClient.ts`
   - Delete sync routes
   - Update services to use unified Prisma client

### Phase 3: Consolidate API (Option A only)

1. **Create Unified API Server**
   ```typescript
   // apps/api/src/server.ts
   import express from 'express';
   import qualityRoutes from './routes/quality';
   import productionRoutes from './routes/production';
   
   const app = express();
   app.use('/api/quality', qualityRoutes);
   app.use('/api/production', productionRoutes);
   ```

2. **Move Routes**
   - Move quality routes to `apps/api/src/routes/quality.ts`
   - Move production routes to `apps/api/src/routes/production.ts`

3. **Update Frontend**
   - Update API endpoints to point to unified server

### Phase 4: Cleanup

1. **Remove Old Structure**
   - Delete separate service directories (if consolidating)
   - Remove sync documentation

2. **Update Documentation**
   - Update README.md
   - Update SETUP.md
   - Remove sync-related docs

## Quick Start: Option A (Unified API)

### 1. Root package.json
```json
{
  "name": "erp-sinaran",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start"
  }
}
```

### 2. Unified Prisma Schema
```prisma
// packages/prisma/schema.prisma

// Shared dimension tables (no duplicates)
model Lot {
  id    Int    @id @default(autoincrement())
  code  Int    @unique
  name  String
  isActive Boolean @default(true)
  // Relations
  yarnTests QualityYarnTest[]
  productionRecords ProductionRecord[]
}

// Quality module tables
model QualityYarnTest {
  id   BigInt @id @default(autoincrement())
  lotId Int?
  lot  Lot?   @relation(fields: [lotId], references: [id])
  // ... other fields
}

// Production module tables  
model ProductionRecord {
  id   BigInt @id @default(autoincrement())
  lotId Int?
  lot  Lot?   @relation(fields: [lotId], references: [id])
  // ... other fields
}
```

### 3. Unified API Server
```typescript
// apps/api/src/server.ts
import express from 'express';
import cors from 'cors';
import qualityRouter from './routes/quality';
import productionRouter from './routes/production';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/quality', qualityRouter);
app.use('/api/production', productionRouter);

app.listen(3001, () => {
  console.log('API server running on port 3001');
});
```

## Decision Matrix

| Factor | Microservices | Monorepo + Unified API |
|--------|--------------|------------------------|
| **Complexity** | High (sync, 2 DBs) | Low (single DB, no sync) |
| **Development** | Hard (run 2+ services) | Easy (one service) |
| **Deployment** | Complex (2 services) | Simple (1 service) |
| **Data Consistency** | Eventual (sync delays) | Immediate (ACID) |
| **Scaling** | Independent | Single unit |
| **Team Size** | Multiple teams | Single team ✅ |
| **Code Sharing** | Hard | Easy ✅ |

## Recommendation

**For your use case (single team, same business domain, shared data):**

✅ **Choose Option A: Monorepo + Unified API + Unified Database**

This gives you:
- Simpler development workflow
- Better data consistency
- Easier maintenance
- Faster feature development
- Lower infrastructure costs

You can always split services later if you need independent scaling.

## Next Steps

1. Review this plan
2. Choose Option A or B
3. Create backup of current structure
4. Start Phase 1 migration
5. Test thoroughly before removing old code
