# Next.js Web App with Bun
FROM oven/bun:1-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package.json
COPY apps/web/package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY apps/web .

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["bun", "run", "start"]