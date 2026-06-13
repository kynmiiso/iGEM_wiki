#!/usr/bin/env bash
# Deploy Payload CMS to Azure Container Apps with persistent Azure Files storage.
# Prerequisites: az login, Docker, env.local sourced from env.example
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f infra/azure/env.local ]]; then
  echo "Create infra/azure/env.local from infra/azure/env.example first."
  exit 1
fi

# shellcheck disable=SC1091
source infra/azure/env.local

: "${AZURE_RESOURCE_GROUP:?}"
: "${AZURE_LOCATION:?}"
: "${AZURE_CONTAINERAPP_ENV:?}"
: "${AZURE_CONTAINERAPP_NAME:?}"
: "${AZURE_ACR_NAME:?}"
: "${AZURE_STORAGE_ACCOUNT:?}"
: "${AZURE_FILE_SHARE:?}"
: "${PAYLOAD_SECRET:?}"

echo "==> Ensuring resource group"
az group create --name "$AZURE_RESOURCE_GROUP" --location "$AZURE_LOCATION" >/dev/null

echo "==> Ensuring Azure Container Registry"
az acr create --resource-group "$AZURE_RESOURCE_GROUP" --name "$AZURE_ACR_NAME" --sku Basic --admin-enabled true >/dev/null 2>&1 || true
ACR_LOGIN_SERVER="$(az acr show --name "$AZURE_ACR_NAME" --query loginServer -o tsv)"
ACR_PASSWORD="$(az acr credential show --name "$AZURE_ACR_NAME" --query passwords[0].value -o tsv)"

echo "==> Building and pushing Payload image"
az acr login --name "$AZURE_ACR_NAME"
docker build -t "$ACR_LOGIN_SERVER/payload-cms:latest" cms/payload-app
docker push "$ACR_LOGIN_SERVER/payload-cms:latest"

echo "==> Ensuring storage account + file share for SQLite/media"
az storage account create \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --name "$AZURE_STORAGE_ACCOUNT" \
  --location "$AZURE_LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 >/dev/null 2>&1 || true

STORAGE_KEY="$(az storage account keys list --resource-group "$AZURE_RESOURCE_GROUP" --account-name "$AZURE_STORAGE_ACCOUNT" --query '[0].value' -o tsv)"
az storage share create --name "$AZURE_FILE_SHARE" --account-name "$AZURE_STORAGE_ACCOUNT" --account-key "$STORAGE_KEY" >/dev/null 2>&1 || true

echo "==> Ensuring Container Apps environment"
az extension add --name containerapp --upgrade >/dev/null 2>&1 || true
az provider register --namespace Microsoft.App >/dev/null 2>&1 || true
az provider register --namespace Microsoft.OperationalInsights >/dev/null 2>&1 || true
az containerapp env create \
  --name "$AZURE_CONTAINERAPP_ENV" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --location "$AZURE_LOCATION" >/dev/null 2>&1 || true

STORAGE_MOUNT="payload-storage"
ENV_VARS=(
  "PAYLOAD_SECRET=$PAYLOAD_SECRET"
  "DATABASE_URL=file:/data/cms-payload-app.db"
  "PAYLOAD_MEDIA_DIR=/data/media"
  "PAYLOAD_HOSTED_DEMO=1"
  "NODE_ENV=production"
)

if [[ -n "${PAYLOAD_DEMO_URL:-}" ]]; then
  ENV_VARS+=("PAYLOAD_PUBLIC_SERVER_URL=$PAYLOAD_DEMO_URL")
fi

if [[ -n "${PAYLOAD_REBUILD_WEBHOOK_URL:-}" ]]; then
  ENV_VARS+=("PAYLOAD_REBUILD_WEBHOOK_URL=$PAYLOAD_REBUILD_WEBHOOK_URL")
fi
if [[ -n "${PAYLOAD_REBUILD_WEBHOOK_SECRET:-}" ]]; then
  ENV_VARS+=("PAYLOAD_REBUILD_WEBHOOK_SECRET=$PAYLOAD_REBUILD_WEBHOOK_SECRET")
fi
if [[ -n "${WIKI_DEMO_URL:-}" ]]; then
  ENV_VARS+=("WIKI_DEMO_URL=$WIKI_DEMO_URL")
fi

ENV_CSV="$(IFS=,; echo "${ENV_VARS[*]}")"

echo "==> Deploying Container App"
if az containerapp show --name "$AZURE_CONTAINERAPP_NAME" --resource-group "$AZURE_RESOURCE_GROUP" >/dev/null 2>&1; then
  az containerapp update \
    --name "$AZURE_CONTAINERAPP_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --image "$ACR_LOGIN_SERVER/payload-cms:latest" \
    --set-env-vars "$ENV_CSV" >/dev/null
else
  az containerapp create \
    --name "$AZURE_CONTAINERAPP_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --environment "$AZURE_CONTAINERAPP_ENV" \
    --image "$ACR_LOGIN_SERVER/payload-cms:latest" \
    --registry-server "$ACR_LOGIN_SERVER" \
    --registry-username "$AZURE_ACR_NAME" \
    --registry-password "$ACR_PASSWORD" \
    --target-port 3000 \
    --ingress external \
    --min-replicas 0 \
    --max-replicas 1 \
    --cpu 0.5 \
    --memory 1.0Gi \
    --env-vars "$ENV_CSV" \
    --azure-file-account-name "$AZURE_STORAGE_ACCOUNT" \
    --azure-file-account-key "$STORAGE_KEY" \
    --azure-file-share-name "$AZURE_FILE_SHARE" \
    --azure-file-mount-path /data \
    --volume-name "$STORAGE_MOUNT" >/dev/null
fi

FQDN="$(az containerapp show --name "$AZURE_CONTAINERAPP_NAME" --resource-group "$AZURE_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"
PUBLIC_URL="https://${FQDN}"

az containerapp update \
  --name "$AZURE_CONTAINERAPP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --set-env-vars "PAYLOAD_PUBLIC_SERVER_URL=$PUBLIC_URL" >/dev/null

echo
echo "Payload CMS deployed."
echo "Admin URL: ${PUBLIC_URL}/admin"
echo "Set GitHub secret PAYLOAD_DEMO_URL=${PUBLIC_URL}"
