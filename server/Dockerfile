# Dependencies stage
FROM oven/bun:1.1.42 AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
RUN bun install --frozen-lockfile --production=false

# Build stage (if needed for any compilation)
FROM oven/bun:1.1.42 AS builder
WORKDIR /app

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM oven/bun:1.1.42 AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 bunjs

# Copy dependencies and application code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set correct permissions
RUN chown -R bunjs:bunjs /app
USER bunjs

# Expose port
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3030/ || exit 1

# Start the application
CMD ["bun", "run", "start"] 