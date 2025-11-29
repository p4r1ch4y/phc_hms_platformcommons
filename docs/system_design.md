# System Design - PHC Hospital Management System

## Architecture Overview

The system follows a **Microservices Architecture** with a **Multi-tenant Database** strategy using PostgreSQL Schemas.

```
graph TD
    Client[Client (Web/Mobile)] --> Gateway[API Gateway (Express)]
    
    subgraph "Core Services"
        Gateway --> Auth[Auth Service]
        Gateway --> Tenant[Tenant Service]
        Gateway --> Patient[Patient Service]
        Gateway --> Consult[Consultation Service]
    end
    
    subgraph "Data Layer"
        Auth --> DB[(PostgreSQL)]
        Tenant --> DB
        Patient --> DB
        Consult --> DB
    end
        string id PK
        string slug "Schema Name"
        string name
    }
    User {
        string id PK
        string email
        enum role "ADMIN, DOCTOR, NURSE"
    }

    %% Tenant Schema (Repeated per Tenant)
    Patient ||--|{ Vitals : "has"
    Patient ||--|{ Consultation : "has"
    Patient {
        string id PK
        string name
        date dob
    }
    Consultation {
        string id PK
        string diagnosis
        string prescription
    }
```

## Request Flow

1. **Authentication**: User logs in via `Auth Service` and receives a JWT containing `userId`, `role`, and `tenantId`.
2. **Routing**: `API Gateway` forwards requests to appropriate services.
3. **Context Propagation**: Services extract `tenantId` (slug) from headers or token.
4. **Data Access**: Services use a dynamic `PrismaClient` configured with the specific tenant schema URL (`postgres://...?schema=tenant_slug`).

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Containerization**: Docker, Docker Compose
- **Workspace**: npm workspaces (Monorepo)
