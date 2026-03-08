#!/bin/bash
# Script to check if Prisma schema is synced with database

echo "🔍 Checking Prisma schema sync status..."
echo ""

cd server

# 1. Validate schema
echo "1️⃣ Validating Prisma schema..."
npx prisma validate --schema=../prisma/schema.prisma
echo ""

# 2. Check database connection and introspect
echo "2️⃣ Introspecting database schema..."
npx prisma db pull --schema=../prisma/schema.prisma --print > /tmp/db_introspection.txt 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    echo "   Schema introspection saved to /tmp/db_introspection.txt"
    echo "   Compare this with your schema.prisma to see differences"
else
    echo "❌ Database connection failed"
    cat /tmp/db_introspection.txt
fi
echo ""

# 3. Check migration status
echo "3️⃣ Checking migration status..."
npx prisma migrate status --schema=../prisma/schema.prisma 2>&1 | head -10
echo ""

# 4. Try to generate client (this will fail if schema doesn't match)
echo "4️⃣ Testing Prisma Client generation..."
npx prisma generate --schema=../prisma/schema.prisma > /tmp/generate_output.txt 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully - schema appears to be in sync!"
else
    echo "❌ Prisma Client generation failed - check errors:"
    cat /tmp/generate_output.txt
fi
echo ""

echo "📝 Summary:"
echo "   - If all checks pass, your schema is likely synced"
echo "   - Compare /tmp/db_introspection.txt with your schema.prisma for detailed differences"
echo "   - If using manual SQL, ensure schema.prisma matches your database structure"
