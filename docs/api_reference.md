# API Design & Usage Guide

## Overview
The PHC Platform Commons API is a microservices-based system designed for multi-tenant hospital management. It uses a **Gateway Pattern**, meaning all requests should be routed through the API Gateway (default port: `3000`).

    "password": "securepassword",
    "name": "Dr. Admin",
    "role": "HOSPITAL_ADMIN",
    "tenantId": "uuid-of-tenant" // Optional if not yet linked
  }
  ```

### Login
Returns a JWT token.
- **POST** `/login`
- **Body**:
  ```json
  {
    "email": "admin@hospital.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGci...",
    # API Reference — PHC HMS

    All public API traffic should be routed through the API Gateway (default: `http://localhost:3000` when running locally). The gateway proxies to service-specific routes (e.g. `/auth`, `/tenants`, `/patients`, `/consultations`, `/pharmacy`).

    Authentication
    --------------

    Most endpoints require a Bearer JWT issued by the `Auth Service`. Include the header:

    ```
    Authorization: Bearer <token>
    ```

    For tenant-scoped operations also include the tenant header (if not present in the token):

    ```
    x-tenant-slug: <tenant-slug>
    ```

    1. Auth Service (`/auth`)
      - POST `/auth/register` — Register a user (public, rate-limited). Body: `email`, `password`, optional `name`, `role`, `tenantId`.
      - POST `/auth/login` — Login and receive `{ token, user }`.

    Example login request

    ```bash
    curl -X POST http://localhost:3000/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@demo.local","password":"P@ssw0rd"}'
    ```

    2. Tenant Service (`/tenants`)
      - POST `/tenants` — Create a new tenant (Super Admin or public onboarding). Body: `name`, `slug`, `address`, `adminEmail`, `adminPassword`, `adminName`.
      - GET `/tenants` — List tenants (Super Admin only).

    3. Patient Service (`/patients`)
      - POST `/patients` — Register a new patient (requires tenant context via header or token). Example body: `firstName`, `lastName`, `dateOfBirth`, `gender`, `phone`, `address`, `abhaId`.
      - POST `/patients/:patientId/vitals` — Record vitals for a patient.
      - GET `/patients` — List patients for the tenant (supports query params for pagination/filters).
      - GET `/patients/:id` — Get patient details including the last 10 vitals and consultations.

    4. Consultation Service (`/consultations`)
      - POST `/consultations` — Create a consultation/appointment.
      - PUT `/consultations/:id/diagnosis` — Update diagnosis/prescription (doctor-only in RBAC).
      - GET `/consultations` — List consultations (supports `patientId` / `doctorId` filters).

    5. Pharmacy Service (`/pharmacy`)
      - POST `/pharmacy/medicine` — Add medicine.
      - POST `/pharmacy/batch` — Add a batch for a medicine.
      - GET `/pharmacy/inventory` — Get medicine inventory with batch totals.

    Headers & common errors
    -----------------------
    - `400 Bad Request` — validation errors (Zod schema failures) return a structured JSON with `errors` array.
    - `401 Unauthorized` — missing or invalid JWT.
    - `403 Forbidden` — RBAC/authorization failure.
    - `500 Internal Server Error` — server-side error (check logs). Avoid exposing internal stack traces in production.

    Notes
    -----
    - Use `validateBody(...)` middleware provided by `@phc/common` for frontend forms to match server validation.
    - All tenant-specific reads/writes must include tenant context; otherwise, the service will return `400` with `Tenant slug header missing`.

    For a quick end-to-end smoke test see the `docs/misc/hosting_options.md` and the curl examples in the project root `scripts/` folder.
---
