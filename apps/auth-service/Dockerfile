FROM node:20-bullseye AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/database ./packages/database
COPY apps/auth-service ./apps/auth-service
COPY scripts/start-and-migrate.sh /app/start-and-migrate.sh

RUN npm install

# Generate Prisma Client for packages/database so generated clients exist in final image
RUN npm run -w packages/database generate || true

WORKDIR /app/packages/database
RUN npm run build
 
WORKDIR /app/packages/common
RUN npm run build
RUN echo "-- prisma version --" && npx prisma --version || true
RUN echo "-- generated clients listing --" && ls -la /app/packages/database/generated || true
RUN echo "-- generated clients tree --" && find /app/packages/database/generated -maxdepth 2 -type d -print || true

WORKDIR /app/apps/auth-service
RUN npm run build

FROM node:20-bullseye

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/auth-service ./apps/auth-service
COPY --from=builder /app/start-and-migrate.sh /app/start-and-migrate.sh

WORKDIR /app/apps/auth-service

ENV APP_DIR=/app/apps/auth-service
RUN chmod +x /app/start-and-migrate.sh

EXPOSE 3001

CMD ["bash", "/app/start-and-migrate.sh"]
