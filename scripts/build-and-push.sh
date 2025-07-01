#!/bin/bash

# Build and Push Docker Image Script
set -e

# Configuration
REGISTRY="your-registry.azurecr.io"
IMAGE_NAME="eliteshop"
VERSION=${1:-latest}
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${VERSION}"

echo "🚀 Building and pushing EliteShop Docker image..."
echo "Registry: ${REGISTRY}"
echo "Image: ${IMAGE_NAME}"
echo "Version: ${VERSION}"
echo "Full image name: ${FULL_IMAGE_NAME}"

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t ${FULL_IMAGE_NAME} .

# Tag with latest if not already latest
if [ "${VERSION}" != "latest" ]; then
    docker tag ${FULL_IMAGE_NAME} ${REGISTRY}/${IMAGE_NAME}:latest
fi

# Push to registry
echo "📤 Pushing to registry..."
docker push ${FULL_IMAGE_NAME}

if [ "${VERSION}" != "latest" ]; then
    docker push ${REGISTRY}/${IMAGE_NAME}:latest
fi

echo "✅ Successfully built and pushed ${FULL_IMAGE_NAME}"

# Update Kubernetes deployment
echo "🔄 Updating Kubernetes deployment..."
kubectl set image deployment/eliteshop-deployment eliteshop=${FULL_IMAGE_NAME} -n eliteshop

echo "🎉 Deployment complete!"