# Advanced Security Features

This document describes the cutting-edge security technologies added to the CI/CD pipeline.

## Overview

The pipeline now implements **defense-in-depth** with multiple security layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Source Code (GitHub)                      │
│                           ↓                                  │
│                    [Semgrep SAST]                           │
│                           ↓                                  │
│                    [Build Container]                         │
│                           ↓                                  │
│        [SBOM Generation] → [Syft/Anchore]                   │
│                           ↓                                  │
│    [Vulnerability Scan] → [Grype + Trivy]                   │
│                           ↓                                  │
│         [Sign & Attest] → [Cosign + GitHub]                 │
│                           ↓                                  │
│    [K8s Security Scan] → [Kubescape]                        │
│                           ↓                                  │
│         [Push to Registry] (if all checks pass)             │
│                           ↓                                  │
│    [Runtime Enforcement] → [Kyverno]                        │
└─────────────────────────────────────────────────────────────┘
```

## New Security Tools

### 1. Software Bill of Materials (SBOM)

**Tools:** Syft (Anchore)

**What it does:**
- Generates comprehensive inventory of all software components
- Tracks dependencies, versions, and licenses
- Creates both SPDX and CycloneDX formats
- Enables vulnerability tracking across the supply chain

**Workflow integration:**
```yaml
- name: Generate SBOM for Frontend (Syft)
  uses: anchore/sbom-action@v0
  with:
    image: ${{ image_tag }}
    format: spdx-json
    output-file: frontend-sbom.spdx.json
```

**Verification:**
```bash
# Download SBOM from workflow artifacts
# or retrieve from Cosign attestation:
cosign verify-attestation IMAGE_NAME \
  --type spdxjson \
  --certificate-identity-regexp=REPO \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

**Benefits:**
- ✅ Complete transparency of dependencies
- ✅ License compliance tracking
- ✅ Faster vulnerability assessment
- ✅ Regulatory compliance (SBOM mandates)

---

### 2. Advanced Vulnerability Scanning

**Tools:** Grype (primary), Trivy (secondary)

**Why two scanners?**
- **Grype**: SBOM-based scanning (faster, more accurate)
- **Trivy**: Direct image scanning (comparison/validation)

**Workflow integration:**
```yaml
- name: Scan with Grype (SBOM-based)
  uses: anchore/scan-action@v3
  with:
    sbom: frontend-sbom.spdx.json
    fail-build: true
    severity-cutoff: high
```

**Key improvements:**
- **Faster scans**: SBOM-based scanning is 3-5x faster
- **Better accuracy**: Reduced false positives
- **Historical tracking**: Compare SBOMs over time
- **License validation**: Automatic license compliance

---

### 3. Enhanced Image Signing with Cosign

**Tool:** Cosign (Sigstore)

**What's new:**
- **Keyless signing**: Uses OIDC tokens (no key management)
- **Transparency log**: All signatures recorded in Rekor
- **SBOM attestation**: Attach SBOMs directly to images
- **Multi-signature**: Both Cosign + GitHub Attestations

**Workflow integration:**
```yaml
- name: Sign image with Cosign
  run: |
    cosign sign --yes IMAGE@DIGEST
  env:
    COSIGN_EXPERIMENTAL: "true"

- name: Attest SBOM
  run: |
    cosign attest --yes \
      --predicate sbom.json \
      --type spdxjson \
      IMAGE@DIGEST
```

**Verification:**
```bash
# Verify signature
cosign verify IMAGE_NAME \
  --certificate-identity-regexp=REPO \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com

# Verify SBOM attestation
cosign verify-attestation IMAGE_NAME \
  --type spdxjson \
  --certificate-identity-regexp=REPO \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

**Benefits:**
- ✅ No secret keys to manage
- ✅ Publicly verifiable signatures
- ✅ Immutable transparency log
- ✅ SBOMs attached to images (not separate files)

---

### 4. Code-level Security with Semgrep

**Tool:** Semgrep (AI-powered SAST)

**What it scans:**
- Security vulnerabilities (OWASP Top 10)
- Hardcoded secrets and credentials
- Docker and Kubernetes misconfigurations
- Language-specific security issues

**Workflow integration:**
```yaml
- name: Run Semgrep Security Scan
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/secrets
      p/owasp-top-ten
      p/docker
      p/kubernetes
```

**Rulesets used:**
- `p/security-audit`: 500+ security rules
- `p/secrets`: API keys, passwords, tokens
- `p/owasp-top-ten`: OWASP vulnerabilities
- `p/docker`: Dockerfile best practices
- `p/kubernetes`: K8s security patterns

---

### 5. Kubernetes Security Posture

**Tools:** Kubescape, KubeLinter, Polaris

#### Kubescape
- **Frameworks**: NSA, CISA, MITRE ATT&CK
- **Focus**: Runtime security and compliance
- **Integration**: Both build-time and runtime

```yaml
- name: Run Kubescape
  uses: kubescape/github-action@main
  with:
    frameworks: |
      nsa,mitre,armobest
```

#### KubeLinter
- **Purpose**: Manifest validation
- **Checks**: 30+ production-readiness checks
- **Custom rules**: Team-specific policies

```yaml
- name: KubeLinter scan
  uses: stackrox/kube-linter-action@v1
  with:
    directory: k8s-manifests/
    config: .kube-linter.yaml
```

---

### 6. Infrastructure as Code (IaC) Security

**Tools:** Checkov, tfsec, Terrascan

**New workflow:** `.github/workflows/security-scan.yml`

**What it scans:**
- Terraform configurations
- GCP resource security
- Kubernetes manifests
- Docker configurations

**Compliance checks:**
- CIS GCP Benchmark
- CIS Kubernetes Benchmark
- PCI-DSS, HIPAA, SOC2
- NIST frameworks

**Workflow:**
```yaml
- name: Run Checkov on Terraform
  uses: bridgecrewio/checkov-action@v12
  with:
    directory: terraform/
    framework: terraform
    check: CIS_GCP,CIS_KUBERNETES_V1_23
```

---

## Security Layers Comparison

| Layer | Previous | Now Enhanced |
|-------|----------|--------------|
| **Source Code** | Dependabot | + Semgrep SAST |
| **Dependencies** | Trivy CVE | + Grype SBOM-based |
| **Containers** | Basic scan | + SBOM + Cosign |
| **IaC** | Manual review | + Checkov + tfsec |
| **K8s Manifests** | Kyverno only | + Kubescape + KubeLinter |
| **Dockerfiles** | None | + Hadolint |
| **Runtime** | Kyverno | Enhanced policies |

---

## SLSA Compliance

**Previous:** SLSA Level 2
**Now:** SLSA Level 2+ (enhanced)

| SLSA Requirement | Implementation |
|------------------|----------------|
| **Source integrity** | GitHub-hosted, signed commits |
| **Build service** | GitHub Actions (Level 3 builder) |
| **Provenance** | GitHub Attestations + Cosign |
| **Hermetic builds** | Docker BuildKit with cache |
| **Reproducible** | Pinned dependencies, SBOMs |
| **Signed artifacts** | Cosign + GitHub Attestations |

---

## Workflow Artifacts

Every build produces:

1. **SBOMs** (90-day retention)
   - `frontend-sbom.spdx.json`
   - `frontend-sbom.cyclonedx.json`
   - `backend-sbom.spdx.json`
   - `backend-sbom.cyclonedx.json`

2. **Scan Results** (GitHub Security tab)
   - Grype SARIF reports
   - Trivy SARIF reports
   - Kubescape SARIF reports
   - Semgrep findings

3. **Signatures & Attestations**
   - Cosign signatures (in Rekor)
   - GitHub Attestations
   - SBOM attestations

---

## Compliance Standards

The pipeline now meets:

- ✅ **SLSA Level 2+** - Build provenance and signed artifacts
- ✅ **NIST SSDF 1.1** - Secure Software Development Framework
- ✅ **NSA/CISA K8s Hardening** - Kubernetes security posture
- ✅ **OWASP Top 10** - Application security risks
- ✅ **CIS Benchmarks** - GCP, Kubernetes, Docker
- ✅ **SBOM Requirements** - Executive Order 14028
- ✅ **Supply Chain Levels** - Transparency and verification

---

## Cost Analysis

### Additional CI/CD Time

| Stage | Previous | Enhanced | Difference |
|-------|----------|----------|------------|
| Code scan | 0s | +30s | Semgrep |
| SBOM generation | 0s | +20s | Syft |
| Vulnerability scan | 45s | 60s | +Grype |
| Signing | 10s | 25s | +Cosign |
| K8s scan | 0s | +30s | Kubescape |
| **Total per build** | ~5 min | ~7 min | +2 min |

### Storage Costs

- SBOMs: ~500KB per service = ~1MB total
- SARIF reports: ~2MB per build
- 90-day retention: ~5.5GB (negligible cost)

---

## Future Enhancements (Roadmap)

Based on the industry trends document, consider adding:

### Short-term (Quick Wins)
- [ ] **Kubecost** - Cost monitoring and optimization
- [ ] **Karpenter** - Intelligent node provisioning
- [ ] **Goldilocks** - Right-sizing recommendations

### Medium-term (High Impact)
- [ ] **Flagger** - Metrics-based progressive delivery
- [ ] **Loft** - Ephemeral PR environments
- [ ] **Pyroscope** - Continuous profiling

### Long-term (Strategic)
- [ ] **Crossplane** - GitOps for cloud resources
- [ ] **Backstage** - Enhanced developer portal
- [ ] **Chaos Mesh** - Resilience testing

---

## Troubleshooting

### SBOM Generation Fails

**Symptom:** `anchore/sbom-action` fails
**Solution:**
```yaml
# Add image pull authentication
- name: Login to registry
  run: |
    echo ${{ secrets.GCP_SA_KEY }} | docker login -u _json_key --password-stdin $REGISTRY
```

### Cosign Signing Fails

**Symptom:** `cosign sign` returns `401 Unauthorized`
**Solution:** Ensure `id-token: write` permission is set in workflow

### Grype False Positives

**Symptom:** Build fails on unfixed vulnerabilities
**Solution:** Create `.grype.yaml` with ignore rules:
```yaml
ignore:
  - vulnerability: CVE-2024-XXXXX
    reason: "No fix available, false positive"
```

---

## References

- [SLSA Framework](https://slsa.dev/)
- [Sigstore Documentation](https://docs.sigstore.dev/)
- [SBOM Guide (CISA)](https://www.cisa.gov/sbom)
- [Kubescape](https://kubescape.io/)
- [Semgrep Rules](https://semgrep.dev/explore)
- [Anchore Grype](https://github.com/anchore/grype)
