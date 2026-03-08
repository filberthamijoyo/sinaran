# Shared Data Implementation Summary

## What Was Implemented

A complete solution for sharing overlapping dimension data between the Quality and Production modules, each with separate databases.

## Architecture

**Quality Service = Source of Truth**
- Quality service maintains the master data for shared dimensions
- Production service can fetch and sync this data

**Production Service = Consumer**
- Production service fetches shared data via API
- Maintains local cache and database copies for performance
- Can sync data on-demand or scheduled

## Files Created

### 1. Core Implementation

- **`services/production-service/src/lib/sharedDataClient.ts`**
  - Client for fetching shared data from Quality service
  - Implements caching with configurable TTL
  - Provides data mapping functions between Quality and Production schemas

- **`services/production-service/src/routes/sharedDataSync.ts`**
  - REST API endpoints for syncing shared data
  - Supports syncing individual data types or all at once
  - Provides sync status endpoint

### 2. Documentation

- **`SHARED_DATA_ARCHITECTURE.md`**
  - Architecture overview and design decisions
  - Comparison of different approaches
  - Implementation details

- **`services/production-service/SHARED_DATA_USAGE.md`**
  - Usage guide with examples
  - API endpoint documentation
  - Troubleshooting guide

### 3. Configuration Updates

- **`services/production-service/.env`**
  - Added `QUALITY_SERVICE_URL` configuration
  - Added `SHARED_DATA_CACHE_TTL` configuration

- **`services/production-service/src/server.ts`**
  - Integrated sync routes into the server

## Shared Data Types

The following dimension tables are shared:

1. **Lots**: `Lot` (Quality) ↔ `LotBenang` (Production)
2. **SPKs**: `Spk` (Quality) ↔ `Spk` (Production)
3. **Yarn Types**: `YarnType` (Quality) ↔ `YarnJenisBenang` (Production)
4. **Count**: `CountDescription` (Quality) ↔ `CountNe` (Production)
5. **Slub Codes**: `SlubCode` (Quality) ↔ `SlubCode` (Production)
6. **Units**: `MillsUnit` (Quality) ↔ `UnitPabrik` (Production)

## API Endpoints

### Sync Endpoints (Production Service)

- `POST /api/production/sync/all` - Sync all shared data
- `POST /api/production/sync/lots` - Sync lots
- `POST /api/production/sync/spks` - Sync SPKs
- `POST /api/production/sync/yarn-types` - Sync yarn types
- `POST /api/production/sync/counts` - Sync counts
- `POST /api/production/sync/slub-codes` - Sync slub codes
- `POST /api/production/sync/units` - Sync units
- `GET /api/production/sync/status` - Get sync status

## How It Works

### Data Flow

1. **Quality Service** maintains master data in its database
2. **Production Service** fetches data via HTTP API calls
3. **Caching Layer** reduces API calls (default: 1 hour TTL)
4. **Local Database** stores synced data for fast reads
5. **Sync Operations** update local database from Quality service

### Sync Process

1. Fetch data from Quality service API
2. Map Quality schema to Production schema
3. Check if record exists in Production database (by name/value)
4. Create new record or update existing record
5. Return sync results with success/error counts

### Caching Strategy

- Data fetched from Quality service is cached in memory
- Cache expires after configurable TTL (default: 1 hour)
- Expired cache is used as fallback if Quality service is unavailable
- Cache can be manually cleared

## Usage Example

### Initial Setup

```bash
# 1. Start Quality service
cd services/quality-service
npm run dev

# 2. Start Production service
cd services/production-service
npm run dev

# 3. Sync shared data
curl -X POST http://localhost:4001/api/production/sync/all
```

### Programmatic Usage

```typescript
import { sharedDataClient } from './lib/sharedDataClient';

// Fetch lots (cached)
const lots = await sharedDataClient.getLots();

// Sync all data
const response = await fetch('http://localhost:4001/api/production/sync/all', {
  method: 'POST'
});
```

## Benefits

1. **Service Independence**: Each service maintains its own database
2. **Performance**: Local database copies for fast reads
3. **Consistency**: Single source of truth (Quality service)
4. **Flexibility**: Can sync on-demand or scheduled
5. **Resilience**: Falls back to cached data if Quality service unavailable
6. **Scalability**: Caching reduces network calls

## Future Enhancements

1. **Bidirectional Sync**: Allow Production to update Quality service
2. **Real-time Updates**: WebSocket/SSE for live sync
3. **Conflict Resolution**: Handle concurrent updates
4. **Audit Trail**: Track sync history and changes
5. **Webhook Support**: Quality service notifies Production on changes
6. **Batch Operations**: Optimize large syncs

## Configuration

### Environment Variables

**Production Service:**
```env
QUALITY_SERVICE_URL="http://localhost:3001"
SHARED_DATA_CACHE_TTL=3600  # seconds
```

**Quality Service:**
```env
QUALITY_PORT=3001
```

## Testing

To test the implementation:

1. Ensure both services are running
2. Check sync status: `GET /api/production/sync/status`
3. Run sync: `POST /api/production/sync/all`
4. Verify data in Production database
5. Test cache by fetching multiple times (should use cache)

## Notes

- Quality service must be running for sync operations
- Production service can operate independently with cached/local data
- Sync operations are idempotent (safe to run multiple times)
- Data mapping handles schema differences automatically
- Count values are extracted from CountDescription names using regex
