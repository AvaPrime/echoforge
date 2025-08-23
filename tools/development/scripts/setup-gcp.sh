#!/bin/bash

# EchoCloud GCP Setup Script
# This script sets up the necessary GCP resources for EchoCloud deployment

set -e

PROJECT_ID=${1:-"codessa-core"}
REGION=${2:-"us-central1"}
SERVICE_ACCOUNT_NAME="echo-cloud-sa"
SECRET_NAME="sa-key"

echo "🚀 Setting up GCP resources for EchoCloud..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📡 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com

# Create service account for Cloud Run
echo "🔐 Creating service account..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name="EchoCloud Service Account" \
  --description="Service account for EchoCloud application" || true

# Add necessary roles to service account
echo "🛡️ Adding IAM roles..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/monitoring.metricWriter"

# Create secret for service account key (if not exists)
echo "🔑 Creating secret in Secret Manager..."
if ! gcloud secrets describe $SECRET_NAME --quiet 2>/dev/null; then
  echo "Creating secret placeholder..."
  echo '{"type": "service_account", "project_id": "'$PROJECT_ID'"}' | \
  gcloud secrets create $SECRET_NAME \
    --data-file=- \
    --replication-policy="automatic"
fi

# Grant secret access to the service account
gcloud secrets add-iam-policy-binding $SECRET_NAME \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create Cloud Build trigger (optional)
echo "🔨 Setting up Cloud Build..."
# This would typically be done via the console or with additional configuration

echo "✅ GCP setup complete!"
echo ""
echo "Next steps:"
echo "1. Upload your actual service account key to Secret Manager:"
echo "   gcloud secrets versions add $SECRET_NAME --data-file=path/to/your/key.json"
echo ""
echo "2. Deploy EchoCloud:"
echo "   cd apps/echo-cloud"
echo "   pnpm run deploy"
echo ""
echo "3. Test the deployment:"
echo "   curl https://echo-cloud-PROJECT_ID.a.run.app/health"
