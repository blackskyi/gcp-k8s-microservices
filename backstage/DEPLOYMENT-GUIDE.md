# Backstage Deployment Guide

Complete guide for deploying Backstage Supply Chain Security Portal.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Integration Setup](#integration-setup)
5. [Verification](#verification)
6. [Maintenance](#maintenance)

## Prerequisites

### Required

- Node.js 18 or 20
- Docker (for containerized deployment)
- GitHub account with Personal Access Token
- Access to the GKE cluster (for Kubernetes integration)

### Optional

- kubectl configured for GKE cluster
- ArgoCD installation
- Prometheus installation

## Local Development Setup

### Step 1: Environment Configuration

1. Navigate to backstage directory:
   ```bash
   cd backstage
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your credentials:
   ```bash
   # Required
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Optional - for full integration
   K8S_CLUSTER_URL=https://your-gke-endpoint
   K8S_SERVICE_ACCOUNT_TOKEN=eyJhbGc...
   K8S_CA_DATA=LS0tLS1...
   ARGOCD_SERVER_URL=https://argocd.yourdomain.com
   ARGOCD_USERNAME=admin
   ARGOCD_PASSWORD=your-password
   PROMETHEUS_URL=http://prometheus-server.monitoring.svc.cluster.local
   ```

### Step 2: Start with Docker Compose

1. Build and start:
   ```bash
   docker-compose up --build
   ```

2. Wait for startup (approximately 2-3 minutes)

3. Access at http://localhost:3000

### Step 3: Verify Catalog

1. Navigate to **Catalog** in the UI
2. You should see:
   - System: `microservices-platform`
   - Components: `frontend`, `backend`, `supply-chain-security`
   - Resources: `postgresql`, `redis`
   - APIs: `frontend-api`, `backend-api`

## Production Deployment

### Option 1: Docker Deployment

#### Build Production Image

```bash
docker build -t backstage:v1.0.0 .
docker tag backstage:v1.0.0 us-central1-docker.pkg.dev/YOUR_PROJECT/microservices/backstage:v1.0.0
docker push us-central1-docker.pkg.dev/YOUR_PROJECT/microservices/backstage:v1.0.0
```

#### Run with Production Database

```bash
docker run -d \
  --name backstage \
  -p 7007:7007 \
  -e NODE_ENV=production \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  -e POSTGRES_HOST=your-postgres-host \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=backstage \
  -e POSTGRES_PASSWORD=secure-password \
  -e POSTGRES_DB=backstage \
  backstage:v1.0.0
```

### Option 2: Kubernetes Deployment

#### Create Namespace

```bash
kubectl create namespace backstage
```

#### Create PostgreSQL Database

```yaml
# postgres.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: backstage
type: Opaque
stringData:
  POSTGRES_USER: backstage
  POSTGRES_PASSWORD: change-me-in-production
  POSTGRES_DB: backstage
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: backstage
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        envFrom:
        - secretRef:
            name: postgres-secret
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: backstage
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
```

Apply:
```bash
kubectl apply -f postgres.yaml
```

#### Create Backstage Secrets

```bash
kubectl create secret generic backstage-secrets \
  --namespace=backstage \
  --from-literal=GITHUB_TOKEN=$GITHUB_TOKEN \
  --from-literal=POSTGRES_USER=backstage \
  --from-literal=POSTGRES_PASSWORD=change-me \
  --from-literal=K8S_SERVICE_ACCOUNT_TOKEN=$K8S_TOKEN \
  --from-literal=ARGOCD_PASSWORD=$ARGOCD_PASSWORD
```

#### Deploy Backstage

```yaml
# backstage-deployment.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: backstage
  namespace: backstage
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: backstage-cluster-reader
subjects:
- kind: ServiceAccount
  name: backstage
  namespace: backstage
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backstage
  namespace: backstage
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backstage
  template:
    metadata:
      labels:
        app: backstage
    spec:
      serviceAccountName: backstage
      containers:
      - name: backstage
        image: us-central1-docker.pkg.dev/YOUR_PROJECT/microservices/backstage:v1.0.0
        ports:
        - name: http
          containerPort: 7007
        env:
        - name: NODE_ENV
          value: production
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: backstage-secrets
              key: GITHUB_TOKEN
        - name: POSTGRES_HOST
          value: postgres.backstage.svc.cluster.local
        - name: POSTGRES_PORT
          value: "5432"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: backstage-secrets
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: backstage-secrets
              key: POSTGRES_PASSWORD
        - name: K8S_SERVICE_ACCOUNT_TOKEN
          valueFrom:
            secretKeyRef:
              name: backstage-secrets
              key: K8S_SERVICE_ACCOUNT_TOKEN
        - name: ARGOCD_SERVER_URL
          value: "https://argocd.yourdomain.com"
        - name: ARGOCD_USERNAME
          value: "admin"
        - name: ARGOCD_PASSWORD
          valueFrom:
            secretKeyRef:
              name: backstage-secrets
              key: ARGOCD_PASSWORD
        livenessProbe:
          httpGet:
            path: /healthcheck
            port: 7007
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthcheck
            port: 7007
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: backstage
  namespace: backstage
spec:
  selector:
    app: backstage
  ports:
  - name: http
    port: 80
    targetPort: 7007
  type: LoadBalancer
```

Apply:
```bash
kubectl apply -f backstage-deployment.yaml
```

#### Get External IP

```bash
kubectl get svc backstage -n backstage
```

Access Backstage at the EXTERNAL-IP.

## Integration Setup

### GitHub Integration

1. **Create Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes:
     - `repo` (Full control of private repositories)
     - `read:org` (Read org and team membership)
   - Copy the token

2. **Set in environment**:
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   ```

### Kubernetes Integration

1. **Create Service Account**:
   ```bash
   kubectl create serviceaccount backstage-k8s -n default
   ```

2. **Create ClusterRoleBinding**:
   ```bash
   kubectl create clusterrolebinding backstage-k8s-admin \
     --clusterrole=cluster-admin \
     --serviceaccount=default:backstage-k8s
   ```

3. **Get Token**:
   ```bash
   kubectl create token backstage-k8s -n default --duration=87600h
   ```

4. **Get Cluster Details**:
   ```bash
   # Cluster URL
   kubectl config view --minify --output 'jsonpath={.clusters[0].cluster.server}'

   # CA Data
   kubectl config view --minify --raw --output 'jsonpath={.clusters[0].cluster.certificate-authority-data}'
   ```

5. **Set Environment Variables**:
   ```bash
   K8S_CLUSTER_URL=https://your-cluster-endpoint
   K8S_SERVICE_ACCOUNT_TOKEN=your-token-from-step-3
   K8S_CA_DATA=your-ca-data-from-step-4
   ```

### ArgoCD Integration

1. **Get Admin Password**:
   ```bash
   kubectl -n argocd get secret argocd-initial-admin-secret \
     -o jsonpath="{.data.password}" | base64 -d
   ```

2. **Get ArgoCD URL**:
   ```bash
   kubectl get svc argocd-server -n argocd
   ```

3. **Set Environment Variables**:
   ```bash
   ARGOCD_SERVER_URL=https://your-argocd-url
   ARGOCD_USERNAME=admin
   ARGOCD_PASSWORD=password-from-step-1
   ```

### Prometheus Integration

1. **Get Prometheus URL**:
   ```bash
   kubectl get svc -n monitoring | grep prometheus-server
   ```

2. **Set Environment Variable**:
   ```bash
   # Internal cluster URL
   PROMETHEUS_URL=http://prometheus-server.monitoring.svc.cluster.local

   # Or external URL if available
   PROMETHEUS_URL=https://prometheus.yourdomain.com
   ```

## Verification

### Check Catalog Entities

1. Open Backstage UI
2. Navigate to **Catalog**
3. Verify all entities are loaded:
   - ✅ microservices-platform (System)
   - ✅ frontend (Component)
   - ✅ backend (Component)
   - ✅ supply-chain-security (Component)
   - ✅ postgresql (Resource)
   - ✅ redis (Resource)

### Check Supply Chain Security Features

1. Click on **frontend** component
2. Navigate to **Supply Chain Security** tab
3. Verify cards display:
   - ✅ Image Attestation & SLSA Provenance
   - ✅ Trivy Vulnerability Scan
   - ✅ Kyverno Policy Report

### Check Kubernetes Integration

1. Click on **frontend** component
2. Navigate to **Kubernetes** tab
3. Verify you see:
   - ✅ Pods running
   - ✅ Deployment status
   - ✅ Service information

### Check ArgoCD Integration

1. Click on **frontend** component
2. Navigate to **ArgoCD** tab
3. Verify:
   - ✅ Application status
   - ✅ Sync status
   - ✅ Health status

## Maintenance

### Update Backstage

1. Pull latest changes:
   ```bash
   cd backstage
   git pull origin main
   ```

2. Rebuild:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Update Plugins

```bash
cd packages/app
yarn upgrade-interactive
```

### Backup Database

```bash
# For PostgreSQL
kubectl exec -n backstage postgres-0 -- \
  pg_dump -U backstage backstage > backstage-backup-$(date +%Y%m%d).sql
```

### View Logs

```bash
# Docker Compose
docker-compose logs -f backstage

# Kubernetes
kubectl logs -n backstage -l app=backstage -f
```

### Common Issues

#### "Cannot connect to PostgreSQL"

- Verify POSTGRES_HOST is correct
- Check PostgreSQL is running: `kubectl get pods -n backstage`
- Verify credentials in secrets

#### "GitHub token invalid"

- Check token hasn't expired
- Verify token has correct scopes
- Regenerate token if needed

#### "Kubernetes integration not working"

- Verify service account token is valid
- Check cluster URL is accessible
- Ensure CA data is correct

#### Plugins not loading

```bash
# Clear node modules and rebuild
rm -rf node_modules
rm -rf packages/*/node_modules
yarn install
yarn build
```

## Security Best Practices

1. **Use secrets management**:
   - Don't commit tokens to git
   - Use Kubernetes secrets in production
   - Rotate credentials regularly

2. **Enable HTTPS**:
   - Use TLS certificates
   - Configure ingress with SSL

3. **Restrict access**:
   - Enable authentication (GitHub OAuth)
   - Use RBAC for Kubernetes service account
   - Limit database access

4. **Monitor**:
   - Set up logging
   - Monitor resource usage
   - Track failed authentications

## Next Steps

1. [Configure GitHub OAuth](https://backstage.io/docs/auth/github/provider) for authentication
2. Add more catalog entities for your services
3. Customize the UI theme
4. Create custom TechDocs
5. Add more plugins from the [Backstage plugin marketplace](https://backstage.io/plugins)

## Resources

- [Backstage Official Documentation](https://backstage.io/docs)
- [Backstage Architecture](https://backstage.io/docs/overview/architecture-overview)
- [Plugin Development](https://backstage.io/docs/plugins/)
- [Kubernetes Plugin Documentation](https://backstage.io/docs/features/kubernetes/)
