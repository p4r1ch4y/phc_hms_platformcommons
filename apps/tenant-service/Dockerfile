FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/database ./packages/database
COPY apps/tenant-service ./apps/tenant-service

RUN npm install

WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app/apps/tenant-service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/tenant-service ./apps/tenant-service

WORKDIR /app/apps/tenant-service

EXPOSE 3002

CMD ["node", "dist/index.js"]
