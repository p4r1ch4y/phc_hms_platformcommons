# Deployment Options for PHC Platform

Since Render Blueprints (Infrastructure as Code) are a paid feature, here are three alternative ways to host or test your application.

## Option 1: Manual Render Deployment (Free Tier)
You can deploy each service manually on Render's free tier. This takes more setup time but is free.

### Steps:
1.  **Create a New Web Service** for the **Frontend**:
    *   **Name:** `phc-frontend`
    *   **Runtime:** Docker
    *   **Repo:** Connect your repo
    *   **Docker Path:** `./apps/frontend/Dockerfile`
    *   **Context:** `.`
    *   **Env Vars:** `VITE_API_URL` = `https://phc-api-gateway.onrender.com` (You'll get this URL after deploying the gateway)

2.  **Create a New Web Service** for the **API Gateway**:
    *   **Name:** `phc-api-gateway`
    *   **Runtime:** Docker
    *   **Docker Path:** `./apps/api-gateway/Dockerfile`
    *   **Context:** `.`
    *   **Env Vars:**
        *   `AUTH_SERVICE_URL` = `https://phc-auth-service.onrender.com`
        *   (Repeat for all other service URLs)

3.  **Create 5 Private Services** (or Web Services) for Microservices:
    *   For each service (`auth`, `tenant`, `patient`, `consultation`, `pharmacy`):
    *   **Runtime:** Docker
    *   **Docker Path:** `./apps/[service-name]/Dockerfile`
    *   **Context:** `.`
    *   **Env Vars:** `DATABASE_URL`, `JWT_SECRET`

**Pros:** Free.
**Cons:** Tedious setup; Free tier services "sleep" after inactivity, causing slow initial loads.

---

## Option 2: Railway (Easiest for Monorepos)
Railway has excellent support for monorepos and Docker without complex configuration.

### Steps:
1.  Login to [Railway.app](https://railway.app/).
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Railway will detect the multiple Dockerfiles.
4.  It allows you to deploy them as separate services within a project.
5.  You can link them using internal networking variables (e.g., `AUTH_SERVICE_URL` = `${{ Auth Service.RAILWAY_INTERNAL_URL }}`).

**Pros:** Extremely easy setup; fast.
**Cons:** Trial credits expire; eventually paid (approx $5/mo for basic usage).

---

## Option 3: Local Docker + Tunneling (Best for Free Testing)
If you just need to show the project to someone or test it online without paying, host it on your own machine and expose it via a secure tunnel.

### Steps:
1.  **Run Locally with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    This spins up the entire stack (Frontend, Gateway, APIs, Database) on your machine.

2.  **Expose Frontend with Cloudflare Tunnel (Free & Fast):**
    *   Install `cloudflared` (or use `ngrok`).
    *   Run:
        ```bash
        cloudflared tunnel --url http://localhost:5174
        ```
    *   It will give you a public URL (e.g., `https://random-name.trycloudflare.com`).
    *   Share this URL. Anyone can access your locally running app.

**Pros:** Completely free; exact production environment; no "sleeping" services.
**Cons:** Your computer must stay on; relies on your internet upload speed.
