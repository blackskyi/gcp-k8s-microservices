# 🎯 Security Dashboard Guide - Where to See Everything

This guide shows you all the visual dashboards where you can see your security scan results.

---

## 1. 🌟 GitHub Security Tab (PRIMARY - Best Visual Dashboard)

**URL:** https://github.com/blackskyi/gcp-k8s-microservices/security/code-scanning

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  Security > Code scanning                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filters:  [All tools ▼] [All severities ▼]           │
│                                                         │
│  ⚠️  HIGH    GKE Control Plane exposed                 │
│     Terrascan • terraform/gke.tf                       │
│     Opened 2 hours ago                                 │
│                                                         │
│  ⚠️  MEDIUM  Vulnerable dependency detected            │
│     Grype • apps/frontend/package.json                 │
│     Opened 3 hours ago                                 │
│                                                         │
│  📊  View by: Tool | Severity | File | Status          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Features:
- ✅ **Filter by tool**: Checkov, tfsec, Terrascan, KubeLinter, Kubescape, Grype, Trivy, Hadolint
- ✅ **Filter by severity**: Critical, High, Medium, Low
- ✅ **Click on alert** to see:
  - Full description
  - Affected code snippet
  - Remediation advice
  - Timeline of when it appeared
- ✅ **Dismiss false positives**
- ✅ **Track remediation status**

### How to Access:
```bash
# Open directly in browser
open https://github.com/blackskyi/gcp-k8s-microservices/security/code-scanning

# Or navigate manually:
# 1. Go to your GitHub repository
# 2. Click "Security" tab at top
# 3. Click "Code scanning" in left sidebar
```

---

## 2. 📊 GitHub Actions Summary (Workflow Results)

**URL:** https://github.com/blackskyi/gcp-k8s-microservices/actions

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  🔒 Security Scanning (IaC & Manifests)                │
│  ✓ Completed in 1m 22s                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✓ Kubernetes Manifest Security (52s)                 │
│    ├─ ✓ KubeLinter scan                               │
│    ├─ ✓ Checkov K8s scan                              │
│    └─ ✓ Kubescape scan                                │
│                                                         │
│  ✓ Terraform Security Scan (47s)                      │
│    ├─ ✓ Checkov scan                                  │
│    ├─ ✓ tfsec scan                                    │
│    └─ ⚠️  Terrascan (1 finding)                       │
│                                                         │
│  ✓ Dockerfile Security Scan (23s)                     │
│    └─ ✓ Hadolint scan                                 │
│                                                         │
│  📊 Security Scan Summary                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Features:
- ✅ Real-time build progress
- ✅ See which scans passed/failed
- ✅ Download SBOM artifacts
- ✅ View detailed logs
- ✅ Beautiful emoji-based summary

### How to Access:
```bash
# Open Actions tab
open https://github.com/blackskyi/gcp-k8s-microservices/actions

# Or navigate manually:
# 1. Go to your GitHub repository
# 2. Click "Actions" tab at top
# 3. Click latest workflow run
```

---

## 3. 🎨 Backstage Developer Portal (Service Catalog View)

**URL:** http://localhost:3000 (when running)

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  Microservices Platform                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Services:                                             │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │  Frontend    │  │  Backend     │                   │
│  │              │  │              │                   │
│  │  🟢 Healthy  │  │  🟢 Healthy  │                   │
│  │              │  │              │                   │
│  │  Security:   │  │  Security:   │                   │
│  │  ⚠️ 3 alerts │  │  ⚠️ 5 alerts │                   │
│  │              │  │              │                   │
│  │  SBOM ✓     │  │  SBOM ✓     │                   │
│  │  Signed ✓   │  │  Signed ✓   │                   │
│  └──────────────┘  └──────────────┘                  │
│                                                         │
│  Infrastructure:                                       │
│  • GKE Cluster: microservices-cluster-dev             │
│  • Security: Kyverno policies active                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Setup:
```bash
cd backstage

# Create .env file if doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Edit backstage/.env and add your GitHub token:"
  echo "   GITHUB_TOKEN=ghp_your_token_here"
fi

# Start Backstage
docker-compose up -d

# Wait 30 seconds for startup
sleep 30

# Open in browser
open http://localhost:3000
```

### Features:
- ✅ Service catalog overview
- ✅ Security posture per service
- ✅ SBOM attestation status
- ✅ Link to detailed security findings
- ✅ CI/CD pipeline status
- ✅ Documentation integration

### How to Stop:
```bash
cd backstage
docker-compose down
```

---

## 4. 📈 ArgoCD Dashboard (Deployment View)

**URL:** https://argocd.your-domain.com (if ArgoCD UI exposed)

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  Applications                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  frontend-app                                          │
│  🟢 Synced | Healthy                                   │
│  Image: us-central1-docker.pkg.dev/.../frontend:abc123│
│  Kyverno: ✓ Image verified                            │
│                                                         │
│  backend-app                                           │
│  🟢 Synced | Healthy                                   │
│  Image: us-central1-docker.pkg.dev/.../backend:abc123 │
│  Kyverno: ✓ Image verified                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Features:
- ✅ Real-time deployment status
- ✅ Image verification status (Kyverno)
- ✅ Sync history
- ✅ Resource health
- ✅ Policy enforcement status

### How to Access:
```bash
# Port-forward to ArgoCD server (if not exposed)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open in browser
open https://localhost:8080

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

---

## 5. 🔍 Kubernetes Dashboard (Runtime View)

**URL:** http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  Workloads > Deployments                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  frontend    Running    2/2 pods                       │
│  • Security Context: Non-root ✓                       │
│  • Resources: Limits set ✓                            │
│  • Probes: Configured ✓                               │
│                                                         │
│  backend     Running    2/2 pods                       │
│  • Security Context: Non-root ✓                       │
│  • Resources: Limits set ✓                            │
│  • Probes: Configured ✓                               │
│                                                         │
│  Policy Reports (Kyverno):                             │
│  ✓ All images verified                                │
│  ✓ All pods compliant                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Setup:
```bash
# Deploy Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create admin user
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Get token
kubectl -n kubernetes-dashboard create token admin-user

# Start proxy
kubectl proxy

# Open dashboard
open http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

---

## 6. 📦 Artifact Registry (SBOM & Images)

**URL:** https://console.cloud.google.com/artifacts

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  Artifact Registry > microservices-repo                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  frontend:abc123                                       │
│  • Size: 245 MB                                        │
│  • Pushed: 2 hours ago                                │
│  • Signed: ✓ Cosign signature                         │
│  • SBOM: ✓ Attached                                   │
│  • Vulnerability scan: 3 findings                      │
│                                                         │
│  backend:abc123                                        │
│  • Size: 189 MB                                        │
│  • Pushed: 2 hours ago                                │
│  • Signed: ✓ Cosign signature                         │
│  • SBOM: ✓ Attached                                   │
│  • Vulnerability scan: 5 findings                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### How to Access:
```bash
# Open GCP Console
open https://console.cloud.google.com/artifacts?project=job-automation-470905

# Or use gcloud CLI
gcloud artifacts docker images list us-central1-docker.pkg.dev/job-automation-470905/microservices-repo

# View vulnerabilities
gcloud artifacts docker images describe IMAGE_URL --show-package-vulnerability
```

---

## 7. 📋 GitHub Workflow Artifacts (SBOMs)

**URL:** https://github.com/blackskyi/gcp-k8s-microservices/actions

### What You'll See:
```
┌─────────────────────────────────────────────────────────┐
│  Build and Deploy Application #123                    │
│  ✓ Completed 2 hours ago                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Artifacts (90 days retention):                        │
│                                                         │
│  📦 frontend-sbom (2.1 MB)                            │
│     • SPDX JSON format                                │
│     • CycloneDX JSON format                           │
│     [Download]                                         │
│                                                         │
│  📦 backend-sbom (1.8 MB)                             │
│     • SPDX JSON format                                │
│     • CycloneDX JSON format                           │
│     [Download]                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### How to Download:
```bash
# Using GitHub CLI
gh run list --repo blackskyi/gcp-k8s-microservices --workflow="3-build-deploy.yml" --limit 1

# Download specific artifact
gh run download --repo blackskyi/gcp-k8s-microservices --name frontend-sbom
gh run download --repo blackskyi/gcp-k8s-microservices --name backend-sbom

# Or download from web:
# 1. Go to Actions tab
# 2. Click latest "Build and Deploy" run
# 3. Scroll to bottom
# 4. Click artifact name to download
```

---

## 🎯 Quick Access Script

Save this script for quick access to all dashboards:

```bash
#!/bin/bash
# File: open-dashboards.sh

echo "🎯 Opening Security Dashboards..."
echo ""

# GitHub Security Tab
echo "1. Opening GitHub Security..."
open https://github.com/blackskyi/gcp-k8s-microservices/security/code-scanning

sleep 2

# GitHub Actions
echo "2. Opening GitHub Actions..."
open https://github.com/blackskyi/gcp-k8s-microservices/actions

sleep 2

# Start Backstage if not running
echo "3. Starting Backstage..."
if ! docker ps | grep -q backstage; then
  cd backstage && docker-compose up -d
  echo "   Waiting 30s for Backstage to start..."
  sleep 30
  open http://localhost:3000
else
  open http://localhost:3000
fi

echo ""
echo "✅ All dashboards opened!"
echo ""
echo "📊 Summary:"
echo "   • GitHub Security: Security findings"
echo "   • GitHub Actions: Build & scan results"
echo "   • Backstage: Service catalog & overview"
echo ""
echo "📚 See SECURITY-DASHBOARD-GUIDE.md for more options"
```

Make it executable:
```bash
chmod +x open-dashboards.sh
./open-dashboards.sh
```

---

## 📊 Comparison: Which Dashboard to Use?

| Use Case | Best Dashboard | Why |
|----------|---------------|-----|
| **View all security findings** | GitHub Security Tab | Centralized, filterable, actionable |
| **Check workflow status** | GitHub Actions | Real-time build progress |
| **Service overview** | Backstage | High-level catalog view |
| **Download SBOMs** | GitHub Artifacts | Direct access to files |
| **Verify deployments** | ArgoCD | GitOps sync status |
| **Runtime security** | Kubernetes Dashboard | Live pod/policy status |
| **Image details** | GCP Artifact Registry | Signatures, vulnerabilities |

---

## 🚀 Recommended Workflow

**Daily Security Review:**
```bash
# 1. Check GitHub Security tab for new alerts
open https://github.com/blackskyi/gcp-k8s-microservices/security/code-scanning

# 2. Review latest workflow run
open https://github.com/blackskyi/gcp-k8s-microservices/actions

# 3. Verify deployments in ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443
open https://localhost:8080
```

**Weekly SBOM Review:**
```bash
# Download latest SBOMs
gh run download --repo blackskyi/gcp-k8s-microservices --name frontend-sbom
gh run download --repo blackskyi/gcp-k8s-microservices --name backend-sbom

# Scan with Grype
grype sbom:frontend-sbom.spdx.json
grype sbom:backend-sbom.spdx.json
```

**Monthly Security Audit:**
```bash
# 1. Review all GitHub Security findings
# 2. Check Backstage service health
# 3. Verify all images are signed (Kyverno reports)
# 4. Audit Terraform security findings
```

---

## ❓ Troubleshooting

**GitHub Security tab is empty:**
- Wait 5-10 minutes after workflow completes
- Check that SARIF upload steps succeeded
- Verify you have "Security" permissions on repo

**Backstage won't start:**
- Check `.env` file has valid GitHub token
- Run `docker-compose logs` to see errors
- Ensure port 3000 is not in use

**ArgoCD not accessible:**
- Verify ArgoCD is installed: `kubectl get pods -n argocd`
- Check port-forward is active: `kubectl port-forward svc/argocd-server -n argocd 8080:443`
- Get password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

---

## 📚 Next Steps

1. **Bookmark these URLs:**
   - GitHub Security: https://github.com/blackskyi/gcp-k8s-microservices/security/code-scanning
   - GitHub Actions: https://github.com/blackskyi/gcp-k8s-microservices/actions

2. **Set up Backstage** for service catalog view

3. **Review findings** in GitHub Security tab

4. **Download SBOMs** and scan locally

5. **Configure notifications** for security alerts in GitHub

---

**For more information, see:**
- `ADVANCED-SECURITY.md` - Complete security feature guide
- `WORKFLOW-FIXES.md` - Troubleshooting guide
- `HOW-TO-SEE-SECURITY-IN-ACTION.md` - Visual examples
