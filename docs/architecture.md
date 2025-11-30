# Architecture Overview

This document provides a short pointer to the repository's system design resources.

The project uses a microservices architecture with a central API Gateway that proxies requests to smaller services under `apps/`:

- `auth-service`
- `tenant-service`
- `patient-service`
- `consultation-service`
- `pharmacy-service`
- `frontend` (React + Vite)

Data layer:

- A management database (single schema) holds tenant and global metadata (Prisma management client).
- Each tenant uses a separate schema for tenant-specific data (Prisma tenant client).

For full architecture diagrams and detailed design considerations, see `docs/system_design.md` in this repository.
