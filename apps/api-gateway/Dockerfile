FROM node:20-bullseye AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY packages/common ./packages/common
COPY packages/database ./packages/database

# Copy service source
COPY apps/api-gateway ./apps/api-gateway
COPY scripts/start-and-migrate.sh /app/start-and-migrate.sh

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npm run -w packages/database generate || true
WORKDIR /app/packages/database
RUN npm run build

# Build service
WORKDIR /app/apps/api-gateway
RUN npm run build

# Production image
FROM node:20-bullseye

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-gateway ./apps/api-gateway
COPY --from=builder /app/start-and-migrate.sh /app/start-and-migrate.sh

WORKDIR /app/apps/api-gateway

ENV APP_DIR=/app/apps/api-gateway
RUN chmod +x /app/start-and-migrate.sh

EXPOSE 3000

CMD ["sh", "/app/start-and-migrate.sh"]
