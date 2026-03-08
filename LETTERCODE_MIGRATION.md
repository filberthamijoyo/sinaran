# LetterCode Migration Guide

This guide explains how to make `letterCode` mandatory for `MillsUnit`, `Blend`, and `YarnType` records.

## Overview

The `letterCode` field is now **required** (non-nullable) for:
- **MillsUnit** - Letter code for mill units (e.g., "OE")
- **Blend** - Letter code for yarn blends (e.g., "RC")
- **YarnType** - Letter code for yarn types (e.g., "PL")

These letter codes are used to auto-generate count descriptions in the format:
```
millCode + blendCode + yarnTypeCode + lot + count
```

## Migration Steps

### Step 1: Populate Existing Records

Before applying the schema change, populate existing records with `letterCode` values:

```bash
# From project root
cd packages/prisma
npm run populate-letter-codes
```

Or using tsx directly:
```bash
npx tsx packages/prisma/populate-letter-codes.ts
```

This script will:
- Find all records without `letterCode`
- Generate placeholder values based on name/code
- Update the records in the database

**⚠️ Important:** The generated values are placeholders. You should review and update them via the Admin Panel with the correct letter codes.

### Step 2: Review and Update Letter Codes

1. Start the application:
   ```bash
   npm run dev:api
   npm run dev:frontend
   ```

2. Navigate to Admin Panel:
   - Quality Admin: `http://localhost:3000/admin`
   - Production Admin: `http://localhost:3000/production/admin`

3. Update letter codes for:
   - **Mills Units** (Quality Admin → Mills Units tab)
   - **Yarn Types** (Quality Admin → Yarn Types tab, or Production Admin → Yarn Types tab)
   - **Blends** (Quality Admin → Blends tab, or Production Admin → Blends tab)

### Step 3: Apply Schema Changes

Once all existing records have proper `letterCode` values, apply the schema changes:

```bash
cd packages/prisma
npm run db:push
```

This will:
- Update the database schema to make `letterCode` required (non-nullable)
- Verify all records have `letterCode` values

### Step 4: Regenerate Prisma Client

After schema changes, regenerate the Prisma client:

```bash
npm run generate --workspace=@erp-sinaran/prisma
```

Or from the API workspace:
```bash
npm run prisma:generate --workspace=apps/api
```

## What Changed

### Database Schema
- `MillsUnit.letterCode`: Changed from `String?` to `String` (required)
- `Blend.letterCode`: Changed from `String?` to `String` (required)
- `YarnType.letterCode`: Changed from `String?` to `String` (required)

### Backend API
- POST/PUT routes now validate that `letterCode` is provided
- Returns 400 error if `letterCode` is missing

### Frontend Admin Panels
- Added `letterCode` field to admin forms
- Field is marked as required
- Validation prevents submission without `letterCode`

## Troubleshooting

### Error: "letterCode is required"
- Make sure you've populated existing records (Step 1)
- Check that all records have non-null `letterCode` values
- Update any records with placeholder values via Admin Panel

### Error: "Cannot apply schema change"
- Ensure all existing records have `letterCode` values
- Run the populate script again if needed
- Check database connection

### Admin Panel shows validation error
- Ensure `letterCode` field is filled in
- Check that the value is not empty
- Try refreshing the page

## Verification

After migration, verify everything works:

1. **Check existing records:**
   ```sql
   SELECT id, name, letter_code FROM mills_units WHERE letter_code IS NULL;
   SELECT id, name, letter_code FROM yarn_types WHERE letter_code IS NULL;
   SELECT id, name, letter_code FROM blends WHERE letter_code IS NULL;
   ```
   All queries should return 0 rows.

2. **Test creating new records:**
   - Try creating a new Mills Unit, Yarn Type, or Blend via Admin Panel
   - Verify that `letterCode` is required and validated

3. **Test count description generation:**
   - Create a new Yarn Test
   - Verify that count description is auto-generated correctly using the letter codes

## Notes

- Letter codes should be short (max 10 characters)
- They are used in count description generation
- Blend `letterCode` is optional in count description (can be omitted if not provided)
- All other letter codes (MillsUnit, YarnType) are required for count description generation
