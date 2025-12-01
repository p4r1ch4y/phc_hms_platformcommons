FROM node:20-alpine AS builder

WORKDIR /app

# Accept a Vite API URL at build time (defaults to localhost:8000)
ARG VITE_API_URL="http://localhost:8000/"
ENV VITE_API_URL=${VITE_API_URL}

# Copy root files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages (frontend might depend on common)
COPY packages/common ./packages/common
COPY packages/database ./packages/database

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN npm install

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# Production image
FROM nginx:alpine

# Copy build artifacts
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
