# ---- Stage 1: Build ----
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency manifests first (Docker layer caching optimisation)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for potential build steps)
RUN npm ci

# Copy application source
COPY . .

# ---- Stage 2: Production ----
FROM node:18-alpine

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only (smaller image)
RUN npm ci --only=production && npm cache clean --force

# Copy application source from builder (or directly, since no build step)
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/migrate-mongo-config.js ./migrate-mongo-config.js
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/create_super_admin.js ./create_super_admin.js

# Expose backend port
EXPOSE 5000

# Switch to non-root user
USER appuser

# Health check — hit the health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

# Start the server
CMD ["node", "server.js"]
