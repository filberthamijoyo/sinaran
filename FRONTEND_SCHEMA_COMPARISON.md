# Frontend vs Prisma Schema Comparison

## Discrepancies Found

### ❌ **CRITICAL: Field Name Mismatch in YarnTestList**

**Location:** `apps/frontend/src/components/YarnTestList.js:370`

**Issue:** The frontend is trying to access `test.cvPercent` but the Prisma schema field is `cvCountPercent`.

**Frontend Code:**
```javascript
<td>{test.cvPercent || '-'}</td>
```

**Prisma Schema:**
```prisma
cvCountPercent Decimal? @map("cv_count_percent") @db.Decimal(10, 2)
```

**Fix Required:** Change `test.cvPercent` to `test.cvCountPercent` in YarnTestList.js

---

## Field-by-Field Comparison

### ✅ All Form Fields Match Schema

All fields in `YarnTestForm.js` correctly match the Prisma schema:

| Form Field | Prisma Field | Type Match | Notes |
|------------|-------------|------------|-------|
| testDate | testDate | ✅ | DateTime @db.Date |
| testMonth | testMonth | ✅ | String? |
| testYear | testYear | ✅ | Int? |
| countDescriptionCode | countDescriptionCode | ✅ | Int? |
| nominalCount | nominalCount | ✅ | Decimal? |
| lotId | lotId | ✅ | Int? |
| spkId | spkId | ✅ | Int? |
| yarnTypeId | yarnTypeId | ✅ | Int? |
| slubCodeId | slubCodeId | ✅ | Int? |
| supplierId | supplierId | ✅ | Int? |
| millsUnitId | millsUnitId | ✅ | Int? |
| processStepId | processStepId | ✅ | Int? |
| testTypeId | testTypeId | ✅ | Int? |
| machineNo | machineNo | ✅ | Int? |
| sideId | sideId | ✅ | Int? |
| sliverRovingNe | sliverRovingNe | ✅ | Decimal? |
| totalDraft | totalDraft | ✅ | Decimal? |
| twistMultiplier | twistMultiplier | ✅ | Decimal? |
| tpi | tpi | ✅ | Decimal? |
| tpm | tpm | ✅ | Decimal? |
| actualTwist | actualTwist | ✅ | Int? |
| rotorSpindleSpeed | rotorSpindleSpeed | ✅ | Int? |
| meanNe | meanNe | ✅ | Decimal? |
| minNe | minNe | ✅ | Decimal? |
| maxNe | maxNe | ✅ | Decimal? |
| cvCountPercent | cvCountPercent | ✅ | Decimal? |
| meanStrengthCn | meanStrengthCn | ✅ | Decimal? |
| minStrengthCn | minStrengthCn | ✅ | Decimal? |
| maxStrengthCn | maxStrengthCn | ✅ | Decimal? |
| cvStrengthPercent | cvStrengthPercent | ✅ | Decimal? |
| tenacityCnTex | tenacityCnTex | ✅ | Decimal? |
| elongationPercent | elongationPercent | ✅ | Decimal? |
| clsp | clsp | ✅ | Decimal? |
| uPercent | uPercent | ✅ | Decimal? |
| cvB | cvB | ✅ | Decimal? |
| cvm | cvm | ✅ | Decimal? |
| cvm1m | cvm1m | ✅ | Decimal? |
| cvm3m | cvm3m | ✅ | Decimal? |
| cvm10m | cvm10m | ✅ | Decimal? |
| thin50Percent | thin50Percent | ✅ | Int? |
| thick50Percent | thick50Percent | ✅ | Int? |
| neps200Percent | neps200Percent | ✅ | Int? |
| neps280Percent | neps280Percent | ✅ | Int? |
| ipis | ipis | ✅ | Int? |
| oeIpi | oeIpi | ✅ | Int? |
| thin30Percent | thin30Percent | ✅ | Int? |
| thin40Percent | thin40Percent | ✅ | Int? |
| thick35Percent | thick35Percent | ✅ | Int? |
| neps140Percent | neps140Percent | ✅ | Int? |
| shortIpi | shortIpi | ✅ | Int? |
| hairiness | hairiness | ✅ | Decimal? |
| sh | sh | ✅ | Decimal? |
| s1uPlusS2u | s1uPlusS2u | ✅ | Decimal? |
| s3u | s3u | ✅ | Decimal? |
| dr1_5m5Percent | dr1_5m5Percent | ✅ | Decimal? |
| remarks | remarks | ✅ | String? |

### ❌ List Display Fields

| List Column | Frontend Access | Prisma Field | Status |
|-------------|----------------|--------------|--------|
| Test Date | test.testDate | testDate | ✅ |
| Count Desc. | test.countDescription | countDescription (relation) | ✅ |
| Nominal Count | test.nominalCount | nominalCount | ✅ |
| Lot | test.lot?.name | lot (relation) | ✅ |
| SPK | test.spk?.name | spk (relation) | ✅ |
| Yarn Type | test.yarnType?.name | yarnType (relation) | ✅ |
| Machine No | test.machineNo | machineNo | ✅ |
| Mean Ne | test.meanNe | meanNe | ✅ |
| **CV%** | **test.cvPercent** | **cvCountPercent** | ❌ **MISMATCH** |
| Actions | N/A | N/A | ✅ |

---

## Summary

1. **Total Discrepancies:** 1
2. **Critical Issues:** 1 (field name mismatch in list display)
3. **Form Fields:** All 56 fields match correctly ✅
4. **List Display:** 1 field mismatch ❌

## Recommended Fix

Update `YarnTestList.js` line 370:
```javascript
// Before:
<td>{test.cvPercent || '-'}</td>

// After:
<td>{test.cvCountPercent || '-'}</td>
```
