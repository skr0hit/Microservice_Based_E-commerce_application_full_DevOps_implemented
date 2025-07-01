#!/bin/bash

# Kubernetes Deployment Script
set -e

NAMESPACE="eliteshop"
KUBECTL_CONTEXT=${1:-"your-aks-context"}

echo "🚀 Deploying EliteShop to Kubernetes..."
echo "Context: ${KUBECTL_CONTEXT}"
echo "Namespace: ${NAMESPACE}"

# Set kubectl context
kubectl config use-context ${KUBECTL_CONTEXT}

# Apply Kubernetes manifests in order
echo "📝 Applying Kubernetes manifests..."

echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

echo "Creating ConfigMap..."
kubectl apply -f k8s/configmap.yaml

echo "Creating Secrets..."
kubectl apply -f k8s/secret.yaml

echo "Creating Deployment..."
kubectl apply -f k8s/deployment.yaml

echo "Creating Service..."
kubectl apply -f k8s/service.yaml

echo "Creating Ingress..."
kubectl apply -f k8s/ingress.yaml

echo "Creating HPA..."
kubectl apply -f k8s/hpa.yaml

echo "Creating Network Policy..."
kubectl apply -f k8s/networkpolicy.yaml

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/eliteshop-deployment -n ${NAMESPACE} --timeout=300s

# Show deployment status
echo "📊 Deployment Status:"
kubectl get pods -n ${NAMESPACE} -l app=eliteshop
kubectl get svc -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE}

echo "✅ EliteShop deployed successfully!"
echo "🌐 Access your application at: https://eliteshop.yourdomain.com"