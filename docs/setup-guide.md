# Complete Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GCP Setup](#gcp-setup)
3. [GitHub Setup](#github-setup)
4. [Local Development](#local-development)
5. [Deployment](#deployment)

## Prerequisites

### Required Accounts

- Google Cloud Platform account with billing enabled
- GitHub account
- Domain (optional, for custom domains)

### Cost Estimate

For dev environment:
- GKE cluster: ~$150/month
- Load Balancers: ~$20/month each
- Persistent disks: ~$10/month
- **Total**: ~$200-250/month

💡 **Tip**: Use `preemptible` nodes to reduce costs by 80%

## GCP Setup

### 1. Create GCP Project

```bash
# Set variables
export PROJECT_ID="my-microservices-project"
export BILLING_ACCOUNT="YOUR_BILLING_ACCOUNT_ID"

# Create project
gcloud projects create $PROJECT_ID

# Link billing
gcloud beta billing projects link $PROJECT_ID \
  --billing-account=$BILLING_ACCOUNT

# Set as default
gcloud config set project $PROJECT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  servicenetworking.googleapis.com
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions workflows"

# Grant roles
for role in \
  roles/container.admin \
  roles/compute.admin \
  roles/iam.serviceAccountUser \
  roles/artifactregistry.admin \
  roles/storage.admin; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="$role"
done

# Create key
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com

# Display key (copy this for GitHub secret)
cat ~/github-actions-key.json
```

### 4. Create GCS Bucket for Terraform State

```bash
# Create bucket
gsutil mb -p $PROJECT_ID -l us-central1 gs://${PROJECT_ID}-terraform-state

# Enable versioning
gsutil versioning set on gs://${PROJECT_ID}-terraform-state

# Update terraform/main.tf with bucket name
sed -i "s/YOUR_TERRAFORM_STATE_BUCKET/${PROJECT_ID}-terraform-state/g" terraform/main.tf
```

## GitHub Setup

### 1. Fork/Clone Repository

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/gcp-k8s-microservices.git
cd gcp-k8s-microservices
```

### 2. Configure Repository Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

| Name | Value | Description |
|------|-------|-------------|
| `GCP_PROJECT_ID` | Your project ID | GCP project identifier |
| `GCP_SA_KEY` | Contents of `github-actions-key.json` | Service account key |

### 3. Configure Environments

Go to: **Settings → Environments**

Create environments:
- `dev`
- `staging`
- `production`

For `production` environment:
- ✅ Enable "Required reviewers"
- ✅ Add yourself as reviewer

### 4. Update Repository URLs

```bash
# Update ArgoCD app manifest
sed -i "s/YOUR_USERNAME/${GITHUB_ACTOR}/g" k8s-manifests/argocd/microservices-app.yaml

# Update README badges
sed -i "s/YOUR_USERNAME/${GITHUB_ACTOR}/g" README.md
```

## Local Development

### 1. Install Tools

**macOS:**
```bash
brew install terraform ansible kubectl gcloud helm
```

**Ubuntu:**
```bash
# Terraform
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Ansible
sudo apt update
sudo apt install ansible

# kubectl
sudo snap install kubectl --classic

# gcloud
curl https://sdk.cloud.google.com | bash

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. Authenticate gcloud

```bash
gcloud auth login
gcloud config set project $PROJECT_ID
gcloud auth application-default login
```

### 3. Test Terraform Locally

```bash
cd terraform

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
project_id        = "$PROJECT_ID"
region            = "us-central1"
cluster_name      = "microservices-cluster-dev"
environment       = "dev"
node_count        = 2
node_machine_type = "e2-standard-2"
EOF

# Initialize
terraform init

# Plan
terraform plan

# Apply (optional)
terraform apply
```

## Deployment

### Quick Deploy (GitHub Actions)

#### Step 1: Infrastructure

1. Go to **Actions** tab
2. Run **"1️⃣ Deploy Infrastructure"**
3. Select: `apply` + `dev`
4. Wait ~10-15 minutes

#### Step 2: Configuration

1. Run **"2️⃣ Configure Cluster"**
2. Select: `dev` + both checkboxes
3. Download credentials artifacts
4. Wait ~5-10 minutes

#### Step 3: Application

1. Run **"3️⃣ Build and Deploy Application"**
2. Select: `dev`
3. Wait ~5-10 minutes

### Manual Deploy (CLI)

If you prefer manual deployment:

```bash
# 1. Deploy infrastructure
cd terraform
terraform init
terraform apply

# 2. Get cluster credentials
gcloud container clusters get-credentials microservices-cluster-dev \
  --region us-central1

# 3. Install ArgoCD
cd ../ansible/playbooks
export CLUSTER_NAME="microservices-cluster-dev"
export GCP_PROJECT="$PROJECT_ID"
export GCP_REGION="us-central1"
ansible-playbook -i ../inventory/localhost install-argocd.yml

# 4. Install monitoring
ansible-playbook -i ../inventory/localhost install-monitoring.yml

# 5. Apply ArgoCD application
kubectl apply -f ../../k8s-manifests/argocd/microservices-app.yaml

# 6. Build and push images (example for frontend)
cd ../../apps/frontend
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/microservices-cluster-dev-docker/frontend:latest .
docker push us-central1-docker.pkg.dev/$PROJECT_ID/microservices-cluster-dev-docker/frontend:latest
```

## Verification

### Check Infrastructure

```bash
# List GKE clusters
gcloud container clusters list

# Check nodes
kubectl get nodes

# Check namespaces
kubectl get namespaces
```

### Check Applications

```bash
# ArgoCD
kubectl get applications -n argocd

# Microservices
kubectl get pods -n microservices
kubectl get svc -n microservices

# Monitoring
kubectl get pods -n monitoring
```

### Access Services

```bash
# Frontend URL
echo "http://$(kubectl get svc frontend -n microservices -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"

# ArgoCD URL
echo "https://$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"

# Grafana URL
echo "http://$(kubectl get svc kube-prometheus-stack-grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

## Next Steps

1. ✅ Change default passwords
2. ✅ Set up custom domain
3. ✅ Configure SSL certificates
4. ✅ Set up backup policies
5. ✅ Configure alerting rules
6. ✅ Review monitoring dashboards
7. ✅ Test auto-scaling
8. ✅ Document runbooks

## Support

- Check [Troubleshooting Guide](troubleshooting.md)
- Open [GitHub Issue](https://github.com/YOUR_USERNAME/gcp-k8s-microservices/issues)
