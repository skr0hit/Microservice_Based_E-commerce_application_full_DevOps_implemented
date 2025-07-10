# EliteShop - Docker & AKS Deployment Guide .

This guide provides step-by-step instructions for containerizing and deploying the EliteShop application to Azure Kubernetes Service (AKS) following industry best practices.

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite
- **Web Server**: Nginx (Alpine Linux)
- **Container**: Multi-stage Docker build
- **Orchestration**: Kubernetes on Azure AKS
- **Registry**: Azure Container Registry (ACR)
- **SSL**: Let's Encrypt via cert-manager
- **Ingress**: NGINX Ingress Controller

## 📋 Prerequisites

### Required Tools
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### Azure Account Setup
```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-id"
```

## 🚀 Step-by-Step Deployment

### Step 1: Prepare the Application

1. **Make scripts executable:**
```bash
chmod +x scripts/*.sh
```

2. **Test local build:**
```bash
npm run build
```

### Step 2: Set Up Azure Infrastructure

1. **Update configuration in `scripts/setup-aks.sh`:**
```bash
# Edit these values
RESOURCE_GROUP="eliteshop-rg"
CLUSTER_NAME="eliteshop-aks"
LOCATION="eastus"  # Choose your preferred region
ACR_NAME="eliteshopacr"  # Must be globally unique
```

2. **Run the AKS setup script:**
```bash
./scripts/setup-aks.sh
```

This script will:
- Create Azure Resource Group
- Create Azure Container Registry (ACR)
- Create AKS cluster with auto-scaling
- Install NGINX Ingress Controller
- Install cert-manager for SSL certificates
- Configure Let's Encrypt ClusterIssuer

### Step 3: Configure Application Settings

1. **Update Docker registry in `k8s/deployment.yaml`:**
```yaml
# Replace 'your-registry' with your ACR name
image: eliteshopacr.azurecr.io/eliteshop:latest
```

2. **Update domain in `k8s/ingress.yaml`:**
```yaml
# Replace with your actual domain
- host: eliteshop.yourdomain.com
```

3. **Update email in ClusterIssuer (if not done in setup):**
```bash
kubectl patch clusterissuer letsencrypt-prod --type='merge' -p='{"spec":{"acme":{"email":"your-email@example.com"}}}'
```

### Step 4: Build and Push Docker Image

1. **Login to Azure Container Registry:**
```bash
az acr login --name eliteshopacr
```

2. **Build and push the image:**
```bash
./scripts/build-and-push.sh v1.0.0
```

### Step 5: Deploy to Kubernetes

1. **Deploy the application:**
```bash
./scripts/deploy.sh
```

2. **Verify deployment:**
```bash
# Check pods
kubectl get pods -n eliteshop

# Check services
kubectl get svc -n eliteshop

# Check ingress
kubectl get ingress -n eliteshop

# Check HPA
kubectl get hpa -n eliteshop
```

### Step 6: Configure DNS

1. **Get the external IP of the ingress controller:**
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

2. **Create DNS A record:**
   - Point `eliteshop.yourdomain.com` to the external IP
   - Wait for DNS propagation (can take up to 48 hours)

## 🔧 Configuration Management

### Environment Variables

**ConfigMap** (`k8s/configmap.yaml`):
```yaml
data:
  NODE_ENV: "production"
  PORT: "8080"
  # Add non-sensitive config here
```

**Secrets** (`k8s/secret.yaml`):
```yaml
stringData:
  # Add sensitive data here
  DATABASE_URL: "your-database-connection"
  API_KEY: "your-api-key"
```

### Resource Management

**CPU & Memory Limits:**
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

**Auto-scaling:**
- Min replicas: 3
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

## 🛡️ Security Best Practices

### Container Security
- ✅ Non-root user (UID 1001)
- ✅ Read-only root filesystem
- ✅ No privilege escalation
- ✅ Dropped all capabilities
- ✅ Security context constraints

### Network Security
- ✅ Network policies for pod-to-pod communication
- ✅ Ingress-only traffic allowed
- ✅ SSL/TLS termination
- ✅ Rate limiting

### Image Security
- ✅ Multi-stage build (smaller attack surface)
- ✅ Alpine Linux base (minimal OS)
- ✅ No secrets in image layers
- ✅ Regular security updates

## 📊 Monitoring & Observability

### Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Monitoring Commands
```bash
# View logs
kubectl logs -f deployment/eliteshop-deployment -n eliteshop

# Monitor resource usage
kubectl top pods -n eliteshop

# Check HPA status
kubectl describe hpa eliteshop-hpa -n eliteshop

# View events
kubectl get events -n eliteshop --sort-by='.lastTimestamp'
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to AKS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Build and Push
      run: |
        az acr login --name eliteshopacr
        ./scripts/build-and-push.sh ${{ github.sha }}
    
    - name: Deploy to AKS
      run: |
        az aks get-credentials --resource-group eliteshop-rg --name eliteshop-aks
        ./scripts/deploy.sh
```

## 🚨 Troubleshooting

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n eliteshop
kubectl logs <pod-name> -n eliteshop
```

**Ingress not working:**
```bash
kubectl describe ingress eliteshop-ingress -n eliteshop
kubectl get svc -n ingress-nginx
```

**SSL certificate issues:**
```bash
kubectl describe certificate eliteshop-tls -n eliteshop
kubectl describe certificaterequest -n eliteshop
```

**Image pull errors:**
```bash
# Check if ACR is attached to AKS
az aks check-acr --resource-group eliteshop-rg --name eliteshop-aks --acr eliteshopacr
```

### Useful Commands

```bash
# Scale deployment manually
kubectl scale deployment eliteshop-deployment --replicas=5 -n eliteshop

# Rolling restart
kubectl rollout restart deployment/eliteshop-deployment -n eliteshop

# Check resource usage
kubectl top nodes
kubectl top pods -n eliteshop

# Port forward for local testing
kubectl port-forward svc/eliteshop-service 8080:80 -n eliteshop
```

## 🎯 Production Checklist

- [ ] Domain configured and DNS propagated
- [ ] SSL certificate issued and valid
- [ ] Resource limits properly set
- [ ] Auto-scaling configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

## 📚 Additional Resources

- [Azure AKS Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)

---

🎉 **Congratulations!** Your EliteShop application is now running on Azure Kubernetes Service with enterprise-grade security, scalability, and reliability!
