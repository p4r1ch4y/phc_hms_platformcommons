# Railway Deployment Guide for PHC Platform (Monorepo)

Since this is a monorepo, Railway needs to know exactly where the Dockerfile is for each service, while keeping access to the shared packages.

## Critical Configuration
For **EVERY** service (Frontend, Gateway, Auth, etc.), you must set the following in the Railway Dashboard:

1.  **Root Directory**: Leave as `/` (or empty).
    *   *Why?* Our Dockerfiles need to copy `packages/common` and `packages/database`, so the build context must be the root of the repository.

2.  **Builder**: Select **Dockerfile**.

3.  **Dockerfile Path**: Point to the specific service's Dockerfile.
    *   **Frontend**: `apps/frontend/Dockerfile`
    *   **API Gateway**: `apps/api-gateway/Dockerfile`
    *   **Auth Service**: `apps/auth-service/Dockerfile`
    *   **Tenant Service**: `apps/tenant-service/Dockerfile`
    *   **Patient Service**: `apps/patient-service/Dockerfile`
    *   **Consultation Service**: `apps/consultation-service/Dockerfile`
    *   **Pharmacy Service**: `apps/pharmacy-service/Dockerfile`

## Step-by-Step Fix
1.  Go to your Railway Project Dashboard.
2.  Click on **phc-frontend**.
3.  Go to **Settings** -> **Build**.
4.  Change **Builder** to **Dockerfile**.
5.  Set **Dockerfile Path** to `apps/frontend/Dockerfile`.
6.  Ensure **Root Directory** is `/`.
7.  Repeat for `phc-api-gateway` and `phc-auth-service`.

## Environment Variables
Make sure to add the required environment variables for each service in the **Variables** tab.
*   **Frontend**: `VITE_API_URL`
*   **Gateway**: `AUTH_SERVICE_URL`, `TENANT_SERVICE_URL`, etc.
*   **Services**: `DATABASE_URL`, `JWT_SECRET`

## Why the Build Failed
Railway tried to use "Nixpacks" (its default builder) which couldn't automatically figure out how to build our complex monorepo structure. Forcing it to use our custom Dockerfiles fixes this.
