# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/

# Install dependencies using npm (npm workspaces install to root node_modules)
RUN npm ci --ignore-scripts

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy the entire node_modules from deps (includes all workspace deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma Client
WORKDIR /app/packages/prisma
RUN npx prisma generate

# Build the packages (compile TypeScript)
WORKDIR /app/packages
RUN npm run build --workspace=@erp-sinaran/prisma

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 erpuser

# Copy package files for production dependencies
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/prisma ./packages/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@erp-sinaran ./node_modules/@erp-sinaran

# Copy source files needed at runtime
COPY --from=builder /app/apps/api/src ./apps/api/src

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    PRISMA_CLIENT_ENGINE_TYPE=binary

# Change to non-root user
USER erpuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the API server
CMD ["node", "apps/api/dist/server.js"]
