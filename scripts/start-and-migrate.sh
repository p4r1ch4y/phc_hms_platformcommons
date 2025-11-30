#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/app}

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

echo "[start-and-migrate] Starting application at: $APP_DIR"
cd "$APP_DIR"

exec node dist/index.js
#!/bin/sh
set -e

RETRIES=30
SLEEP=2

echo "Starting DB migration helper"

i=0
until npm run -w packages/database migrate:management; do
  i=$((i+1))
  echo "migrate:management failed (attempt $i/$RETRIES). Retrying in ${SLEEP}s..."
  if [ "$i" -ge "$RETRIES" ]; then
    echo "migrate:management failed after $RETRIES attempts. Continuing..."
    break
  fi
  sleep $SLEEP
done

# Push tenant schema

i=0
until npm run -w packages/database push:tenant; do
  i=$((i+1))
  echo "push:tenant failed (attempt $i/$RETRIES). Retrying in ${SLEEP}s..."
  if [ "$i" -ge "$RETRIES" ]; then
    echo "push:tenant failed after $RETRIES attempts. Continuing..."
    break
  fi
  sleep $SLEEP
done

# Start the service
echo "Migrations/push completed (or retried). Starting service..."
exec node dist/index.js
