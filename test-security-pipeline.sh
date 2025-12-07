#!/bin/bash

# Test Security Pipeline
# This script helps you verify all security features are working

set -e

echo "🔒 Security Pipeline Test Script"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f ".github/workflows/3-build-deploy.yml" ]; then
    echo -e "${RED}❌ Error: Run this script from the repository root${NC}"
    exit 1
fi

echo "Select what you want to test:"
echo ""
echo "1. Trigger a test build (push a commit)"
echo "2. View latest workflow run in browser"
echo "3. Download latest SBOMs"
echo "4. Verify Cosign signatures (requires image details)"
echo "5. Start Backstage locally"
echo "6. View GitHub Security tab"
echo "7. Run local security scans"
echo "8. All of the above"
echo ""
read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        echo ""
        echo "📝 Creating test commit..."
        echo "# Security pipeline test - $(date)" >> SECURITY-TEST.md
        git add SECURITY-TEST.md
        git commit -m "test: Security pipeline verification $(date +%Y%m%d-%H%M%S)"

        read -p "Push to origin/main? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            git push origin main
            echo ""
            echo -e "${GREEN}✅ Commit pushed! Workflow should start in a few seconds.${NC}"
            echo ""
            echo "View the workflow at:"
            echo "https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
        fi
        ;;

    2)
        echo ""
        echo "🌐 Opening GitHub Actions in browser..."
        REPO_URL=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
        open "https://github.com/${REPO_URL}/actions"
        ;;

    3)
        echo ""
        echo "📥 To download SBOMs:"
        echo "1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
        echo "2. Click on the latest 'Build and Deploy' workflow run"
        echo "3. Scroll to bottom → 'Artifacts' section"
        echo "4. Download 'frontend-sbom' and 'backend-sbom'"
        echo ""
        echo "Or use GitHub CLI:"
        echo "gh run download --repo $(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/') --name frontend-sbom"
        echo "gh run download --repo $(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/') --name backend-sbom"
        ;;

    4)
        echo ""
        echo "🔐 Cosign Signature Verification"
        echo ""
        read -p "Enter image URL (with digest): " IMAGE_URL
        read -p "Enter repository (e.g., user/repo): " REPO

        echo ""
        echo "Verifying signature..."
        cosign verify "$IMAGE_URL" \
            --certificate-identity-regexp="https://github.com/${REPO}" \
            --certificate-oidc-issuer=https://token.actions.githubusercontent.com

        echo ""
        echo -e "${GREEN}✅ Signature verification complete!${NC}"

        read -p "Verify SBOM attestation too? (y/n): " verify_sbom
        if [ "$verify_sbom" = "y" ]; then
            echo ""
            echo "Verifying and extracting SBOM..."
            cosign verify-attestation "$IMAGE_URL" \
                --type spdxjson \
                --certificate-identity-regexp="https://github.com/${REPO}" \
                --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
                | jq -r .payload | base64 -d | jq . > verified-sbom.json

            echo ""
            echo -e "${GREEN}✅ SBOM extracted to verified-sbom.json${NC}"
            echo ""
            echo "SBOM summary:"
            echo "Total packages: $(cat verified-sbom.json | jq '.packages | length')"
            echo ""
            cat verified-sbom.json | jq '.packages[0:5] | .[] | {name, version}'
            echo "... (showing first 5 packages)"
        fi
        ;;

    5)
        echo ""
        echo "🎨 Starting Backstage..."
        cd backstage

        if [ ! -f .env ]; then
            echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
            cp .env.example .env
            echo ""
            echo "Please edit backstage/.env and add your GitHub token:"
            echo "  GITHUB_TOKEN=ghp_your_token_here"
            echo ""
            read -p "Press Enter when ready to continue..."
        fi

        echo "Starting Backstage with Docker Compose..."
        docker-compose up -d

        echo ""
        echo -e "${GREEN}✅ Backstage starting...${NC}"
        echo ""
        echo "Wait 30 seconds, then visit: http://localhost:3000"
        echo ""
        echo "To stop: cd backstage && docker-compose down"
        ;;

    6)
        echo ""
        echo "🔍 Opening GitHub Security tab..."
        REPO_URL=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
        open "https://github.com/${REPO_URL}/security/code-scanning"
        ;;

    7)
        echo ""
        echo "🔬 Running Local Security Scans"
        echo ""

        # Check if tools are installed
        echo "Checking installed tools..."

        command -v semgrep >/dev/null 2>&1 && SEMGREP_INSTALLED=1 || SEMGREP_INSTALLED=0
        command -v grype >/dev/null 2>&1 && GRYPE_INSTALLED=1 || GRYPE_INSTALLED=0
        command -v trivy >/dev/null 2>&1 && TRIVY_INSTALLED=1 || TRIVY_INSTALLED=0
        command -v checkov >/dev/null 2>&1 && CHECKOV_INSTALLED=1 || CHECKOV_INSTALLED=0
        command -v kube-linter >/dev/null 2>&1 && KUBELINTER_INSTALLED=1 || KUBELINTER_INSTALLED=0

        echo ""
        echo "Tool Status:"
        [ $SEMGREP_INSTALLED -eq 1 ] && echo -e "${GREEN}✅ Semgrep${NC}" || echo -e "${YELLOW}⚠️  Semgrep (install: pip install semgrep)${NC}"
        [ $GRYPE_INSTALLED -eq 1 ] && echo -e "${GREEN}✅ Grype${NC}" || echo -e "${YELLOW}⚠️  Grype (install: brew install grype)${NC}"
        [ $TRIVY_INSTALLED -eq 1 ] && echo -e "${GREEN}✅ Trivy${NC}" || echo -e "${YELLOW}⚠️  Trivy (install: brew install trivy)${NC}"
        [ $CHECKOV_INSTALLED -eq 1 ] && echo -e "${GREEN}✅ Checkov${NC}" || echo -e "${YELLOW}⚠️  Checkov (install: pip install checkov)${NC}"
        [ $KUBELINTER_INSTALLED -eq 1 ] && echo -e "${GREEN}✅ KubeLinter${NC}" || echo -e "${YELLOW}⚠️  KubeLinter (install: brew install kube-linter)${NC}"

        echo ""
        read -p "Run scans with available tools? (y/n): " run_scans

        if [ "$run_scans" = "y" ]; then
            if [ $CHECKOV_INSTALLED -eq 1 ]; then
                echo ""
                echo "🔍 Running Checkov on Terraform..."
                checkov -d terraform/ --quiet || true
            fi

            if [ $KUBELINTER_INSTALLED -eq 1 ]; then
                echo ""
                echo "🔍 Running KubeLinter on K8s manifests..."
                kube-linter lint k8s-manifests/ || true
            fi

            if [ $SEMGREP_INSTALLED -eq 1 ]; then
                echo ""
                echo "🔍 Running Semgrep on source code..."
                semgrep --config=p/security-audit apps/ --quiet || true
            fi
        fi
        ;;

    8)
        echo ""
        echo "🚀 Running All Tests..."
        echo ""

        # Test 1: Create commit
        echo "1️⃣ Creating test commit..."
        echo "# Security pipeline test - $(date)" >> SECURITY-TEST.md
        git add SECURITY-TEST.md
        git commit -m "test: Full security pipeline verification $(date +%Y%m%d-%H%M%S)"
        git push origin main
        echo -e "${GREEN}✅ Commit pushed${NC}"

        # Test 2: Open browser
        echo ""
        echo "2️⃣ Opening GitHub Actions..."
        REPO_URL=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
        open "https://github.com/${REPO_URL}/actions"
        sleep 2

        # Test 3: Open Security tab
        echo ""
        echo "3️⃣ Opening GitHub Security tab..."
        open "https://github.com/${REPO_URL}/security/code-scanning"
        sleep 2

        # Test 4: Start Backstage
        echo ""
        echo "4️⃣ Starting Backstage..."
        cd backstage
        if [ -f .env ]; then
            docker-compose up -d
            echo -e "${GREEN}✅ Backstage started${NC}"
            echo "Visit: http://localhost:3000"
        else
            echo -e "${YELLOW}⚠️  Please configure backstage/.env first${NC}"
        fi
        cd ..

        echo ""
        echo -e "${GREEN}🎉 All tests initiated!${NC}"
        echo ""
        echo "📋 Next steps:"
        echo "1. Watch the workflow run in the browser"
        echo "2. When complete, check the workflow summary"
        echo "3. Review findings in Security tab"
        echo "4. Download SBOM artifacts from workflow"
        echo "5. Visit Backstage at http://localhost:3000"
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo "📚 For more information, see:"
echo "  - HOW-TO-SEE-SECURITY-IN-ACTION.md"
echo "  - ADVANCED-SECURITY.md"
echo "  - SECURITY-TOOLS-REFERENCE.md"
