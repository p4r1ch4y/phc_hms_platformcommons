# SaaS Platform Guide

## 1. For SaaS Owners (Platform Administrators)

### Onboarding a New PHC (Hospital)
As the platform owner, your primary job is to onboard new Primary Health Centers (PHCs).
1.  **Access**: Use the Super Admin credentials.
2.  **Action**: Call the `POST /tenants` endpoint (or use the Admin Dashboard).
3.  **Input**: Provide the Hospital Name, Unique Slug (e.g., `phc_karnataka_01`), and initial Admin Email.
4.  **Outcome**:
    -   A new **Tenant Record** is created in the Management Database.
    -   A new **PostgreSQL Schema** (e.g., `phc_karnataka_01`) is automatically provisioned.
    -   The initial Hospital Admin user is created.
    -   **Data Isolation**: All data for this PHC will strictly reside in its own schema.

### Monitoring
-   Monitor the `Management` schema for total registered tenants.
-   Check API Gateway logs for traffic patterns.

---

## 2. For SaaS Customers (Hospital Admins & Staff)

### Getting Started
1.  **Login**: Use the credentials provided by the SaaS Owner.
2.  **Dashboard**: You will see data *only* for your PHC.

### Managing Staff
-   **Hospital Admin**: Can create accounts for Doctors, Nurses, and Pharmacists.
-   **Role-Based Access**:
    -   **Doctors**: Can view patients, diagnose, and prescribe.
    -   **Nurses**: Can register patients and record vitals.

### Patient Flow
1.  **Registration**: Receptionist/Nurse registers a new patient.
2.  **Vitals**: Nurse records temperature, BP, etc.
3.  **Consultation**: Patient appears in the Doctor's queue. Doctor adds diagnosis and prescription.

---

## 3. For Developers

### Architecture
-   **Monorepo**: All code in one repo, managed by `npm workspaces`.
-   **Microservices**:
    -   `auth-service`: Global user management.
    -   `tenant-service`: Schema provisioning.
    -   `patient-service`: Tenant-aware patient data.
    -   `consultation-service`: Tenant-aware medical records.

### Multi-tenancy Implementation
We use **Schema-based Multi-tenancy**.
-   **Global Data**: `public` schema (Tenants, Users).
-   **Tenant Data**: `tenant_slug` schema (Patients, Vitals, Consultations).
-   **Dynamic Client**: The `getTenantClient(slug)` utility dynamically connects to the correct schema at runtime.

### Running Locally
1.  `npm install`
2.  `docker-compose up -d` (Starts Postgres)
3.  `npm run dev` (Starts all services concurrently)

### Adding a New Service
1.  Create folder in `apps/`.
2.  Add `package.json` and `tsconfig.json`.
3.  Register in root `package.json` workspaces.
4.  Add route proxy in `apps/api-gateway`.
