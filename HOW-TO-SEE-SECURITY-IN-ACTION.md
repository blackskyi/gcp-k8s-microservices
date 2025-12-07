# How to See Security Features in Action

This guide shows you exactly where to see all the new security features with screenshots and step-by-step instructions.

## 🎯 Quick Overview

| Feature | Where to See It | Link |
|---------|----------------|------|
| **All Security Scans** | GitHub Security Tab | `github.com/YOUR_REPO/security` |
| **Workflow Summary** | GitHub Actions | `github.com/YOUR_REPO/actions` |
| **SBOMs (Download)** | Workflow Artifacts | Actions → Run → Artifacts |
| **Visual Dashboard** | Backstage | `http://localhost:3000` |
| **Vulnerability Alerts** | GitHub Security → Code Scanning | Auto-alerts |
| **Supply Chain** | GitHub Insights → Dependency Graph | Visualize dependencies |

---

## 1️⃣ GitHub Security Tab (Main Dashboard)

### Access:
```
https://github.com/YOUR_USERNAME/gcp-k8s-microservices/security
```

### Navigation Steps:
1. Open your repository on GitHub
2. Click **"Security"** tab (top navigation)
3. Click **"Code scanning"** in the left sidebar

### What You'll See:

```
┌─────────────────────────────────────────────────────┐
│ Code scanning alerts                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔴 Critical (3)  🟠 High (12)  🟡 Medium (8)  ⚪ Low │
│                                                     │
│ [Filter by tool ▼] [Filter by severity ▼]          │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🔴 SQL Injection vulnerability               │   │
│ │ Tool: semgrep | Category: security-audit    │   │
│ │ Location: apps/backend/app.py:45            │   │
│ │ [View details →]                             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🟠 High severity CVE in express package      │   │
│ │ Tool: grype | Category: frontend-grype      │   │
│ │ CVE: CVE-2024-12345                         │   │
│ │ [View details →]                             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Filter by Tool:
Click the dropdown to see results from specific tools:
- `frontend-grype` - Grype scan (frontend container)
- `backend-grype` - Grype scan (backend container)
- `frontend-trivy` - Trivy scan (frontend)
- `backend-trivy` - Trivy scan (backend)
- `kubescape-frontend` - K8s security (frontend manifests)
- `kubescape-backend` - K8s security (backend manifests)
- `terraform-checkov` - Infrastructure security
- `kubernetes-kubelinter` - Manifest validation
- `semgrep` - Code security

### Clicking an Alert Shows:
- **Description** of the issue
- **Severity** and **CWE/CVE** number
- **Location** in code (file:line)
- **Remediation** advice
- **Timeline** (when introduced, when fixed)
- **Affected versions**

---

## 2️⃣ GitHub Actions - Workflow Summary

### Access:
```
https://github.com/YOUR_USERNAME/gcp-k8s-microservices/actions
```

### Steps to See the Enhanced Summary:

1. Click **"Actions"** tab
2. Click **"3️⃣ Build and Deploy Application"** workflow
3. Click on the latest run
4. **Scroll down** to see the beautiful summary dashboard

### What the Summary Shows:

```markdown
# 🚀 Application Built and Deployed Successfully!

## 📦 Container Images
| Service | Image | Digest |
|---------|-------|--------|
| Frontend | us-central1-docker.pkg.dev/.../frontend:abc123 | sha256:def456... |
| Backend | us-central1-docker.pkg.dev/.../backend:abc123 | sha256:ghi789... |

## 🛡️ Multi-Layer Security Validation

### 1️⃣ Code-Level Security
- ✅ Semgrep - AI-powered SAST scanning
- ✅ GitHub Advanced Security - CodeQL analysis

### 2️⃣ Software Bill of Materials (SBOM)
- ✅ Syft - Generated SPDX and CycloneDX SBOMs
- ✅ Cosign - Attached SBOMs to container images
- 📥 SBOMs uploaded as workflow artifacts

### 3️⃣ Container Vulnerability Scanning
- ✅ Grype - SBOM-based vulnerability scanning (PRIMARY)
- ✅ Trivy - Image scanning (SECONDARY/COMPARISON)
- 🚫 Build blocked on HIGH/CRITICAL vulnerabilities

### 4️⃣ Kubernetes Security Posture
- ✅ Kubescape - K8s manifest scanning (NSA/CISA guidelines)
- ✅ Kyverno - Runtime policy enforcement

### 5️⃣ Image Signing & Attestation
- ✅ Cosign - Keyless signing with Sigstore
- ✅ GitHub Attestations - SLSA Build Provenance (Level 2+)
- ✅ Transparency Log - All signatures in Rekor

## 📊 Security Metrics Dashboard
| Security Layer | Tool | Status | Coverage |
|----------------|------|--------|----------|
| Source Code | Semgrep | ✅ | Security patterns, Secrets, OWASP |
| Dependencies | Grype + Trivy | ✅ | CVE scanning, License check |
| Container | SBOM + Signatures | ✅ | Supply chain transparency |
| Kubernetes | Kubescape + Kyverno | ✅ | NSA/CISA compliance |
| Provenance | Cosign + GitHub | ✅ | SLSA Level 2+ |
```

**This is a visual, copy-paste-ready dashboard right in GitHub!**

---

## 3️⃣ Download SBOMs (Workflow Artifacts)

### Steps:

1. Go to **Actions** tab
2. Click on a workflow run (e.g., "Build and Deploy Application")
3. Scroll to the bottom of the page
4. Find **"Artifacts"** section
5. Click to download:
   - `frontend-sbom` (zip file)
   - `backend-sbom` (zip file)

### Extract and View:

```bash
# Unzip the artifact
unzip frontend-sbom.zip

# View SBOM (pretty print)
cat frontend-sbom.spdx.json | jq .

# See all packages
cat frontend-sbom.spdx.json | jq '.packages[] | {name, version, license}'

# Count dependencies
cat frontend-sbom.spdx.json | jq '.packages | length'

# Find specific package
cat frontend-sbom.spdx.json | jq '.packages[] | select(.name | contains("express"))'
```

### SBOM Visualization Tools:

**Option 1: SBOM Viewer (Web)**
```bash
# Install SBOM viewer
npm install -g @cyclonedx/sbom-viewer

# View SBOM in browser
sbom-viewer frontend-sbom.cyclonedx.json
```

**Option 2: Dependency-Track**
- Upload SBOM to Dependency-Track for visual dashboard
- Tracks vulnerabilities over time
- Shows license compliance

---

## 4️⃣ Backstage Developer Portal

You already have Backstage set up! Let's see it in action.

### Start Backstage:

```bash
cd /Users/gokul/devops-projects/gcp-k8s-microservices/backstage

# Copy environment file
cp .env.example .env

# Edit .env and add your GitHub token
# GITHUB_TOKEN=ghp_your_token_here

# Start with Docker Compose
docker-compose up

# Wait for "Backstage is now running..."
# Open browser: http://localhost:3000
```

### What You'll See in Backstage:

#### 1. Service Catalog
```
┌─────────────────────────────────────────┐
│ 📦 Services                              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🎨 Frontend                         │ │
│ │ Owner: team-a                       │ │
│ │ Type: service                       │ │
│ │ [View details →]                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ⚙️ Backend                           │ │
│ │ Owner: team-a                       │ │
│ │ Type: service                       │ │
│ │ [View details →]                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2. Security Overview (Custom Plugins)

When you click on a service, you'll see tabs:
- **Overview** - General info
- **CI/CD** - GitHub Actions status
- **Security** - 🆕 Supply chain security!
- **Kubernetes** - Live pod status
- **Dependencies** - Dependency graph

**Security Tab Shows:**
```
┌─────────────────────────────────────────┐
│ 🔐 Supply Chain Security                │
├─────────────────────────────────────────┤
│                                         │
│ SLSA Level: [████████░░] 2+            │
│                                         │
│ ✅ Attestation Status                   │
│    Build Provenance: Verified          │
│    Signature: Valid (Cosign + GitHub)  │
│    Timestamp: 2024-12-06 21:30 UTC     │
│                                         │
│ 📊 Vulnerability Scan (Trivy)           │
│    Critical: 0                          │
│    High: 2                              │
│    Medium: 5                            │
│    [View details →]                     │
│                                         │
│ 📋 Kyverno Policy Report                │
│    Passed: 15/15                        │
│    [View policies →]                    │
│                                         │
└─────────────────────────────────────────┘
```

### Enhance Backstage with SBOM Plugin:

To add SBOM visualization to Backstage, I can create a custom plugin. Would you like me to do that?

---

## 5️⃣ Command Line (Verify Everything)

### Verify Cosign Signatures:

```bash
# Set your image URL
FRONTEND_IMAGE="us-central1-docker.pkg.dev/PROJECT_ID/REPO/frontend:TAG@sha256:DIGEST"

# Verify signature
cosign verify $FRONTEND_IMAGE \
  --certificate-identity-regexp=https://github.com/YOUR_USERNAME/gcp-k8s-microservices \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com

# If successful, you'll see:
# ✅ Verification for IMAGE -- The following checks were performed:
#    - The cosign claims were validated
#    - Existence of the claims in the transparency log was verified offline
#    - The signatures were verified against the specified public key
```

### Verify SBOM Attestation:

```bash
# Verify and extract SBOM
cosign verify-attestation $FRONTEND_IMAGE \
  --type spdxjson \
  --certificate-identity-regexp=https://github.com/YOUR_USERNAME/gcp-k8s-microservices \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  | jq -r .payload | base64 -d | jq . > verified-sbom.json

# Now you have the SBOM!
cat verified-sbom.json | jq '.packages[] | {name, version}'
```

### Scan SBOM for Vulnerabilities:

```bash
# Scan the verified SBOM
grype sbom:verified-sbom.json

# Output:
# NAME       INSTALLED  VULNERABILITY   SEVERITY
# express    4.18.1     CVE-2024-12345  High
# lodash     4.17.20    CVE-2023-67890  Medium
```

---

## 6️⃣ Live Demo - Trigger a Build

Let's see everything in action!

### Step 1: Make a Small Change

```bash
cd /Users/gokul/devops-projects/gcp-k8s-microservices

# Make a small change
echo "# Security test" >> apps/frontend/README.md

git add .
git commit -m "Test security pipeline"
git push origin main
```

### Step 2: Watch the Workflow

1. Go to **Actions** tab immediately
2. You'll see the workflow start
3. Watch it execute each step:
   - ✅ Semgrep scan
   - ✅ Build images
   - ✅ Generate SBOMs
   - ✅ Grype scan
   - ✅ Trivy scan
   - ✅ Kubescape scan
   - ✅ Sign with Cosign
   - ✅ Attest SBOM
   - ✅ Push images

### Step 3: Check Results

**While it's running:**
- Real-time logs show each security check
- Green ✅ or red ❌ for each step

**After completion:**
- Scroll down to see the beautiful summary
- Check **Security** tab for any findings
- Download SBOM artifacts

### Step 4: Verify

```bash
# Get the image digest from workflow summary
# Then verify signature
cosign verify IMAGE@DIGEST \
  --certificate-identity-regexp=REPO \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

---

## 7️⃣ Scheduled Security Scan

The new IaC security workflow runs daily. To see it:

### Manual Trigger:

1. Go to **Actions** tab
2. Click **"🔒 Security Scanning (IaC & Manifests)"**
3. Click **"Run workflow"** dropdown
4. Click **"Run workflow"** button
5. Watch it scan:
   - Terraform files (Checkov + tfsec)
   - Kubernetes manifests (KubeLinter + Kubescape)
   - Dockerfiles (Hadolint)

### Results:

- **Security** tab shows all findings
- Summary shows pass/fail for each tool
- SARIF files available for download

---

## 8️⃣ Visual Comparison: Before vs After

### Before (What you had):
```
Push code → Build → Trivy scan → Push image → Sign → Deploy
```

### After (What you have now):
```
Push code
  ↓
Semgrep scan (code security)
  ↓
Build images
  ↓
Generate SBOM (Syft)
  ↓
Grype scan (SBOM-based) ← PRIMARY SCANNER
  ↓
Trivy scan (image-based) ← COMPARISON
  ↓
Kubescape scan (K8s security)
  ↓
Push images (only if scans pass)
  ↓
Sign with Cosign (keyless)
  ↓
Attach SBOM to image
  ↓
Sign with GitHub Attestations
  ↓
Upload SBOMs as artifacts
  ↓
Deploy via ArgoCD
  ↓
Kyverno verifies signatures (runtime)
```

---

## 🎬 Video Walkthrough (Script)

Want to record a demo? Here's a script:

1. **Start**: "Let me show you the security pipeline..."
2. **Trigger build**: Push a commit
3. **Show Actions tab**: Point out each security step
4. **Show workflow summary**: "This dashboard shows everything"
5. **Show Security tab**: "All vulnerabilities in one place"
6. **Download SBOM**: "Here's the complete dependency list"
7. **Verify signature**: Run cosign verify command
8. **Show Backstage**: "Visual dashboard for the team"

---

## 📊 Metrics to Track

### Weekly Security Report:

```bash
# Count vulnerabilities by severity
gh api repos/OWNER/REPO/code-scanning/alerts \
  | jq 'group_by(.rule.severity) | map({severity: .[0].rule.severity, count: length})'

# Output:
# [
#   {"severity": "critical", "count": 2},
#   {"severity": "high", "count": 8},
#   {"severity": "medium", "count": 15}
# ]
```

### SBOM Metrics:

```bash
# Count total dependencies
cat frontend-sbom.spdx.json | jq '.packages | length'

# Count by license type
cat frontend-sbom.spdx.json | jq '[.packages[].licenseConcluded] | group_by(.) | map({license: .[0], count: length})'
```

---

## 🚀 Next: See It Live!

**Quickest way to see everything:**

1. Make a small change and push
2. Go to Actions tab → Watch the workflow
3. After completion → Scroll down for the summary
4. Go to Security tab → See all findings
5. Download SBOM artifacts
6. Start Backstage → See visual dashboard

**All of this is already configured and ready to go!** 🎉

---

## Need Help?

- **GitHub Actions not running?** Check `.github/workflows/` permissions
- **Cosign verify fails?** Ensure image has been pushed from workflow
- **Backstage not starting?** Check `.env` file has GITHUB_TOKEN
- **SBOMs not generated?** Check workflow logs for errors

See [ADVANCED-SECURITY.md](ADVANCED-SECURITY.md) for detailed troubleshooting.
