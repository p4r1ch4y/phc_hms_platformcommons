# PHC Commons : Platform for Health Care Centers

A comprehensive Hospital Management System (HMS) designed for Primary Health Centres (PHCs) in India. This platform enables efficient patient management, consultation tracking, pharmacy inventory, and reporting, with a focus on usability and offline-first capabilities.

## Features
- **Multi-Tenant Architecture**: Supports multiple PHCs with data isolation.
- **Role-Based Access Control (RBAC)**: Granular permissions for Doctors, Nurses, Pharmacists, ASHAs, and Admins.
- **Patient Management**: Registration (ABHA ID integration), Vitals recording, and History tracking.
- **Consultation**: Digital diagnosis, prescription generation, and voice-to-text notes (planned).
- **Pharmacy**: Inventory management, batch tracking, and low-stock alerts.
- **Smart Triage**: Automated risk scoring based on vitals.
- **OCR Integration**: Scan medical reports and IDs for quick data entry.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express (Microservices)
- **Database**: PostgreSQL (Supabase), Prisma ORM
- **Infrastructure**: Docker, Nginx/Express Gateway

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (or Supabase account)

### Local Development
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/p4r1ch4y/phc_platformcommons.git
    cd phc_platformcommons
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    - Copy `.env.example` to `.env` (if available) or create one based on `packages/database/.env`.
    - Ensure `DATABASE_URL` points to your Postgres instance.

4.  **Run Database Migrations**:
    ```bash
    npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
    ```

5.  **Start Services**:
    ```bash
    npm run dev
    ```
    This starts all microservices and the frontend concurrently.

### Deployment

#### Docker (Local/VPS)
```bash
docker-compose up --build -d
```

#### Render (Cloud)
This repository includes a `render.yaml` blueprint for easy deployment on Render.
1.  Connect your GitHub repository to Render.
2.  Select "Blueprints" and choose this repo.
3.  Render will automatically detect the `render.yaml` and prompt for environment variables.

## Documentation
- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api_reference.md)
- [SaaS Guide](docs/saas_guide.md)

## Contributing
Please read the [Contribution Guidelines](CONTRIBUTING.md) before submitting a Pull Request.
