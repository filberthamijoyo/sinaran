# Shared Data Architecture for Quality and Production Modules

## Overview

This document outlines the architecture for sharing overlapping dimension data between the Quality and Production modules, each of which has its own separate database.

## Overlapping Data Identified

The following dimension tables overlap between the two modules:

1. **Lots** - `Lot` (Quality) ↔ `LotBenang` (Production)
2. **SPKs** - `Spk` (Quality) ↔ `Spk` (Production)
3. **Yarn Types** - `YarnType` (Quality) ↔ `YarnJenisBenang` (Production)
4. **Count** - `CountDescription` (Quality) ↔ `CountNe` (Production)
5. **Slub Codes** - `SlubCode` (Quality) ↔ `SlubCode` (Production)
6. **Units** - `MillsUnit` (Quality) ↔ `UnitPabrik` (Production)

## Solution Approaches

### Option 1: API-Based Synchronization (Recommended)
**Quality service is the source of truth** for shared dimension data. Production service fetches and caches this data via API calls.

**Pros:**
- No additional infrastructure needed
- Maintains service independence
- Easy to implement
- Can cache data locally for performance

**Cons:**
- Requires network calls (mitigated by caching)
- Potential for data inconsistency if not properly synchronized

### Option 2: Shared Reference Database
Create a third database/service that manages all shared dimension data.

**Pros:**
- Single source of truth
- No synchronization issues
- Clear separation of concerns

**Cons:**
- Additional infrastructure complexity
- Requires new service deployment
- More complex to maintain

### Option 3: Event-Driven Synchronization
Use message queues/events to keep data synchronized between services.

**Pros:**
- Real-time synchronization
- Decoupled services
- Scalable

**Cons:**
- Requires message queue infrastructure (RabbitMQ, Kafka, etc.)
- More complex implementation
- Eventual consistency challenges

## Implementation: API-Based Synchronization

We've implemented Option 1 (API-Based Synchronization) with the following components:

### 1. Shared Data Service Client
Located at: `services/production-service/src/lib/sharedDataClient.ts`

This client allows the Production service to:
- Fetch shared dimension data from Quality service
- Cache data locally to reduce API calls
- Map Quality service data to Production service format

### 2. Synchronization Endpoints
The Production service exposes endpoints that:
- Fetch data from Quality service when needed
- Cache data in Production database for performance
- Provide fallback to local data if Quality service is unavailable

### 3. Data Mapping
Since the schemas differ slightly between services, we provide mapping functions:
- `Lot` (Quality) → `LotBenang` (Production)
- `Spk` (Quality) → `Spk` (Production)
- `YarnType` (Quality) → `YarnJenisBenang` (Production)
- `CountDescription` (Quality) → `CountNe` (Production)
- `SlubCode` (Quality) → `SlubCode` (Production)
- `MillsUnit` (Quality) → `UnitPabrik` (Production)

## Usage

### In Production Service

```typescript
import { SharedDataClient } from './lib/sharedDataClient';

// Fetch lots from Quality service
const lots = await sharedDataClient.getLots();

// Fetch SPKs from Quality service
const spks = await sharedDataClient.getSpks();

// Sync all shared data
await sharedDataClient.syncAll();
```

### Configuration

Add to `.env` files:

**Production Service:**
```
QUALITY_SERVICE_URL=http://localhost:3001
SHARED_DATA_CACHE_TTL=3600  # Cache TTL in seconds
```

**Quality Service:**
```
QUALITY_PORT=3001
```

## Data Consistency Strategy

1. **Read Operations**: Production service checks local cache first, then fetches from Quality service if needed
2. **Write Operations**: Write to Quality service first, then sync to Production cache
3. **Cache Invalidation**: Cache expires after TTL, or can be manually invalidated
4. **Fallback**: If Quality service is unavailable, use cached data

## Future Enhancements

1. **Bidirectional Sync**: Allow Production to also update Quality service data
2. **Real-time Updates**: Use WebSockets or Server-Sent Events for real-time sync
3. **Conflict Resolution**: Handle cases where both services modify the same data
4. **Audit Trail**: Track which service last updated shared data
