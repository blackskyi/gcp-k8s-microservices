# Backstage Supply Chain Security Portal

A comprehensive developer portal for visualizing and managing supply chain security across microservices.

## Features

This Backstage instance provides visibility into:

### 🔐 Supply Chain Security
- **GitHub Attestations**: View SLSA provenance and image signatures
- **Trivy Vulnerability Scans**: Monitor security vulnerabilities by severity
- **Kyverno Policy Reports**: Track policy enforcement and compliance
- **SLSA Level Badges**: Display supply chain maturity level

### 🚀 Platform Integrations
- **Kubernetes**: View pods, deployments, and cluster status
- **ArgoCD**: Monitor GitOps deployment status and health
- **GitHub**: Track workflows, security alerts, and code scanning
- **Prometheus**: View metrics and performance data

### 📊 Service Catalog
- Frontend and backend microservices
- API documentation
- Resource dependencies (PostgreSQL, Redis)
- Security metadata and policies

## Quick Start

### Prerequisites

- Node.js 18 or 20
- Docker and Docker Compose
- GitHub Personal Access Token with `repo` and `read:org` scopes

### Local Development

1. **Clone the repository**:
   ```bash
   cd backstage
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**:
   Edit `.env` and set:
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - Optional: K8s, ArgoCD, and Prometheus connection details

4. **Start with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

5. **Access Backstage**:
   Open http://localhost:3000

## Configuration

### GitHub Integration

Create a Personal Access Token at https://github.com/settings/tokens with:
- `repo` - Full control of private repositories
- `read:org` - Read org and team membership

Set in `.env`:
```bash
GITHUB_TOKEN=ghp_your_token_here
```

### Kubernetes Integration

To connect to your GKE cluster:

1. **Create a service account**:
   ```bash
   kubectl create serviceaccount backstage -n default
   kubectl create clusterrolebinding backstage-admin \
     --clusterrole=cluster-admin \
     --serviceaccount=default:backstage
   ```

2. **Get the token**:
   ```bash
   kubectl create token backstage -n default --duration=87600h
   ```

3. **Get cluster URL and CA data**:
   ```bash
   kubectl config view --minify --output 'jsonpath={.clusters[0].cluster.server}'
   kubectl config view --minify --raw --output 'jsonpath={.clusters[0].cluster.certificate-authority-data}'
   ```

4. **Set in `.env`**:
   ```bash
   K8S_CLUSTER_URL=https://your-cluster-endpoint
   K8S_SERVICE_ACCOUNT_TOKEN=your-token
   K8S_CA_DATA=your-ca-data
   ```

### ArgoCD Integration

1. **Get ArgoCD admin password**:
   ```bash
   kubectl -n argocd get secret argocd-initial-admin-secret \
     -o jsonpath="{.data.password}" | base64 -d
   ```

2. **Set in `.env`**:
   ```bash
   ARGOCD_SERVER_URL=https://argocd.yourdomain.com
   ARGOCD_USERNAME=admin
   ARGOCD_PASSWORD=your-password
   ```

### Prometheus Integration

```bash
PROMETHEUS_URL=http://prometheus-server.monitoring.svc.cluster.local
```

## Custom Plugins

### Supply Chain Security Plugin

Located in `plugins/supply-chain-security/`, this custom plugin provides:

#### AttestationCard
Displays GitHub attestation verification status including:
- Signature verification status
- SLSA provenance details
- Issuer and subject information
- Rekor transparency log ID
- Git SHA and workflow details
- Verification command

#### TrivyScanCard
Shows vulnerability scan results:
- Severity breakdown (Critical, High, Medium, Low)
- Total vulnerability count
- Scan timestamp
- Link to GitHub Security tab
- Pass/fail status

#### KyvernoReportCard
Policy enforcement visualization:
- Summary of pass/fail/warn/skip policies
- Detailed policy results table
- Policy categories
- Rule compliance status

#### SLSABadge
Compact badge showing SLSA level (0-4) with color coding:
- Level 4: Green (Two-person reviewed)
- Level 3: Green (Hardened builds)
- Level 2: Blue (Hosted build service)
- Level 1: Orange (Provenance exists)
- Level 0: Gray (No guarantees)

## Architecture

### Catalog Entities

The platform tracks these entity types:

**System**: `microservices-platform`
- Overall platform system

**Components**:
- `frontend` - Node.js/Express frontend
- `backend` - Python/Flask backend
- `supply-chain-security` - Security infrastructure

**Resources**:
- `postgresql` - Database
- `redis` - Cache

**APIs**:
- `frontend-api` - Frontend HTTP API
- `backend-api` - Backend REST API

### Annotations

Entities use these annotations for integrations:

```yaml
annotations:
  github.com/project-slug: blackskyi/gcp-k8s-microservices
  argocd/app-name: microservices
  backstage.io/kubernetes-id: frontend
  backstage.io/kubernetes-namespace: microservices
  trivy/image-ref: us-central1-docker.pkg.dev/PROJECT_ID/microservices/frontend
  sigstore/attestation-enabled: 'true'
  kyverno/policy-enforced: 'true'
  prometheus.io/scrape: 'true'
```

## Deployment to Production

### Using Docker

1. **Build the image**:
   ```bash
   docker build -t backstage:latest .
   ```

2. **Run with production config**:
   ```bash
   docker run -p 7007:7007 \
     -e GITHUB_TOKEN=$GITHUB_TOKEN \
     -e POSTGRES_HOST=your-db-host \
     backstage:latest
   ```

### Using Kubernetes

1. **Create Kubernetes manifests** (example):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backstage
  namespace: backstage
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backstage
  template:
    metadata:
      labels:
        app: backstage
    spec:
      containers:
      - name: backstage
        image: backstage:latest
        ports:
        - containerPort: 7007
        env:
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: backstage-secrets
              key: github-token
        - name: POSTGRES_HOST
          value: postgresql.backstage.svc.cluster.local
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
  - port: 80
    targetPort: 7007
  type: LoadBalancer
```

2. **Apply**:
   ```bash
   kubectl apply -f backstage-deployment.yaml
   ```

## Viewing Supply Chain Security

### Per-Component View

1. Navigate to a component (e.g., "frontend")
2. View the **Overview** tab for SLSA badge
3. Click **Supply Chain Security** tab to see:
   - Image attestation verification
   - Vulnerability scan results
   - Kyverno policy compliance

### System-Wide View

1. Navigate to **Catalog**
2. Filter by tag: `slsa`, `signed`, `supply-chain-security`
3. View security metadata across all components

## Verifying Attestations Manually

From the Backstage UI, copy the verification command and run locally:

```bash
# Install GitHub CLI
gh auth login

# Verify attestation
gh attestation verify \
  oci://us-central1-docker.pkg.dev/PROJECT_ID/microservices/frontend@sha256:abc123... \
  --owner blackskyi
```

## Customization

### Adding New Components

1. Create `catalog-info.yaml` in your service directory:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  description: My new service
  annotations:
    github.com/project-slug: blackskyi/gcp-k8s-microservices
    trivy/image-ref: your-image-ref
    sigstore/attestation-enabled: 'true'
  tags:
    - microservice
    - slsa
spec:
  type: service
  lifecycle: production
  owner: platform-team
  system: microservices-platform
```

2. Register in `app-config.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: ../path/to/catalog-info.yaml
```

### Adding New Plugins

Install from npm:

```bash
cd packages/app
yarn add @backstage-community/plugin-your-plugin
```

Or create a custom plugin:

```bash
yarn new --select plugin
```

## Troubleshooting

### "Failed to fetch catalog"

- Check GitHub token permissions
- Verify catalog file paths in `app-config.yaml`
- Check network connectivity

### "Kubernetes connection failed"

- Verify service account token is valid
- Check cluster URL and CA data
- Ensure network access to cluster

### "ArgoCD integration not working"

- Verify ArgoCD URL is accessible
- Check username/password
- Ensure ArgoCD API is reachable

### Plugin build errors

Clear cache and rebuild:

```bash
yarn clean
yarn install
yarn build
```

## Resources

- [Backstage Documentation](https://backstage.io/docs)
- [Supply Chain Security Guide](../SUPPLY-CHAIN-SECURITY.md)
- [Project Documentation](../DOCUMENTATION.md)
- [GitHub Actions Workflows](../.github/workflows/)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review the main [project documentation](../README.md)
3. Check [GitHub Issues](https://github.com/blackskyi/gcp-k8s-microservices/issues)

## License

Apache 2.0
