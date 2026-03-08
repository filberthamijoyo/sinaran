# How to Check Sync Status

There are several ways to check if your shared data is synced between Quality and Production services.

## Method 1: Using the Sync Status API Endpoint (Recommended)

The easiest way is to use the built-in sync status endpoint:

### Using cURL

```bash
curl http://localhost:4001/api/production/sync/status
```

### Using Browser

Open in your browser:
```
http://localhost:4001/api/production/sync/status
```

### Expected Response

```json
{
  "quality": {
    "lots": 10,
    "spks": 5,
    "yarnTypes": 8,
    "counts": 12,
    "slubCodes": 6,
    "units": 4
  },
  "production": {
    "lots": 10,
    "spks": 5,
    "yarnTypes": 8,
    "counts": 12,
    "slubCodes": 6,
    "units": 4
  }
}
```

**If the numbers match**, your data is synced! ✅  
**If the numbers don't match**, you need to run a sync.

## Method 2: Check Individual Data Types

You can also check specific data types by comparing counts:

### Check Lots
```bash
# Quality service
curl http://localhost:3001/api/quality/lots | jq '. | length'

# Production service
curl http://localhost:4001/api/production/lots | jq '. | length'
```

### Check SPKs
```bash
# Quality service
curl http://localhost:3001/api/quality/spks | jq '. | length'

# Production service
curl http://localhost:4001/api/production/spks | jq '. | length'
```

## Method 3: Using a Simple Script

Create a script to check sync status:

```bash
#!/bin/bash
echo "🔍 Checking sync status..."
STATUS=$(curl -s http://localhost:4001/api/production/sync/status)

QUALITY_LOTS=$(echo $STATUS | jq '.quality.lots')
PROD_LOTS=$(echo $STATUS | jq '.production.lots')

if [ "$QUALITY_LOTS" == "$PROD_LOTS" ]; then
  echo "✅ Lots are synced: $QUALITY_LOTS"
else
  echo "❌ Lots are NOT synced: Quality=$QUALITY_LOTS, Production=$PROD_LOTS"
fi
```

## Method 4: Programmatic Check (JavaScript/TypeScript)

```typescript
async function checkSyncStatus() {
  const response = await fetch('http://localhost:4001/api/production/sync/status');
  const status = await response.json();
  
  const isSynced = 
    status.quality.lots === status.production.lots &&
    status.quality.spks === status.production.spks &&
    status.quality.yarnTypes === status.production.yarnTypes &&
    status.quality.counts === status.production.counts &&
    status.quality.slubCodes === status.production.slubCodes &&
    status.quality.units === status.production.units;
  
  if (isSynced) {
    console.log('✅ All data is synced!');
  } else {
    console.log('❌ Data is not synced. Differences:');
    console.log('Lots:', status.quality.lots, 'vs', status.production.lots);
    console.log('SPKs:', status.quality.spks, 'vs', status.production.spks);
    // ... etc
  }
  
  return status;
}
```

## Method 5: Direct Database Query

If you have direct database access, you can query both databases:

### Production Database
```sql
SELECT 
  (SELECT COUNT(*) FROM "LotBenang") as lots,
  (SELECT COUNT(*) FROM "Spk") as spks,
  (SELECT COUNT(*) FROM "YarnJenisBenang") as yarn_types,
  (SELECT COUNT(*) FROM "CountNe") as counts,
  (SELECT COUNT(*) FROM "SlubCode") as slub_codes,
  (SELECT COUNT(*) FROM "UnitPabrik") as units;
```

### Quality Database
```sql
SELECT 
  (SELECT COUNT(*) FROM "Lot") as lots,
  (SELECT COUNT(*) FROM "Spk") as spks,
  (SELECT COUNT(*) FROM "YarnType") as yarn_types,
  (SELECT COUNT(*) FROM "CountDescription") as counts,
  (SELECT COUNT(*) FROM "SlubCode") as slub_codes,
  (SELECT COUNT(*) FROM "MillsUnit") as units;
```

## Quick Test

Run this to quickly check and sync if needed:

```bash
# Check status
STATUS=$(curl -s http://localhost:4001/api/production/sync/status)

# Compare lots count
QUALITY_LOTS=$(echo $STATUS | jq -r '.quality.lots')
PROD_LOTS=$(echo $STATUS | jq -r '.production.lots')

if [ "$QUALITY_LOTS" != "$PROD_LOTS" ]; then
  echo "⚠️  Not synced! Syncing now..."
  curl -X POST http://localhost:4001/api/production/sync/all
  echo ""
  echo "✅ Sync complete!"
else
  echo "✅ Already synced!"
fi
```

## Troubleshooting

### If status endpoint returns error:
1. Make sure Production service is running on port 4001
2. Make sure Quality service is running on port 3001
3. Check environment variables: `QUALITY_SERVICE_URL` in Production service

### If counts don't match:
1. Run sync: `POST /api/production/sync/all`
2. Check sync response for errors
3. Verify Quality service has the data you expect

### If Quality service is unavailable:
- The status endpoint will still show Production counts
- Quality counts will be 0 or empty
- Sync will fail until Quality service is back online
