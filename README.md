# PHC Commons : Platform for Health Care Centers

<div align="center">

 [![PHC Logo](docs/assets/logo.png)](https://phccommons.vercel.app/)

**Manage your PHC in a Smarter Digital way under one place**

*We take care of the documentation — so that you can focus more on caring*


[Live Demo](https://phccommons.vercel.app/) • [Documentation](./docs/saas_guide.md) • [Architecture](./docs/system_design.md) • [Contributing](CONTRIBUTING.md)

</div>

# What is PHC Commons?

A comprehensive Hospital Management System (HMS) designed for Primary Health Centres (PHCs) in India.

Built during Hackarena 2.0 Hackathon by [Platform Commons](https://plaformcommons.org/) and [Masai School](https://masaischool.com)

This platform enables efficient patient management, consultation tracking, pharmacy inventory, and reporting, with a focus on usability and offline-first capabilities.



## Features
- **Multi-Tenant Architecture**: Supports multiple PHCs with data isolation.
- **Role-Based Access Control (RBAC)**: Granular permissions for Doctors, Nurses, Pharmacists, ASHAs, and Admins.
- **Patient Management**: Registration (ABHA ID integration), Vitals recording, and History tracking.
- **Consultation**: Digital diagnosis, prescription generation, and voice-to-text notes (planned).
- **Pharmacy**: Inventory management, batch tracking, and low-stock alerts.
- **Smart Triage**: Automated risk scoring based on vitals.
- **OCR Integration**: Scan medical reports and IDs for quick data entry.


## Architecture Overview

The platform follows a microservices architecture with schema-based multi-tenancy on PostgreSQL. An API Gateway routes requests to smaller services (auth, tenant management, patient, consultation, pharmacy, etc.).

See `docs/system_design.md` for the full architecture and diagrams.

## 🌟 Features

![Lamding Page](/docs/assets/landingPage_screenshot.png )

### Core Functionality

- Hospital and PHC Onboarding: Self-service registration for Primary Health Centres and small hospitals with tenant isolation per facility.
- End-to-End Patient Flow: Registration → Vitals capture → Doctor consultation → Diagnosis → Prescription → Pharmacy and Lab.
- Role-Based Workspaces: Dedicated views and menus for admin, doctor, nurse, lab technician, pharmacy, and front-desk operators.
- PHC-Friendly OPD Queue and Visit/Prescription Records.
- Inventory and Pharmacy Basics: Medicine catalogue, stock tracking, and prescription dispensing flows.

### AI-Assisted and Paper-to-Digital

![OCR and Image Scan or Upload Function](/docs/assets/ORC_Tessaract_screenshot.png)


- Paper Record Upload and OCR-ready pipeline (hooks available to plug external providers).
- Structured data mapping to patient profiles, visits, and prescriptions.

## 🚀 Tech Stack

### Frontend

- React + Vite in a modular monorepo (npm workspaces).
- TypeScript, Tailwind CSS, React Router, React Query (or similar).

### Backend and Platform

- Node.js services organized under `apps/`.
- Express for HTTP APIs and Prisma ORM for Postgres schema and migrations.
- Multi-tenant design using per-tenant schemas and a management database.

### Infrastructure and Deployment

- Monorepo using npm workspaces.
- Docker Compose for local integration (Postgres on host port `5434` by default in `docker-compose.yml`).
- CI/CD via GitHub Actions; optional Render/other cloud deploys.

## 📦 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose (optional, recommended for full integration)
- PostgreSQL (or Supabase project)

### Installation

1. Clone and install:

   ```bash
   git clone https://github.com/p4r1ch4y/phc_hms_platformcommons.git
   cd phc_hms_platformcommons
   npm install
   ```

2. Environment setup:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set at least `DATABASE_URL` and `JWT_SECRET`. Example values are in `.env.example`.

3. Database setup (Prisma):

   ```bash
   npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
   ```

4. Run services:

   ```bash
   # start all services (root workspace script)
   npm run dev

   # or run one workspace
   npm run dev -w apps/api-gateway
   npm run dev -w apps/auth-service
   npm run dev -w apps/frontend
   ```

5. Open in browser:

- Frontend (Vite): http://localhost:5173
- API Gateway: http://localhost:<api-gateway-port>


### Infrastructure and Deployment

- Monorepo with npm workspaces for apps and shared packages.
- Frontend hosting on:
  - Vercel free tier for smoother previews and environment management.
- Backend services on Azure App Service
- Database on Supabase free-tier PostgreSQL.
- GitHub Actions for CI/CD (linting, tests, and automated deployments).

Frontend is Deployed on vercel : https://phccommons.vercel.app/

Backend Services are hosted as Azure Container : 

All Docker images can be fetched from :

Docker Hub :  https://hub.docker.com/r/notsubrata/

Example : 
with docker cli

```
docker pull notsubrata/phc-frontend:v1
```

Notes
- When running in Docker Compose, Postgres is mapped to host port `5434` (see `docker-compose.yml`).
- After changing Prisma schemas, run `npm run -w packages/database generate` to refresh generated clients.

## Getting Started (short)

- Install: `npm install`
- Copy `.env.example` → `.env` and fill values
- Run migrations: `npx prisma migrate dev --schema=packages/database/prisma/schema.prisma`
- Start dev: `npm run dev`

## Documentation

- [Architecture Overview](docs/architecture.md)
- [System Design](docs/system_design.md)
- [API Reference](docs/api_reference.md)
- [SaaS Guide](docs/saas_guide.md)

## Contributing

Please read the [Contribution Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

## License

See `LICENSE` in the repo (if present) or add an appropriate license for your project.


Built With Love and Care 