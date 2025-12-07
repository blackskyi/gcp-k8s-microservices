# GCP Kubernetes Microservices Deployment

[![Infrastructure](https://github.com/blackskyi/gcp-k8s-microservices/workflows/1%EF%B8%8F%E2%83%A3%20Deploy%20Infrastructure/badge.svg)](https://github.com/blackskyi/gcp-k8s-microservices/actions)
[![Configure](https://github.com/blackskyi/gcp-k8s-microservices/workflows/2%EF%B8%8F%E2%83%A3%20Configure%20Cluster/badge.svg)](https://github.com/blackskyi/gcp-k8s-microservices/actions)
[![Build-Deploy](https://github.com/blackskyi/gcp-k8s-microservices/workflows/3%EF%B8%8F%E2%83%A3%20Build%20and%20Deploy%20Application/badge.svg)](https://github.com/blackskyi/gcp-k8s-microservices/actions)

A complete, production-ready microservices deployment pipeline on Google Cloud Platform (GKE) with full supply chain security using:

- **Infrastructure as Code**: Terraform
- **Configuration Management**: Ansible
- **CI/CD**: GitHub Actions
- **GitOps**: ArgoCD
- **Monitoring**: Prometheus + Grafana
- **Supply Chain Security**: Trivy, GitHub Attestations, Kyverno
- **Developer Portal**: Backstage with Supply Chain Security Visibility
- **Container Orchestration**: Kubernetes (GKE)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Repository                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Terraform   │  │   Ansible    │  │  Kubernetes Manifests │  │
│  │ (GKE Infra)  │  │  (Config)    │  │   (App Deployment)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflows (CI/CD)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ 1. Infra     │  │ 2. Configure │  │ 3. Build & Deploy    │  │
│  │  Deploy      │  │    Cluster   │  │    Application       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     GKE Cluster                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │ ArgoCD   │  │ Kyverno  │  │ Frontend │  │ Backend │  │  │
│  │  │ (GitOps) │  │ (Policy) │  │  (Node)  │  │ (Flask) │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │  │
│  │  ┌──────────┐  ┌──────────┐                             │  │
│  │  │Prometheus│  │PostgreSQL│  ┌──────────┐               │  │
│  │  │ +Grafana │  │  +Redis  │  │  More... │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Google Artifact Registry (Docker Images)        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Features

### Infrastructure
- ✅ **GKE Cluster** with auto-scaling node pools
- ✅ **VPC Network** with private subnets
- ✅ **Cloud NAT** for private nodes internet access
- ✅ **Artifact Registry** for Docker images
- ✅ **Workload Identity** enabled
- ✅ **Network Policies** for security

### Deployment & GitOps
- ✅ **ArgoCD** for GitOps-based deployments
- ✅ **Auto-sync** and self-healing enabled
- ✅ **Visual deployment** topology
- ✅ **Rollback** capabilities

### Monitoring
- ✅ **Prometheus** for metrics collection
- ✅ **Grafana** dashboards for visualization
- ✅ **Pre-configured** Kubernetes dashboards
- ✅ **Alertmanager** for alerting

### Supply Chain Security (Enhanced)
- ✅ **Multi-layer scanning**: Semgrep (SAST) + Grype + Trivy + Kubescape
- ✅ **SBOM Generation**: Syft creates SPDX & CycloneDX SBOMs
- ✅ **Enhanced Signing**: Cosign (Sigstore) + GitHub Attestations
- ✅ **SBOM Attestation**: SBOMs attached to images via Cosign
- ✅ **IaC Security**: Checkov + tfsec + Terrascan for Terraform/K8s
- ✅ **K8s Validation**: KubeLinter + Kubescape (NSA/CISA frameworks)
- ✅ **Dockerfile Linting**: Hadolint for best practices
- ✅ **Kyverno** runtime policy enforcement
- ✅ **SLSA Level 2+** compliance
- ✅ **Backstage Portal** with supply chain security visibility

**New Documentation:**
- 📖 [Advanced Security Guide](ADVANCED-SECURITY.md)
- 🔧 [Security Tools Reference](SECURITY-TOOLS-REFERENCE.md)

### Application
- ✅ **Frontend** (Node.js/Express)
- ✅ **Backend** (Python/Flask)
- ✅ **PostgreSQL** database with persistence
- ✅ **Redis** cache
- ✅ **Horizontal Pod Autoscaling** (HPA)
- ✅ **Health checks** and readiness probes

### CI/CD (Enhanced)
- ✅ **GitHub Actions** workflows with advanced security
- ✅ **Automated** infrastructure deployment
- ✅ **Multi-stage security scanning** (code → image → manifest → runtime)
- ✅ **SBOM generation** with Syft (SPDX + CycloneDX)
- ✅ **Dual vulnerability scanning** (Grype + Trivy)
- ✅ **Enhanced image signing** (Cosign + GitHub Attestations)
- ✅ **SBOM attestation** attached to images
- ✅ **SLSA Level 2+ provenance**
- ✅ **IaC security scanning** (daily + on PR)
- ✅ **Manifest** updates via Git commits

## 🚀 Quick Start

### Prerequisites

1. **Google Cloud Platform Account**
   - Active GCP project
   - Billing enabled

2. **Local Tools** (optional for manual operations)
   - [gcloud CLI](https://cloud.google.com/sdk/docs/install)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [terraform](https://www.terraform.io/downloads)
   - [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

3. **GitHub Repository Secrets**

   Go to Settings → Secrets and variables → Actions → New repository secret:

   ```
   GCP_PROJECT_ID     = your-gcp-project-id
   GCP_SA_KEY         = <service account JSON key>
   ```

### Setup Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copy the entire contents of key.json to GCP_SA_KEY secret
cat key.json
```

## 🎯 Deployment Steps

### Step 1: Deploy Infrastructure

1. Go to **Actions** tab
2. Select **"1️⃣ Deploy Infrastructure"** workflow
3. Click **"Run workflow"**
4. Select:
   - Action: `apply`
   - Environment: `dev`
5. Click **"Run workflow"**

⏱️ **Duration**: ~10-15 minutes

This creates:
- GKE cluster
- VPC network
- NAT gateway
- Artifact Registry

### Step 2: Configure Cluster

1. Go to **Actions** tab
2. Select **"2️⃣ Configure Cluster"** workflow
3. Click **"Run workflow"**
4. Select:
   - Environment: `dev`
   - Install ArgoCD: `✓`
   - Install Monitoring: `✓`
   - Install Kyverno: `✓` (Supply Chain Security)
5. Click **"Run workflow"**

⏱️ **Duration**: ~5-10 minutes

This installs:
- **ArgoCD** (GitOps)
- **Prometheus** (Metrics)
- **Grafana** (Dashboards)
- **Kyverno** (Policy Engine + Security Policies)

**Download artifacts** from the workflow run to get credentials!

### Step 3: Deploy Application

This workflow runs automatically on push to `main` branch, or:

1. Go to **Actions** tab
2. Select **"3️⃣ Build and Deploy Application"** workflow
3. Click **"Run workflow"**
4. Select environment: `dev`
5. Click **"Run workflow"**

⏱️ **Duration**: ~5-10 minutes

This:
- Builds Docker images (locally on runner)
- **Scans with Trivy** (blocks if vulnerabilities found)
- Uploads scan results to GitHub Security
- Pushes to Artifact Registry (only if scan passed)
- **Signs images** with GitHub Attestations
- Generates **SLSA provenance**
- Updates Kubernetes manifests
- ArgoCD auto-deploys the app
- **Kyverno verifies** signatures before allowing deployment

## 📊 Accessing Services

After deployment, access your services:

### Application
```bash
# Get frontend URL
kubectl get svc frontend -n microservices -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Visit: http://<FRONTEND_IP>
```

### ArgoCD
```bash
# Get ArgoCD URL
kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Visit: https://<ARGOCD_IP>
# Username: admin
# Password: (from artifacts in Step 2)
```

### Grafana
```bash
# Get Grafana URL
kubectl get svc kube-prometheus-stack-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Visit: http://<GRAFANA_IP>
# Username: admin
# Password: admin123  (CHANGE THIS!)
```

### Prometheus
```bash
# Port-forward to access Prometheus
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090

# Visit: http://localhost:9090
```

### Backstage (Developer Portal)

The Backstage portal provides centralized visibility into your supply chain security:

**Local Development**:
```bash
cd backstage
cp .env.example .env
# Edit .env with your GitHub token
docker-compose up --build

# Visit: http://localhost:3000
```

**Features**:
- 📊 **Service Catalog**: Browse all microservices, APIs, and resources
- 🔐 **Attestation Verification**: View SLSA provenance and signature status
- 🛡️ **Trivy Scan Results**: Monitor vulnerabilities by severity
- 📋 **Kyverno Policy Reports**: Track policy enforcement and compliance
- 🚀 **ArgoCD Integration**: Monitor GitOps deployment status
- ☸️ **Kubernetes Integration**: View pods, deployments, and resources
- 📈 **Prometheus Metrics**: View service metrics and performance

**Documentation**:
- [Backstage README](backstage/README.md)
- [Deployment Guide](backstage/DEPLOYMENT-GUIDE.md)

**Custom Plugins**:
- `AttestationCard` - GitHub attestation verification
- `TrivyScanCard` - Vulnerability scan visualization
- `KyvernoReportCard` - Policy compliance dashboard
- `SLSABadge` - SLSA level indicator

## 📁 Project Structure

```
gcp-k8s-microservices/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── 1-infrastructure.yml
│       ├── 2-configure.yml
│       ├── 3-build-deploy.yml
│       └── 4-destroy.yml
├── terraform/                  # Infrastructure as Code
│   ├── main.tf
│   ├── gke.tf
│   ├── vpc.tf
│   ├── variables.tf
│   └── outputs.tf
├── ansible/                    # Configuration Management
│   ├── playbooks/
│   │   ├── install-argocd.yml
│   │   ├── install-monitoring.yml
│   │   └── install-kyverno.yml
│   └── inventory/
├── k8s-manifests/             # Kubernetes Resources
│   ├── argocd/                # ArgoCD Applications
│   ├── kyverno/               # Security policies
│   ├── monitoring/            # Monitoring configs
│   └── microservices/         # Application manifests
│       ├── frontend/
│       ├── backend/
│       └── database/
├── backstage/                 # Developer Portal
│   ├── app-config.yaml        # Backstage configuration
│   ├── packages/              # App and backend packages
│   ├── plugins/               # Custom supply chain security plugins
│   │   └── supply-chain-security/
│   ├── docker-compose.yaml    # Local development
│   ├── Dockerfile             # Production image
│   ├── README.md              # Backstage documentation
│   └── DEPLOYMENT-GUIDE.md    # Deployment instructions
├── apps/                      # Application source code
│   ├── frontend/
│   │   └── catalog-info.yaml  # Backstage catalog entity
│   └── backend/
│       └── catalog-info.yaml  # Backstage catalog entity
├── docs/                      # Documentation
├── catalog-info.yaml          # Root Backstage catalog
├── SUPPLY-CHAIN-SECURITY.md   # Security documentation
└── README.md
```

## 🔧 Configuration

### Terraform Variables

Edit `terraform/terraform.tfvars.example`:

```hcl
project_id        = "your-gcp-project-id"
region            = "us-central1"
cluster_name      = "microservices-cluster"
node_count        = 2
node_machine_type = "e2-standard-2"
```

### Secrets Management

Kubernetes secrets in base64:

```bash
# Encode a secret
echo -n "your-secret" | base64

# Decode a secret
echo "eW91ci1zZWNyZXQ=" | base64 -d
```

**IMPORTANT**: Change all default passwords in production!

## 📈 Monitoring Dashboards

Grafana comes with pre-configured dashboards:

1. **Kubernetes Cluster Monitoring** (ID: 7249)
   - Node metrics
   - Resource usage
   - Cluster health

2. **Kubernetes Pods** (ID: 6417)
   - Pod CPU/Memory
   - Network I/O
   - Pod status

3. **Node Exporter** (ID: 1860)
   - System metrics
   - Disk usage
   - Network stats

## 🧹 Cleanup

To destroy all resources:

1. Go to **Actions** tab
2. Select **"4️⃣ Destroy Infrastructure"** workflow
3. Click **"Run workflow"**
4. Select environment: `dev`
5. Type `DESTROY` in confirmation field
6. Click **"Run workflow"**

⚠️ **Warning**: This will delete everything including data!

## 🔒 Security Best Practices

- ✅ Private GKE nodes
- ✅ Workload Identity enabled
- ✅ Network policies configured
- ✅ Secrets stored in Kubernetes secrets (use Secret Manager in prod)
- ✅ Pod security policies
- ✅ Resource limits defined
- ✅ Health checks configured

### Production Recommendations

1. **Change all default passwords**
2. **Use Google Secret Manager** for sensitive data
3. **Enable Binary Authorization**
4. **Configure Cloud Armor** for DDoS protection
5. **Set up Cloud CDN**
6. **Enable audit logging**
7. **Configure backup strategies**
8. **Set up SSL/TLS certificates**

## 🐛 Troubleshooting

### Workflow Fails at Terraform Apply

```bash
# Check GCP quotas
gcloud compute project-info describe --project=YOUR_PROJECT_ID

# Check IAM permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

### ArgoCD Not Syncing

```bash
# Check ArgoCD application status
kubectl get applications -n argocd

# View ArgoCD logs
kubectl logs -n argocd deployment/argocd-server
```

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n microservices

# View pod logs
kubectl logs -n microservices <pod-name>

# Describe pod
kubectl describe pod -n microservices <pod-name>
```

## 📚 Documentation

- [Setup Guide](docs/setup-guide.md)
- [Architecture Details](docs/architecture.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [Supply Chain Security Guide](SUPPLY-CHAIN-SECURITY.md)
- [Backstage Portal](backstage/README.md)
- [Backstage Deployment Guide](backstage/DEPLOYMENT-GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/blackskyi/gcp-k8s-microservices/issues)
- **Discussions**: [GitHub Discussions](https://github.com/blackskyi/gcp-k8s-microservices/discussions)

## ⭐ Acknowledgments

- Terraform GCP Provider
- Ansible Kubernetes Collection
- ArgoCD Project
- Prometheus Community
- Grafana Labs

---

**Built with ❤️ using Terraform, Ansible, Kubernetes, and ArgoCD**
