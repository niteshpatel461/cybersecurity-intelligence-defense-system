# =====================================================
# SentinelCore Security Hub - Production Dockerfile
# Multi-stage secure build with non-root runtime
# =====================================================

# Stage 1: Dependency builder
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies (only production deps)
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Minimal hardened production image
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production \
    PORT=5000 \
    CORS_ORIGIN=http://localhost:5173

# Install curl for container health check
RUN apk add --no-cache curl

# Copy runtime dependencies and application source
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY prisma ./prisma

# Create data directory with proper non-root ownership
RUN mkdir -p ./data && chown -R node:node /usr/src/app

# Run as non-privileged 'node' user (Defense in Depth)
USER node

# Expose API port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the SentinelCore API server
CMD ["node", "src/index.js"]

