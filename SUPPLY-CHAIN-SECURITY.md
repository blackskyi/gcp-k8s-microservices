# 🔐 Supply Chain Security Implementation

Complete supply chain security for your microservices deployment using GitHub-native tools and Kyverno.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's Implemented](#whats-implemented)
3. [How It Works](#how-it-works)
4. [Setup Instructions](#setup-instructions)
5. [Verify It's Working](#verify-its-working)
6. [How to Use](#how-to-use)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project implements **complete supply chain security** using:

- ✅ **Dependency Scanning** (Dependabot)
- ✅ **Vulnerability Scanning** (Trivy)
- ✅ **Image Signing** (GitHub Attestations + Sigstore)
- ✅ **SLSA Provenance** (Build attestations)
- ✅ **Policy Enforcement** (Kyverno)
- ✅ **Security Reporting** (GitHub Security tab)

**Cost:** $0 (all tools are free!)

---

## 🛡️ What's Implemented

### 1. Dependabot - Dependency Updates

**File:** `.github/dependabot.yml`

**What it does:**
- Automatically scans `package.json`, `requirements.txt`, Dockerfiles
- Opens PRs for vulnerable dependencies
- Runs weekly

**Covers:**
- Frontend npm packages
- Backend pip packages
- Docker base images
- GitHub Actions versions
- Terraform providers

**Example:**
```
Dependabot finds: Flask 2.0.0 has CVE-2023-1234
→ Opens PR: "Bump Flask from 2.0.0 to 2.3.0"
```

---

### 2. Trivy - Vulnerability Scanning

**Location:** `.github/workflows/3-build-deploy.yml` (lines 91-105, 138-152)

**What it does:**
- Scans Docker images **BEFORE** pushing to registry
- Checks for CRITICAL and HIGH vulnerabilities
- **Blocks deployment** if vulnerabilities found
- Uploads results to GitHub Security tab

**Scanning happens:**
```
Build image locally
    ↓
Trivy scans image
    ↓
✅ Clean? → Push to registry
❌ Vulnerabilities? → STOP (don't push)
```

**Security reports visible at:**
`https://github.com/YOUR_USERNAME/gcp-k8s-microservices/security/code-scanning`

---

### 3. GitHub Attestations - Signing & Provenance

**Location:** `.github/workflows/3-build-deploy.yml` (lines 113-119, 160-166)

**What it does:**
- Signs every image with Sigstore
- Generates SLSA Build Provenance
- Stores attestations in GitHub
- Publicly verifiable

**For each image, you get:**
- ✅ Who built it (GitHub Actions)
- ✅ When it was built (timestamp)
- ✅ From what commit (Git SHA)
- ✅ What workflow built it
- ✅ Cryptographic signature

**Verification:**
```bash
gh attestation verify oci://IMAGE_URL --owner USERNAME
```

---

### 4. Kyverno - Policy Enforcement

**Location:** `k8s-manifests/kyverno/`

**What it does:**
- Enforces policies at deployment time
- Only allows signed images
- Blocks unsigned/unverified images
- Enforces security best practices

**Policies:**

#### Policy 1: Verify Signed Images
```yaml
# Only allows images signed by GitHub Actions
- Checks Sigstore signature
- Verifies SLSA provenance
- Uses Rekor transparency log
```

#### Policy 2: Restrict Image Registries
```yaml
# Only allows images from:
- us-central1-docker.pkg.dev/* (our registry)
- docker.io/library/* (official images)
```

#### Policy 3: Security Best Practices
```yaml
- No root containers
- No privilege escalation
- Must have resource limits
- No :latest tags
```

---

## 🔄 How It Works

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: DEPENDENCY MANAGEMENT (Continuous)                │
├─────────────────────────────────────────────────────────────┤
│ Dependabot                                                  │
│ • Scans dependencies weekly                                 │
│ • Opens PRs for updates                                     │
│ • You review & merge                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Code changes
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: BUILD & SCAN (On every push)                      │
├─────────────────────────────────────────────────────────────┤
│ 1. git push (your code)                                     │
│    ↓                                                        │
│ 2. GitHub Actions triggered                                 │
│    ↓                                                        │
│ 3. Build Docker images (locally on runner)                 │
│    ↓                                                        │
│ 4. Trivy scans images                                       │
│    • Checks for vulnerabilities                             │
│    • CRITICAL/HIGH → STOP ❌                                │
│    • Clean → Continue ✅                                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ If scan passes
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: PUSH & SIGN (Only if scan passed)                 │
├─────────────────────────────────────────────────────────────┤
│ 5. Push image to Artifact Registry                         │
│    ↓                                                        │
│ 6. GitHub Attestations                                      │
│    • Sign with Sigstore                                     │
│    • Generate SLSA provenance                               │
│    • Store attestation in GitHub                            │
│    • Logged in Rekor (transparency)                         │
│    ↓                                                        │
│ 7. Update K8s manifests with image tag                     │
│    ↓                                                        │
│ 8. Commit & push manifest updates                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ ArgoCD detects change
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: DEPLOYMENT (Kubernetes)                           │
├─────────────────────────────────────────────────────────────┤
│ 9. ArgoCD attempts deployment                              │
│    ↓                                                        │
│ 10. Kyverno intercepts (Admission Controller)              │
│     ├─ Verify image signature ✅                            │
│     ├─ Check SLSA provenance ✅                             │
│     ├─ Verify from GitHub Actions ✅                        │
│     ├─ Check security policies ✅                           │
│     │                                                       │
│     ├─ All checks pass? → ALLOW deployment ✅               │
│     └─ Any check fails? → BLOCK deployment ❌               │
│    ↓                                                        │
│ 11. Pod created (only if all checks passed)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Step 1: Install Kyverno

Run the Kyverno installation playbook:

```bash
# From project root
cd ansible/playbooks

# Set environment variables
export CLUSTER_NAME="microservices-cluster-dev"
export GCP_PROJECT="your-project-id"
export GCP_ZONE="us-central1-a"

# Run playbook
ansible-playbook -i ../inventory/localhost install-kyverno.yml
```

**What this does:**
- Installs Kyverno v1.11.4
- Applies all security policies
- Configures signature verification

**Verify installation:**
```bash
# Check Kyverno pods
kubectl get pods -n kyverno

# Check policies
kubectl get clusterpolicy

# Should see:
# - verify-signed-images
# - security-best-practices
# - block-latest-tag
```

---

### Step 2: Enable Dependabot (Already Done!)

Dependabot is automatically enabled via `.github/dependabot.yml`.

**Check it's working:**
1. Go to your GitHub repo
2. Click "Security" → "Dependabot"
3. You should see it checking for updates

**When Dependabot finds issues:**
- It creates a PR automatically
- Review the PR
- Merge if safe
- Workflow rebuilds with updated dependencies

---

### Step 3: Verify Trivy Scanning Works

Next time you run **Workflow 3 (Build and Deploy)**:

1. Check workflow logs:
   - Look for "Scan Frontend image with Trivy"
   - Look for "Scan Backend image with Trivy"

2. Check GitHub Security tab:
   - Go to: `https://github.com/YOUR_USERNAME/gcp-k8s-microservices/security/code-scanning`
   - You should see Trivy scan results

**Test it:** Add a vulnerable package and see it get blocked!

---

### Step 4: Verify Attestations Work

After a successful build:

```bash
# Install GitHub CLI if needed
brew install gh

# Login
gh auth login

# Verify frontend image
gh attestation verify oci://us-central1-docker.pkg.dev/PROJECT_ID/REPO/frontend:COMMIT_SHA \
  --owner YOUR_USERNAME

# Verify backend image
gh attestation verify oci://us-central1-docker.pkg.dev/PROJECT_ID/REPO/backend:COMMIT_SHA \
  --owner YOUR_USERNAME
```

**Expected output:**
```
Loaded digest sha256:abc123... for oci://...
Loaded 1 attestation from GitHub API
✓ Verification succeeded!

sha256:abc123... was attested by:
REPO: blackskyi/gcp-k8s-microservices
PREDICATE_TYPE: https://slsa.dev/provenance/v1
WORKFLOW: .github/workflows/3-build-deploy.yml
```

---

## ✅ Verify It's Working

### Test 1: Try to Deploy Unsigned Image (Should FAIL)

```bash
# This should be BLOCKED by Kyverno
kubectl run test-unsigned \
  --image=nginx:latest \
  -n microservices

# Expected error:
# Error: admission webhook denied the request
# Image signature verification failed
```

### Test 2: Deploy Your Signed Image (Should SUCCEED)

```bash
# This should work (it's signed by your workflow)
kubectl apply -f k8s-manifests/microservices/frontend/frontend-deployment.yaml

# Check it deployed
kubectl get pods -n microservices
```

### Test 3: Check Policy Reports

```bash
# View policy violations
kubectl get policyreport -A

# View specific policy
kubectl describe clusterpolicy verify-signed-images
```

### Test 4: Check Trivy Results in GitHub

1. Go to: `https://github.com/YOUR_USERNAME/gcp-k8s-microservices/security`
2. Click "Code scanning"
3. You should see Trivy results for frontend and backend

---

## 📖 How to Use

### When You Update Dependencies

1. Dependabot opens a PR
2. Review changes in PR
3. Check if tests pass
4. Merge PR
5. Workflow automatically:
   - Builds new images
   - Scans for vulnerabilities
   - Signs images
   - Deploys to cluster

### When You Change Application Code

1. Make changes to `apps/frontend` or `apps/backend`
2. `git commit && git push`
3. Workflow automatically:
   - Builds images
   - Scans with Trivy
   - Pushes if clean
   - Signs with attestations
   - Updates manifests
   - ArgoCD deploys (verified by Kyverno)

### When Vulnerability is Found

**Scenario: Trivy finds CRITICAL vulnerability**

**What happens:**
```
Build succeeds
↓
Trivy scans
↓
Found: CVE-2024-1234 (CRITICAL)
↓
Workflow FAILS ❌
Image NOT pushed to registry
```

**How to fix:**
1. Check workflow logs for CVE details
2. Update the vulnerable package
3. Push fix
4. Workflow retries automatically

---

## 🐛 Troubleshooting

### Issue: Workflow Fails at Trivy Scan

**Error:**
```
Scan Frontend image with Trivy failed
exit code: 1
```

**Cause:** Vulnerabilities found

**Solution:**
1. Check workflow logs for CVE numbers
2. Update vulnerable packages:
   ```bash
   # Frontend
   cd apps/frontend
   npm audit fix

   # Backend
   cd apps/backend
   pip install --upgrade PACKAGE_NAME
   ```
3. Commit and push

---

### Issue: Attestation Verification Fails

**Error:**
```
gh attestation verify: no attestations found
```

**Cause:** Image was built before attestations were implemented

**Solution:**
1. Run **Workflow 3** again to rebuild images
2. New images will have attestations

---

### Issue: Kyverno Blocks Legitimate Image

**Error:**
```
admission webhook denied: image signature verification failed
```

**Cause:** Image not signed or wrong registry

**Check:**
```bash
# Verify image is from correct registry
kubectl get deployment frontend -n microservices -o yaml | grep image:

# Should be: us-central1-docker.pkg.dev/...
```

**Solution:**
1. Ensure image was built by Workflow 3
2. Check image is in Artifact Registry
3. Verify attestation exists:
   ```bash
   gh attestation verify oci://IMAGE_URL --owner USERNAME
   ```

---

### Issue: Want to Temporarily Disable Policies

**For testing only:**

```bash
# Switch to Audit mode (allows but reports violations)
kubectl patch clusterpolicy verify-signed-images \
  --type=merge \
  -p '{"spec":{"validationFailureAction":"Audit"}}'

# Switch back to Enforce mode
kubectl patch clusterpolicy verify-signed-images \
  --type=merge \
  -p '{"spec":{"validationFailureAction":"Enforce"}}'
```

---

## 📊 Monitoring & Reporting

### View Vulnerability Scan Results

**GitHub Security Tab:**
```
https://github.com/YOUR_USERNAME/gcp-k8s-microservices/security/code-scanning
```

Shows:
- All Trivy scan results
- Vulnerabilities by severity
- Affected files
- Remediation advice

### View Policy Reports

```bash
# All policy violations
kubectl get policyreport -A

# Specific namespace
kubectl get policyreport -n microservices

# Detailed report
kubectl describe policyreport -n microservices
```

### View Dependabot Alerts

```
https://github.com/YOUR_USERNAME/gcp-k8s-microservices/security/dependabot
```

Shows:
- Vulnerable dependencies
- Severity
- Available fixes
- Auto-generated PRs

---

## 🎓 What You've Achieved

✅ **SLSA Level 2 Compliance** (working towards Level 3)
✅ **Supply chain visibility** (know what's in your images)
✅ **Vulnerability management** (automatic scanning & updates)
✅ **Tamper-proof builds** (signed attestations)
✅ **Policy enforcement** (only verified images run)
✅ **Transparency** (Rekor public log)
✅ **Security reporting** (GitHub Security tab)

---

## 🔗 References

- [GitHub Attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds)
- [SLSA Framework](https://slsa.dev/)
- [Sigstore](https://www.sigstore.dev/)
- [Trivy](https://trivy.dev/)
- [Kyverno](https://kyverno.io/)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

---

## 💡 Next Steps

Want to go further?

1. **Add SBOM generation**
   ```yaml
   - uses: actions/attest-sbom@v1
   ```

2. **Add CodeQL for SAST**
   ```yaml
   - uses: github/codeql-action/analyze@v3
   ```

3. **Enable Binary Authorization** (GCP)
   - Requires signed images (already have!)
   - GCP-level enforcement

4. **Add runtime security monitoring**
   - Falco for runtime detection
   - Sysdig for threat detection

---

**You now have production-grade supply chain security! 🎉**
