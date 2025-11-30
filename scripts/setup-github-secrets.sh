#!/usr/bin/env bash
# Script to set GitHub repository secrets for this project using `gh` CLI.
# Usage: copy the commands below or run interactively after exporting the values.

set -euo pipefail

REPO="p4r1ch4y/phc_hms_platformcommons"

check_gh() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh CLI not found. Install from https://cli.github.com/ and authenticate (gh auth login)."
    exit 1
  fi
}

usage() {
  cat <<EOF
Usage: export values and run this script, or run interactively.

Example (one-off):
  gh secret set DATABASE_URL -b"
  gh secret set JWT_SECRET -b"<value>"

This script lists the required secrets and provides commands to set them.
It does NOT embed any secret values by default.
EOF
}

check_gh

echo "This script will show the gh commands to set the repository secrets for ${REPO}."
echo "If you want to run them automatically, export the values as environment variables and re-run."
echo

REQUIRED=(
  DATABASE_URL
  JWT_SECRET
  SUPABASE_SERVICE_ROLE_KEY
  VERCEL_TOKEN
  VERCEL_ORG_ID
  VERCEL_PROJECT_ID
  AZURE_APP_API_GATEWAY_PUBLISH_PROFILE
  AZURE_APP_AUTH_SERVICE_PUBLISH_PROFILE
  AZURE_APP_TENANT_SERVICE_PUBLISH_PROFILE
  AZURE_APP_PATIENT_SERVICE_PUBLISH_PROFILE
  AZURE_APP_CONSULTATION_SERVICE_PUBLISH_PROFILE
  AZURE_APP_PHARMACY_SERVICE_PUBLISH_PROFILE
)

for name in "${REQUIRED[@]}"; do
  if [ -n "${!name-}" ]; then
    echo "Setting secret $name from environment variable..."
    gh secret set "$name" -b"${!name}" -R "$REPO"
  else
    echo "# To set: gh secret set $name -b'REPLACE_WITH_VALUE' -R $REPO"
  fi
done

echo
echo "Done. Replace placeholders above with real values and run the commands to set secrets."
