# Security Tools Quick Reference

## Tool Matrix

| Tool | Purpose | When It Runs | Pass/Fail | Output |
|------|---------|--------------|-----------|--------|
| **Semgrep** | SAST code scanning | Every build | Warn | SARIF |
| **Syft** | SBOM generation | Every build | No fail | SPDX/CycloneDX |
| **Grype** | SBOM-based CVE scan | Every build | **Fails on HIGH+** | SARIF |
| **Trivy** | Image CVE scan | Every build | Warn | SARIF |
| **Cosign** | Image signing | After push | No fail | Signature |
| **Kubescape** | K8s security posture | Every build | Warn | SARIF |
| **Checkov** | IaC security | PR + Daily | **Fails on HIGH+** | SARIF |
| **tfsec** | Terraform security | PR + Daily | Warn | SARIF |
| **KubeLinter** | K8s manifest validation | PR + Daily | Warn | SARIF |
| **Hadolint** | Dockerfile linting | PR + Daily | Warn | SARIF |
| **Kyverno** | Runtime policy enforcement | Always (in cluster) | **Blocks pods** | Policy reports |

## Command Reference

### Verify Image Signatures

```bash
# Cosign verification (keyless)
cosign verify \
  us-central1-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG@sha256:DIGEST \
  --certificate-identity-regexp=https://github.com/YOUR_ORG/YOUR_REPO \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com

# GitHub Attestations
gh attestation verify oci://IMAGE:TAG --owner YOUR_ORG
```

### View SBOM

```bash
# From Cosign attestation
cosign verify-attestation IMAGE:TAG@sha256:DIGEST \
  --type spdxjson \
  --certificate-identity-regexp=REPO \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
  | jq -r .payload | base64 -d | jq .

# From workflow artifact
# Download from GitHub Actions UI → Artifacts → *-sbom.spdx.json
cat frontend-sbom.spdx.json | jq .
```

### Check Vulnerabilities

```bash
# Using Grype on SBOM
grype sbom:frontend-sbom.spdx.json

# Using Trivy on image
trivy image IMAGE:TAG --severity HIGH,CRITICAL

# Check GitHub Security tab
https://github.com/YOUR_ORG/YOUR_REPO/security/code-scanning
```

### Local Security Scans

```bash
# Run Semgrep locally
docker run --rm -v "${PWD}:/src" returntocorp/semgrep semgrep \
  --config=p/security-audit --config=p/secrets .

# Generate SBOM locally
syft packages IMAGE:TAG -o spdx-json > sbom.json

# Scan with Grype
grype IMAGE:TAG --fail-on high

# Scan Terraform
checkov -d terraform/ --framework terraform

# Lint Kubernetes manifests
kube-linter lint k8s-manifests/
```

## Security Scan Schedule

| Workflow | Trigger | Frequency |
|----------|---------|-----------|
| **Build & Deploy** | Push to main/develop | Every commit |
| **Security Scan (IaC)** | PR + Push + Schedule | Daily at 2 AM UTC |
| **Dependabot** | Automated | Weekly |
| **Container Scan** | Every build | Per commit |

## Failure Thresholds

### Build-Blocking (CI fails)
- ❌ Grype: HIGH or CRITICAL vulnerabilities
- ❌ Checkov (Terraform): CIS compliance failures

### Non-Blocking (warnings)
- ⚠️ Semgrep: Security issues
- ⚠️ Trivy: Any severity (secondary check)
- ⚠️ Kubescape: All findings
- ⚠️ KubeLinter: All findings
- ⚠️ Hadolint: Dockerfile issues

### Runtime Blocking (Kyverno)
- ❌ Unsigned images
- ❌ Images without valid attestations
- ❌ Privileged containers
- ❌ Host path mounts

## Configuration Files

```
gcp-k8s-microservices/
├── .kube-linter.yaml          # KubeLinter rules
├── .semgrepignore             # Semgrep exclusions (optional)
├── .grype.yaml                # Grype ignore rules (optional)
└── k8s-manifests/kyverno/     # Kyverno policies
    ├── security-policies.yaml
    └── verify-signed-images.yaml
```

## GitHub Security Tab

All scan results appear in: **Security → Code scanning**

Categories:
- `frontend-grype` - Grype scan (frontend)
- `backend-grype` - Grype scan (backend)
- `frontend-trivy` - Trivy scan (frontend)
- `backend-trivy` - Trivy scan (backend)
- `kubescape-frontend` - K8s security (frontend)
- `kubescape-backend` - K8s security (backend)
- `terraform-checkov` - Terraform security
- `kubernetes-kubelinter` - K8s manifest validation

## SBOM Formats

### SPDX (Software Package Data Exchange)
```json
{
  "spdxVersion": "SPDX-2.3",
  "name": "frontend",
  "packages": [
    {
      "name": "express",
      "versionInfo": "4.18.2",
      "licenseConcluded": "MIT"
    }
  ]
}
```

### CycloneDX
```json
{
  "bomFormat": "CycloneDX",
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "licenses": [{"id": "MIT"}]
    }
  ]
}
```

## Emergency Bypass

If security scans are blocking critical deployments:

### Option 1: Temporary Grype Ignore
Create `.grype.yaml`:
```yaml
ignore:
  - vulnerability: CVE-2024-XXXXX
    reason: "Emergency deployment - tracked in JIRA-123"
```

### Option 2: Override via Workflow Dispatch
Modify workflow temporarily:
```yaml
fail-build: false  # Change to false for emergency only
```

### Option 3: Runtime Policy Exception
Add Kyverno exception:
```yaml
apiVersion: kyverno.io/v1
kind: PolicyException
metadata:
  name: emergency-deploy
spec:
  exceptions:
  - policyName: verify-image-signature
    ruleNames:
    - verify-signature
```

**⚠️ Always track exceptions and remediate!**

## Metrics & Reporting

### Weekly Security Report
```bash
# Get all vulnerabilities from last week
gh api \
  /repos/OWNER/REPO/code-scanning/alerts \
  --jq '.[] | select(.created_at > "2024-01-01")'

# Count by severity
gh api /repos/OWNER/REPO/code-scanning/alerts \
  --jq 'group_by(.rule.severity) | map({severity: .[0].rule.severity, count: length})'
```

### SBOM Diff Between Releases
```bash
# Compare two SBOMs
syft diff sbom1.json sbom2.json

# Or use grype
grype sbom:sbom1.json -o json > vulns1.json
grype sbom:sbom2.json -o json > vulns2.json
diff vulns1.json vulns2.json
```

## Integration with Backstage

SBOMs and scan results integrate with Backstage:
- SBOM viewer plugin
- Security posture dashboard
- Vulnerability trends
- Compliance reporting

See: `backstage/README.md`
