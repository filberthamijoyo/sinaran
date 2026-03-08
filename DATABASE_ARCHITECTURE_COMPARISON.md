# Database Architecture Comparison: Unified vs Separate Databases

## Current State: Separate Databases with Sync

### Architecture
- **Quality Service**: Own database (`DATABASE_URL`)
- **Production Service**: Own database (`PRODUCTION_DATABASE_URL`)
- **Sync Mechanism**: API-based synchronization with caching

### Complexity Metrics
- **Lines of Sync Code**: ~500+ lines (sharedDataClient.ts, sync routes, mapping logic)
- **API Endpoints**: 7 sync endpoints
- **Cache Management**: In-memory cache with TTL
- **Data Mapping**: 6 different mapping functions
- **Potential Issues**: Data inconsistency, sync failures, cache invalidation

## Option 1: Unified Database (RECOMMENDED)

### Architecture
- **Single Database**: Both services connect to same PostgreSQL instance
- **Shared Schema**: Dimension tables shared, module-specific tables isolated
- **No Sync Needed**: Direct database access

### Pros ✅
1. **Simplicity**
   - No sync code needed (~500 lines removed)
   - No cache management
   - No API calls between services for shared data
   - Single source of truth

2. **Performance**
   - Direct database joins (faster than API calls)
   - No network latency for shared data
   - Better query optimization
   - Single connection pool

3. **Data Consistency**
   - ACID transactions across modules
   - No sync delays or failures
   - Immediate consistency
   - Foreign key constraints work across modules

4. **Maintenance**
   - Single schema to manage
   - Single migration path
   - Single backup strategy
   - Easier debugging

5. **Cost**
   - One database instance
   - Less infrastructure complexity
   - Lower operational overhead

### Cons ❌
1. **Coupling**
   - Services share database schema
   - Schema changes affect both services
   - Requires coordination for migrations

2. **Scaling**
   - Single database bottleneck (but PostgreSQL handles this well)
   - Can't scale databases independently

3. **Deployment**
   - Database migrations need coordination
   - Both services must be compatible with schema

### When to Use
- ✅ Same organization/team
- ✅ Shared business domain
- ✅ Need strong consistency
- ✅ Small to medium scale (< 10M records per module)
- ✅ Same deployment lifecycle

## Option 2: Separate Databases (Current)

### Pros ✅
1. **Isolation**
   - Services are completely independent
   - Can scale databases separately
   - Schema changes don't affect other services

2. **Deployment**
   - Independent deployments
   - No migration coordination needed
   - Can use different database versions

3. **Team Autonomy**
   - Different teams can own different databases
   - Less coordination needed

### Cons ❌
1. **Complexity**
   - Sync code required (~500+ lines)
   - Cache management
   - API calls between services
   - Data mapping logic
   - Sync failure handling

2. **Performance**
   - Network latency for shared data
   - Cache invalidation overhead
   - Multiple database connections

3. **Data Consistency**
   - Eventual consistency (sync delays)
   - Potential for data drift
   - Sync failures can cause inconsistencies
   - No cross-module transactions

4. **Maintenance**
   - Two schemas to maintain
   - Sync logic to debug
   - Cache invalidation issues
   - More moving parts

5. **Cost**
   - Two database instances
   - More infrastructure complexity
   - Higher operational overhead

### When to Use
- ✅ Different organizations/teams
- ✅ Different scaling requirements
- ✅ Regulatory/compliance isolation
- ✅ Very high scale (> 10M records per module)
- ✅ Different deployment schedules

## Recommendation: Unified Database

### Why Unified is Better for Your ERP

1. **Shared Dimension Data**: You have 6+ shared dimension tables. This is a strong indicator for unified database.

2. **Same Business Domain**: Quality and Production are part of the same ERP system, same company, same business processes.

3. **Current Complexity**: Your sync implementation shows the pain points of separate databases.

4. **Scale**: ERP systems typically don't need separate databases unless at massive scale.

5. **Consistency Requirements**: ERP systems need strong consistency for financial/operational data.

### Migration Path

#### Step 1: Schema Consolidation
- Merge both Prisma schemas into one
- Keep module-specific tables separate
- Share dimension tables

#### Step 2: Update Services
- Both services use same `DATABASE_URL`
- Remove sync code
- Remove cache logic
- Update API endpoints to use direct DB access

#### Step 3: Data Migration
- Export data from both databases
- Import into unified database
- Verify data integrity

#### Step 4: Cleanup
- Remove sync endpoints
- Remove sharedDataClient
- Remove sync routes
- Update documentation

### Estimated Effort
- **Schema Consolidation**: 2-4 hours
- **Code Updates**: 4-6 hours
- **Testing**: 2-4 hours
- **Total**: 1-2 days

### Risk Assessment
- **Low Risk**: Both services already use PostgreSQL
- **Reversible**: Can split databases later if needed
- **No Data Loss**: Migration can be done safely

## Conclusion

For your ERP system, **unified database is the better choice**. The complexity and maintenance burden of separate databases with sync outweighs the benefits of isolation. You'll have:

- ✅ Simpler codebase
- ✅ Better performance
- ✅ Stronger consistency
- ✅ Easier maintenance
- ✅ Lower costs

The only reason to keep separate databases would be if you have different teams managing each service independently, or if you're at massive scale (which doesn't appear to be the case).
