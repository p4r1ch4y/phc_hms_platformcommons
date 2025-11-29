<!-- .github/copilot-instructions.md - repository-specific guidance for AI coding agents -->

# Quick Orientation

- This repo is a TypeScript monorepo using npm workspaces. Top-level workspaces: `apps/*` and `packages/*`.
- Services live in `apps/` (microservice style): `api-gateway`, `auth-service`, `tenant-service`, `patient-service`, `consultation-service`, `pharmacy-service`, and `frontend`.
- Shared code and DB tooling live in `packages/`: `@phc/common` and `@phc/database`.

# Key workflows (commands you should use)

- Install deps (root):

  `npm install`

- Run all services in dev (root):

  `npm run dev`

  This runs `nodemon`/`vite` for each service via `concurrently`. To run a single service use workspace flag:

  `npm run dev -w apps/auth-service`

- Build all services (root):

  `npm run build`

- Dockerized dev (recommended for full integration):

  `docker-compose up --build`

  Notes: Postgres is defined in `docker-compose.yml` (host port `5434` mapped to container `5432`). Services connect to Postgres internally as `postgres`.

- Prisma / DB tasks (see `packages/database/package.json`):

  - Generate clients: `npm run -w packages/database generate`
  - Run management migration: `npm run -w packages/database migrate:management`
  - Push tenant schema: `npm run -w packages/database push:tenant`

- Seed scripts: `scripts/seed-user.js`, `scripts/seed-tenant-and-user.js` (run with `node` / `ts-node` as appropriate).

# Project conventions and patterns (do not invent different patterns)

- Service layout: each `apps/<service>/src` uses an `index.ts` entry with `controllers/` and `routes/` subfolders. Follow existing patterns when adding endpoints.
- Shared libs: `@phc/common` holds validation (Zod), middleware, utils and must be imported as workspace packages (already referenced with `file:` in `package.json`). Do not publish forks — keep workspace references while developing locally.
- Database: `@phc/database` contains Prisma schemas in `packages/database/prisma/*.prisma` and generated clients in `packages/database/generated/`. Always run `prisma generate` after schema changes.
- Config & env: Docker compose sets many runtime env vars (e.g. `DATABASE_URL`, `JWT_SECRET`, service URLs). For local non-container dev, mirror these in a `.env` or your shell before starting services.
- Authentication: services share a `JWT_SECRET` and rely on `jsonwebtoken` via `@phc/common` patterns. When adding auth logic, reuse `@phc/common` helpers.

# Integration points to be aware of

- API Gateway proxies: `apps/api-gateway` uses `http-proxy-middleware` with env vars like `AUTH_SERVICE_URL`, `TENANT_SERVICE_URL`, etc. Keep those names consistent when adding services.
- Inter-service comms assume HTTP + hostname from Docker compose. E.g., in compose the `auth-service` is reachable as `http://auth-service:3001`.
- Postgres: defined in `docker-compose.yml` with user `postgres` / password `postgres` and DB `phc_hms`.

# Files to inspect for examples

- Entry points: `apps/*/src/index.ts`
- Controllers & routes: `apps/*/src/controllers/*`, `apps/*/src/routes/*`
- Shared utilities: `packages/common/src` and `packages/common/index.ts`
- Prisma schemas: `packages/database/prisma/*.prisma` and scripts in `packages/database/package.json`
- Compose + infra: `docker-compose.yml` and `apps/*/Dockerfile`

# Useful notes for code changes

- Prefer modifying TypeScript source under `src/` and run `npm run build` (or `tsc`) to verify compilation.
- Dev runs (`nodemon`) target `.ts` source files — ensure `ts-node` is present in devDependencies if you change dev scripts.
- When changing database schemas: update Prisma schema, run `npm run -w packages/database generate` and apply migrations with the migrate scripts.
- Keep environment variable names and API endpoints consistent with `docker-compose.yml` to avoid mismatches between containerized and local dev.

# What I will ask you when I need clarification

- Which service should be run locally vs in container? (some devs only run frontend + gateway)
- Should I add or edit Prisma migrations or only adjust generated clients?

---
If anything here is inaccurate or you'd like more detail on a specific service (for example `auth-service` flows or the Prisma tenant schema), tell me which area and I'll expand the guidance or add quick runnable examples.
