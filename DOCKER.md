# Docker Setup for ERP Sinaran

This guide explains how to run ERP Sinaran using Docker and Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- At least 4GB of RAM available for containers

## Quick Start

### Production Mode

1. **Build and start all services:**
   ```bash
   npm run docker:up
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/api/health

3. **Stop all services:**
   ```bash
   npm run docker:down
   ```

### Development Mode

For development with hot reload (code changes reflected immediately):

1. **Build and start in development mode:**
   ```bash
   npm run docker:dev
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - PostgreSQL: localhost:5432

3. **Stop all services:**
   ```bash
   npm run docker:down
   ```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build all Docker images |
| `npm run docker:up` | Start all services in production mode |
| `npm run docker:down` | Stop all services |
| `npm run docker:dev` | Start all services in development mode |
| `npm run docker:dev:build` | Rebuild images for development |
| `npm run docker:logs` | View logs from all containers |
| `npm run docker:logs:api` | View API logs only |
| `npm run docker:logs:frontend` | View frontend logs only |
| `npm run docker:clean` | Remove all containers and images |
| `npm run docker:rebuild` | Clean rebuild of all services |

## Services

### Frontend (Nginx)
- **Port:** 3000
- **Description:** React SPA served via Nginx
- **API Proxy:** Forwarded to API service

### API (Node.js)
- **Port:** 3001
- **Description:** Express.js backend API
- **Health Check:** http://localhost:3001/api/health
- **Database:** Neon PostgreSQL (cloud)

## Environment Variables

This project uses **Neon** (cloud PostgreSQL) for the database. You can either:

1. Use the default Neon credentials (already configured)
2. Set your own `DATABASE_URL` environment variable

| Variable | Default Value | Description |
|----------|---------------|-------------|
| DATABASE_URL | (Neon connection string) | PostgreSQL connection string |
| API_PORT | 3001 | Backend API port |
| FRONTEND_PORT | 3000 | Frontend port |
| PRISMA_CLIENT_ENGINE_TYPE | binary | Prisma engine mode |

### Custom Database

To use your own database, set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
npm run docker:up
```

## Database

Your Neon database is already set up. Run Prisma migrations to ensure your schema is up to date:

```bash
# Run migrations
docker-compose exec api npx prisma migrate deploy
```

For development, you can run migrations locally:
```bash
npx prisma migrate deploy
```

## Troubleshooting

### Container won't start
```bash
# Check logs
npm run docker:logs

# Rebuild from scratch
npm run docker:rebuild
```

### Database connection issues
Make sure your Neon database is accessible and the connection string is correct:
- Check that your Neon project is active
- Verify the `DATABASE_URL` in your environment
- Check the Neon connection string in your dashboard

```bash
# Check API logs
npm run docker:logs:api
```

### Port already in use
Stop other services using ports 3000 or 3001, or modify the ports in `docker-compose.yml`.

### Need to reset everything
```bash
npm run docker:clean
```

## Production Deployment

For production deployment:

1. Update passwords in environment variables
2. Consider using external database for production
3. Set up SSL/TLS termination with Nginx
4. Configure proper CORS settings in the API

## Architecture

```
┌─────────────────────────────────────────┐
│           Nginx (Port 3000)              │
│  ┌─────────────────────────────────┐    │
│  │     React Frontend (SPA)        │    │
│  │                                 │    │
│  │   Proxy /api -> API:3001        │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│         Node.js API (Port 3001)         │
│                                         │
│   Express + Prisma + PostgreSQL Client  │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     Neon PostgreSQL (Cloud)             │
│                                         │
│   ep-plain-dust-a1bggj1v-pooler...      │
└─────────────────────────────────────────┘
```
