# Kyverno Policies

This directory contains Kyverno policies for supply chain security and best practices enforcement.

## Policies

### 1. Verify Signed Images (`verify-signed-images.yaml`)

**What it does:**
- Verifies all images from Artifact Registry are signed with Sigstore
- Checks for valid SLSA provenance attestations
- Ensures images were built by GitHub Actions workflows
- Uses Rekor transparency log for verification

**Enforcement:** BLOCK unsigned images

### 2. Security Best Practices (`security-policies.yaml`)

**Includes multiple rules:**

#### Restrict Image Registries
- Only allows images from:
  - Our Artifact Registry (`us-central1-docker.pkg.dev`)
  - Official Docker images for databases

#### Require Non-Root
- All containers must run as non-root user
- Prevents privilege escalation attacks

#### Disallow Privilege Escalation
- Blocks `allowPrivilegeEscalation: true`
- Security best practice

#### Require Resource Limits
- All containers must have CPU and memory limits
- Prevents resource exhaustion

#### Block Latest Tag
- Prevents use of `:latest` tag
- Requires specific tags or digests

## Installation

### Option 1: Install via Ansible (Recommended)

```bash
cd ansible/playbooks
ansible-playbook -i ../inventory/localhost install-kyverno.yml
```

### Option 2: Manual Install

```bash
# Install Kyverno
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.11.0/install.yaml

# Wait for Kyverno to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kyverno -n kyverno --timeout=300s

# Apply policies
kubectl apply -f k8s-manifests/kyverno/
```

## Verify Policies are Working

```bash
# List all policies
kubectl get clusterpolicy

# Check policy status
kubectl get clusterpolicy verify-signed-images -o yaml

# View policy reports
kubectl get policyreport -A
```

## Testing Policies

### Test 1: Try to deploy unsigned image (should FAIL)

```bash
kubectl run test-unsigned --image=nginx:latest -n microservices
# Expected: Error - image not signed
```

### Test 2: Try to deploy image with :latest tag (should FAIL)

```bash
kubectl run test-latest --image=us-central1-docker.pkg.dev/myproject/myrepo/myapp:latest -n microservices
# Expected: Error - :latest tag not allowed
```

### Test 3: Deploy signed image from your workflow (should SUCCEED)

```bash
# This will work because it's signed by GitHub Actions
kubectl apply -f k8s-manifests/microservices/frontend/frontend-deployment.yaml
```

## Troubleshooting

### Policy Not Enforcing

```bash
# Check Kyverno logs
kubectl logs -n kyverno -l app.kubernetes.io/name=kyverno --tail=100

# Check policy status
kubectl describe clusterpolicy verify-signed-images
```

### Image Signature Verification Failing

```bash
# Manually verify image signature
kubectl kyverno verify image \
  us-central1-docker.pkg.dev/PROJECT_ID/REPO/IMAGE:TAG \
  --policy verify-signed-images.yaml
```

### Bypass Policies (Emergency Only)

```yaml
# Add annotation to skip policies (NOT RECOMMENDED)
metadata:
  annotations:
    policies.kyverno.io/exclude: "*"
```

## Policy Modes

Kyverno policies can run in two modes:

1. **Enforce** (current) - Blocks non-compliant resources
2. **Audit** - Allows resources but reports violations

To switch to Audit mode:

```bash
kubectl patch clusterpolicy verify-signed-images \
  --type=merge \
  -p '{"spec":{"validationFailureAction":"Audit"}}'
```

## References

- [Kyverno Documentation](https://kyverno.io/)
- [Sigstore/Cosign](https://docs.sigstore.dev/)
- [SLSA Provenance](https://slsa.dev/provenance/)
- [GitHub Attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds)
