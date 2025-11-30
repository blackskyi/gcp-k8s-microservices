# Multi-stage build for Node.js frontend
FROM node:20-alpine3.19 AS builder

# Set working directory
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade --no-cache

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY . .

# Production stage
FROM node:20-alpine3.19

# Install security updates and curl for healthcheck
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache curl=8.5.0-r0 || apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy from builder
COPY --from=builder /app /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]
