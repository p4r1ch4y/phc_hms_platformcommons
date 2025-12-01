# SYSTEM_HOSTING.md

## Overview
This repository is a TypeScript monorepo for the PHC HMS platform. It uses npm workspaces and contains multiple microservices (apps/) and shared packages (packages/). Development is supported both locally and via Docker Compose for containerized hosting.

## Core services
- apps/api-gateway
- apps/auth-service
- apps/tenant-service
- apps/patient-service
- apps/consultation-service
- apps/pharmacy-service
- apps/frontend

## Shared packages
- packages/@phc/common — Zod validation, middleware, utils, auth helpers
- packages/@phc/database — Prisma schemas and generated clients

## Repository layout (important)
- apps/*/src
    - index.ts (service entry)
    - controllers/
    - routes/
- packages/database/prisma/*.prisma (Prisma schemas)
- packages/database/generated/ (Prisma generated clients)
- packages/common/src (shared helpers, middleware)

Follow existing patterns for new endpoints and reuse @phc/common helpers.

## Local development (non-container)
- Install dependencies (root): `npm install`
- Run all services: `npm run dev`
- Run a single service: `npm run dev -w apps/<service-name>` (e.g., `-w apps/auth-service`)
- Build all services: `npm run build`
- Seed scripts: `scripts/seed-user.js`, `scripts/seed-tenant-and-user.js` (run with node / ts-node)

Notes:
- Dev runs use nodemon/ts-node; ensure devDependencies are present.
- Keep env vars in a `.env` or your shell to mirror Docker Compose values for local runs.

## Dockerized hosting (recommended for full integration)
- Start containers: `docker-compose up --build`
- Docker Compose provisions Postgres and service containers. Services use Docker hostnames for inter-service HTTP calls (e.g., `http://auth-service:3001`).

Important mappings (from docker-compose):
- Postgres container internal port: `5432`
- Host port mapped for Postgres: `5434` -> container `5432`
- DB user/password/database: `postgres` / `postgres` / `phc_hms`

## Environment & configuration
- Docker Compose sets runtime env vars used by services (DATABASE_URL, JWT_SECRET, service URLs, etc.). Mirror these values locally if not using containers.
- Services expect a shared `JWT_SECRET` for auth.
- API Gateway relies on env vars like `AUTH_SERVICE_URL`, `TENANT_SERVICE_URL`, `PATIENT_SERVICE_URL`, etc., to proxy requests.

## Inter-service communication
- Services communicate over HTTP by hostname when running in Docker Compose.
- Example: `http://auth-service:3001` (service hostnames match compose service names).

## Database & Prisma
- After schema changes run: `npm run -w packages/database generate` (prisma generate)
- Management migration: `npm run -w packages/database migrate:management`
- Push tenant schema: `npm run -w packages/database push:tenant`
- Generated clients live in `packages/database/generated/`. Always regenerate after schema edits.

## Deployment considerations
- Keep env var names consistent with docker-compose and gateway expectations.
- When adding services, update API Gateway proxy envs and compose entries.
- Ensure Prisma migrations / generated clients are up to date before deploying.

## Useful commands summary
- Install: `npm install`
- Dev (all): `npm run dev`
- Dev (single): `npm run dev -w apps/<service>`
- Build: `npm run build`
- Docker compose: `docker-compose up --build`
- Prisma generate: `npm run -w packages/database generate`
- Migrate management: `npm run -w packages/database migrate:management`
- Push tenant schema: `npm run -w packages/database push:tenant`

## Notes & conventions
- Do not change workspace package references to published packages; keep local `file:` workspace references.
- Follow existing controllers/routes layout when adding endpoints.
- Reuse `@phc/common` for auth, validation, and middleware.
- If you need details for a specific service (auth flows, tenant schema, or Prisma setup), request that section and examples will be provided.
## Cloud hosting (Vercel / Azure / Docker Hub)

- Frontend
    - Deployed as a Vite stack on Vercel: https://phccommons.vercel.app/

- Backend
    - Backend services are hosted as Azure Container instances (containerized deployments).
    - Services are connected to the database using the Supabase DB URL (set the Supabase connection URL and keys in your Azure container environment variables).

- Docker images
    - All service images are published to Docker Hub: https://hub.docker.com/r/notsubrata/
    - Example (docker CLI):
        ```
        docker pull notsubrata/phc-frontend:v1
        ```