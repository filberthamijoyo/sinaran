# Complete Setup Guide - Yarn Quality ERP

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Database Setup ✅

You've already created the database using the SQL script. Verify it's working:

```bash
psql -U your_username -d yarn_quality_erp -c "SELECT COUNT(*) FROM count_descriptions;"
```

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
# From project root
npm install
```

### 2.2 Configure Environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/yarn_quality_erp"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2.3 Generate Prisma Client

```bash
npm run prisma:generate --workspace=apps/api
```

### 2.4 Start Backend Server

```bash
npm run dev:api
```

Backend should be running at `http://localhost:3001`

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

```bash
# From project root
npm install
```

### 3.2 Configure API URL (Optional)

Create `.env` in project root:
```env
REACT_APP_API_URL=http://localhost:3001/api/quality
```

### 3.3 Start Frontend

```bash
npm start
```

Frontend should be running at `http://localhost:3000`

## Step 4: Test Everything

1. **Test Backend API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test Frontend:**
   - Open `http://localhost:3000`
   - Fill out the form
   - Submit and verify data is saved

3. **Verify Database:**
   ```bash
   psql -U your_username -d yarn_quality_erp -c "SELECT * FROM yarn_tests LIMIT 5;"
   ```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Run `npm run prisma:generate` again

### Frontend can't connect to API
- Check backend is running on port 3001
- Verify CORS settings in `apps/api/src/server.ts`
- Check browser console for errors

### Prisma errors
- Make sure database exists
- Run `npx prisma db pull` to sync schema
- Run `npm run prisma:generate` again

## Next Steps

1. Add remaining dimension table routes (SPKs, Yarn Types, etc.)
2. Create admin pages for managing dimension tables
3. Add data listing/search page
4. Add reports and analytics
