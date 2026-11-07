# =====================================================
# SentinelCore Security Hub - Production Dockerfile
# Multi-stage secure build with non-root runtime
# =====================================================

# Stage 1: Dependency builder
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY server/package*.json ./
RUN npm ci --omit=dev

# Stage 2: Minimal hardened production image
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=5000 \
    CORS_ORIGIN=http://localhost:5173

RUN apk add --no-cache curl

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY server/package*.json ./
COPY server/src ./src
COPY server/prisma ./prisma

RUN mkdir -p ./data && chown -R node:node /usr/src/app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "src/index.js"]

