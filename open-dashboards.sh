#!/bin/bash

# Quick Dashboard Access Script
# Opens all security and monitoring dashboards

set -e

echo "🎯 Opening Security Dashboards..."
echo ""

# Get repository URL
REPO_URL=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')

# GitHub Security Tab
echo "1️⃣  Opening GitHub Security Tab..."
open "https://github.com/${REPO_URL}/security/code-scanning"
sleep 2

# GitHub Actions
echo "2️⃣  Opening GitHub Actions..."
open "https://github.com/${REPO_URL}/actions"
sleep 2

# Check if Backstage is configured
if [ -f "backstage/.env" ]; then
  echo "3️⃣  Starting Backstage..."

  # Check if already running
  if docker ps | grep -q backstage; then
    echo "   ✅ Backstage already running"
    open http://localhost:3000
  else
    echo "   Starting Backstage containers..."
    cd backstage
    docker-compose up -d
    cd ..

    echo "   ⏳ Waiting 30s for Backstage to start..."
    sleep 30

    open http://localhost:3000
  fi
else
  echo "3️⃣  ⚠️  Backstage not configured"
  echo "   To set up Backstage:"
  echo "   1. cd backstage"
  echo "   2. cp .env.example .env"
  echo "   3. Edit .env and add your GitHub token"
  echo "   4. docker-compose up -d"
fi

echo ""
echo "✅ All dashboards opened!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Dashboard Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. GitHub Security Tab"
echo "   → All security findings from 7 tools"
echo "   → Filter by severity, tool, status"
echo "   🔗 https://github.com/${REPO_URL}/security/code-scanning"
echo ""
echo "2. GitHub Actions"
echo "   → Workflow run status"
echo "   → Download SBOM artifacts"
echo "   🔗 https://github.com/${REPO_URL}/actions"
echo ""
echo "3. Backstage (if configured)"
echo "   → Service catalog overview"
echo "   → Security posture per service"
echo "   🔗 http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For more dashboards and details, see:"
echo "   → SECURITY-DASHBOARD-GUIDE.md"
echo ""
echo "🔧 Other available dashboards:"
echo "   • ArgoCD: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   • K8s Dashboard: kubectl proxy (then visit localhost:8001)"
echo "   • GCP Artifacts: https://console.cloud.google.com/artifacts"
echo ""
