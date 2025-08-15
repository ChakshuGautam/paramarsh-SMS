# NestJS API with Bun
FROM oven/bun:1-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package.json
COPY apps/api/package.json ./

# Install dependencies
RUN bun install

# Copy prisma schema and generate client
COPY apps/api/prisma ./prisma
RUN bunx prisma generate

# Copy source code
COPY apps/api/src ./src
COPY apps/api/nest-cli.json ./
COPY apps/api/tsconfig*.json ./

# Build the application
RUN bun run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 8080

# Start script
RUN echo '#!/bin/sh\n\
# Run migrations\n\
bunx prisma migrate deploy\n\
\n\
# Seed database if empty\n\
if [ ! -s "/app/data/dev.db" ]; then\n\
  echo "Database is empty, running seed..."\n\
  bun run prisma:seed\n\
fi\n\
\n\
# Start the application\n\
bun run start:prod' > /app/start.sh

RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Start the application
CMD ["./start.sh"]