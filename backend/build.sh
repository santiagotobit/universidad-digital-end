#!/bin/bash

# =========================
# CONFIGURACIÓN
# =========================
PROJECT_ID="despliegue-dev-senior"
REGION="us-central1"
REPO="universidad-repo"
IMAGE_NAME="cloud-run-plataforma-universidad"
TAG="v1"

# =========================
# VALIDACIONES
# =========================
echo "Verificando proyecto activo..."
gcloud config set project $PROJECT_ID

if [ $? -ne 0 ]; then
  echo "❌ Error configurando el proyecto"
  exit 1
fi

# =========================
# AUTENTICACIÓN DOCKER
# =========================
echo "Autenticando Docker con Artifact Registry..."
gcloud auth configure-docker $REGION-docker.pkg.dev -q

# =========================
# BUILD Y PUSH
# =========================
IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$IMAGE_NAME:$TAG"

echo "Construyendo imagen: $IMAGE_URI"

gcloud builds submit --tag $IMAGE_URI

if [ $? -ne 0 ]; then
  echo "❌ Error en el build"
  exit 1
fi

echo "✅ Imagen construida y subida correctamente"

# =========================
# OPCIONAL: DEPLOY A CLOUD RUN
# =========================
SERVICE_NAME="cloud-run-plataforma-universidad"

APP_ENV=${APP_ENV:-production}

if [ -z "$APP_DATABASE_URL" ] || [ -z "$APP_JWT_SECRET" ] || [ -z "$APP_CORS_ORIGINS" ]; then
  echo "❌ Faltan variables de entorno obligatorias para Cloud Run."
  echo "Define APP_DATABASE_URL, APP_JWT_SECRET y APP_CORS_ORIGINS antes de ejecutar este script."
  exit 1
fi

APP_COOKIE_SECURE=${APP_COOKIE_SECURE:-true}
APP_COOKIE_SAMESITE=${APP_COOKIE_SAMESITE:-none}

echo "Desplegando en Cloud Run..."

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URI \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "APP_ENV=$APP_ENV,APP_DATABASE_URL=$APP_DATABASE_URL,APP_JWT_SECRET=$APP_JWT_SECRET,APP_CORS_ORIGINS=$APP_CORS_ORIGINS,APP_COOKIE_SECURE=$APP_COOKIE_SECURE,APP_COOKIE_SAMESITE=$APP_COOKIE_SAMESITE"

if [ $? -ne 0 ]; then
  echo "❌ Error en el deploy"
  exit 1
fi

echo "🚀 Deploy completado en Cloud Run"