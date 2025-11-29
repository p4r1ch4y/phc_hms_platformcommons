FROM node:18-alpine AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY packages/common ./packages/common
COPY packages/database ./packages/database

# Copy service source
COPY apps/api-gateway ./apps/api-gateway

# Install dependencies
RUN npm install

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build service
WORKDIR /app/apps/api-gateway
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-gateway ./apps/api-gateway

WORKDIR /app/apps/api-gateway

EXPOSE 3000

CMD ["node", "dist/index.js"]
