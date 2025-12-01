#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/app}
RETRIES=${RETRIES:-30}
SLEEP=${SLEEP:-2}

echo "[start-and-migrate] Starting in app dir: $APP_DIR"

if [ -d "/app/packages/database" ]; then
  echo "[start-and-migrate] Running Prisma generate in /app/packages/database"
  cd /app/packages/database
  # Install prisma binary if not present (npm install was run during image build)
  npx prisma generate || true

  echo "[start-and-migrate] Attempting to deploy migrations (if any)"
  # Try migrate deploy; if no migrations are present this may be a no-op
  npx prisma migrate deploy || true
fi

echo "[start-and-migrate] Starting application directory: $APP_DIR"
cd "$APP_DIR"


echo "[start-and-migrate] Running management migrations with retries (using npx in package directory)"
i=0
until (cd /app/packages/database && npx prisma migrate dev --schema=./prisma/schema.prisma --name init_management); do
  i=$((i+1))
  echo "migrate:management failed (attempt $i/$RETRIES). Retrying in ${SLEEP}s..."
  if [ "$i" -ge "$RETRIES" ]; then
    echo "migrate:management failed after $RETRIES attempts. Continuing..."
    break
  fi
  sleep $SLEEP
done

echo "[start-and-migrate] Pushing tenant schema with retries (using npx in package directory)"
i=0
if [ "${ALLOW_TENANT_PUSH:-false}" = "true" ]; then
  until (cd /app/packages/database && npx prisma db push --schema=./prisma/tenant.prisma --accept-data-loss); do
  i=$((i+1))
  echo "push:tenant failed (attempt $i/$RETRIES). Retrying in ${SLEEP}s..."
  if [ "$i" -ge "$RETRIES" ]; then
    echo "push:tenant failed after $RETRIES attempts. Continuing..."
    break
  fi
  sleep $SLEEP
done
else
  echo "[start-and-migrate] Skipping tenant schema push (ALLOW_TENANT_PUSH not set)."
fi

# Ensure local workspace packages are built in the final image (some installs use symlinks)
if [ ! -f "/app/node_modules/@phc/common/dist/index.js" ] && [ -d "/app/packages/common" ]; then
  echo "[start-and-migrate] Detected missing @phc/common build in node_modules — building from source in /app/packages/common"
  cd /app/packages/common
  if [ -f package.json ]; then
    npm run build || npx tsc -p tsconfig.json || true
  fi
  cd "$APP_DIR"
fi

# Ensure Node can resolve the workspace package by creating a node_modules symlink
if [ ! -e "/app/node_modules/@phc/common" ] && [ -d "/app/packages/common" ]; then
  echo "[start-and-migrate] Creating symlink /app/node_modules/@phc/common -> /app/packages/common"
  mkdir -p /app/node_modules/@phc || true
  ln -sfn /app/packages/common /app/node_modules/@phc/common || true
fi

echo "[start-and-migrate] Migrations/push completed (or retried). Starting service..."
exec node dist/index.js
