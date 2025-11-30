FROM node:20-bullseye AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/database ./packages/database
COPY apps/patient-service ./apps/patient-service

RUN npm install

WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/patient-service
RUN npm run build

FROM node:18-bullseye

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/patient-service ./apps/patient-service

WORKDIR /app/apps/patient-service

EXPOSE 3003

CMD ["node", "dist/index.js"]
