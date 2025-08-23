#!/bin/bash

# Script to enable required Google Cloud APIs for the codessa-core project
# This script includes idempotent checks to skip already-enabled APIs

set -e

PROJECT_ID="codessa-core"
APIS=(
  "cloudbuild.googleapis.com"
  "run.googleapis.com"
  "secretmanager.googleapis.com"
  "aiplatform.googleapis.com"
)

echo "Checking and enabling Google Cloud APIs for project: $PROJECT_ID"

# Get list of currently enabled APIs
echo "Fetching currently enabled APIs..."
ENABLED_APIS=$(gcloud services list --enabled --project="$PROJECT_ID" --format="value(name)" 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "Error: Failed to fetch enabled APIs. Please check your gcloud configuration and project access."
  exit 1
fi

# Check and enable each API
for api in "${APIS[@]}"; do
  echo "Checking API: $api"
  
  if echo "$ENABLED_APIS" | grep -q "^$api$"; then
    echo "  ✓ $api is already enabled"
  else
    echo "  → Enabling $api..."
    if gcloud services enable "$api" --project="$PROJECT_ID"; then
      echo "  ✓ Successfully enabled $api"
    else
      echo "  ✗ Failed to enable $api"
      exit 1
    fi
  fi
done

echo ""
echo "All required APIs have been checked and enabled successfully!"
