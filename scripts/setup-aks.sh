#!/bin/bash

# AKS Setup Script
set -e

# Configuration - Update these values
RESOURCE_GROUP="eliteshop-rg"
CLUSTER_NAME="eliteshop-aks"
LOCATION="eastus"
NODE_COUNT=3
NODE_SIZE="Standard_B2s"
ACR_NAME="eliteshopacr"

echo "🚀 Setting up Azure Kubernetes Service (AKS)..."

# Create resource group
echo "📦 Creating resource group..."
az group create --name ${RESOURCE_GROUP} --location ${LOCATION}

# Create Azure Container Registry
echo "🏗️ Creating Azure Container Registry..."
az acr create --resource-group ${RESOURCE_GROUP} --name ${ACR_NAME} --sku Basic

# Create AKS cluster
echo "☸️ Creating AKS cluster..."
az aks create \
    --resource-group ${RESOURCE_GROUP} \
    --name ${CLUSTER_NAME} \
    --node-count ${NODE_COUNT} \
    --node-vm-size ${NODE_SIZE} \
    --enable-addons monitoring \
    --attach-acr ${ACR_NAME} \
    --generate-ssh-keys \
    --enable-cluster-autoscaler \
    --min-count 1 \
    --max-count 5 \
    --network-plugin azure \
    --enable-managed-identity

# Get AKS credentials
echo "🔑 Getting AKS credentials..."
az aks get-credentials --resource-group ${RESOURCE_GROUP} --name ${CLUSTER_NAME}

# Install NGINX Ingress Controller
echo "🌐 Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager for SSL certificates
echo "🔒 Installing cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=300s

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

echo "✅ AKS setup complete!"
echo "📋 Next steps:"
echo "1. Update the image registry in k8s/deployment.yaml"
echo "2. Update the domain in k8s/ingress.yaml"
echo "3. Update the email in the ClusterIssuer above"
echo "4. Run: chmod +x scripts/*.sh"
echo "5. Run: ./scripts/build-and-push.sh"
echo "6. Run: ./scripts/deploy.sh"