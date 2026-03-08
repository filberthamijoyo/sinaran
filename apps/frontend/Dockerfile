# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts

# ============================================
# Stage 2: Build the Next.js app
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app with standalone output for smaller image
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================
# Stage 3: Production - Serve with Nginx
# ============================================
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Next.js static files from builder
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --builder /app/public /usr/share/nginx/html

# Also copy the standalone output if needed for Next.js server
# For pure static export, we use the _next/static folder
# For dynamic Next.js features, use the standalone output

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
