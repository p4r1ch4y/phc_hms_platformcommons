FROM node:20-bullseye AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/database ./packages/database
COPY apps/tenant-service ./apps/tenant-service
COPY scripts/start-and-migrate.sh /app/start-and-migrate.sh

RUN npm install

# Generate Prisma Client
RUN npm run -w packages/database generate || true

WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/tenant-service
RUN npm run build

FROM node:20-bullseye

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/tenant-service ./apps/tenant-service
COPY --from=builder /app/start-and-migrate.sh /app/start-and-migrate.sh

WORKDIR /app/apps/tenant-service

ENV APP_DIR=/app/apps/tenant-service
RUN chmod +x /app/start-and-migrate.sh

EXPOSE 3002

CMD ["sh", "/app/start-and-migrate.sh"]
