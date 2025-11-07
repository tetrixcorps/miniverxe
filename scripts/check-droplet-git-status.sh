#!/bin/bash

# Script to check droplet git repository status and compare with local

DROPLET_IP="167.99.87.123"
DROPLET_PATH="/root/tetrix"

echo "=========================================="
echo "DROPLET GIT REPOSITORY STATUS CHECK"
echo "=========================================="
echo ""

echo "=== Connecting to droplet ==="
ssh root@${DROPLET_IP} << 'EOF'
cd /root/tetrix

echo "=== DROPLET GIT STATUS ==="
git status --short
echo ""

echo "=== DROPLET CURRENT BRANCH ==="
git branch --show-current
echo ""

echo "=== DROPLET LAST 5 COMMITS ==="
git log --oneline -5
echo ""

echo "=== DROPLET REMOTE INFO ==="
git remote -v
echo ""

echo "=== CHECKING RECENT FILES ==="
echo "Backend 2FA route:"
ls -la backend/src/routes/enterprise2FA.ts 2>/dev/null || echo "  ❌ File not found"
echo ""

echo "Contact.astro (SSE fix):"
ls -la src/pages/contact.astro 2>/dev/null || echo "  ❌ File not found"
echo ""

echo "SSE stream endpoint:"
ls -la src/pages/api/v1/joromi/sessions/*/stream.ts 2>/dev/null || echo "  ❌ File not found"
echo ""

echo "Backend server with 2FA routes:"
grep -n "api/v2/2fa" backend/src/server-with-db.ts 2>/dev/null || echo "  ❌ Route not found"
echo ""

EOF

echo ""
echo "=========================================="
echo "LOCAL GIT REPOSITORY STATUS"
echo "=========================================="
echo ""

cd /home/diegomartinez/Desktop/tetrix

echo "=== LOCAL GIT STATUS ==="
git status --short
echo ""

echo "=== LOCAL CURRENT BRANCH ==="
git branch --show-current
echo ""

echo "=== LOCAL LAST 5 COMMITS ==="
git log --oneline -5
echo ""

echo "=== LOCAL REMOTE INFO ==="
git remote -v
echo ""

echo "=== CHECKING RECENT FILES LOCALLY ==="
echo "Backend 2FA route:"
ls -la backend/src/routes/enterprise2FA.ts 2>/dev/null && echo "  ✅ File exists"
echo ""

echo "Contact.astro (SSE fix):"
ls -la src/pages/contact.astro 2>/dev/null && echo "  ✅ File exists"
echo ""

echo "SSE stream endpoint:"
ls -la src/pages/api/v1/joromi/sessions/*/stream.ts 2>/dev/null && echo "  ✅ File exists"
echo ""

echo "Backend server with 2FA routes:"
grep -n "api/v2/2fa" backend/src/server-with-db.ts 2>/dev/null && echo "  ✅ Route configured"
echo ""

echo "=========================================="
echo "COMPARISON SUMMARY"
echo "=========================================="
echo ""

# Get commit hashes
LOCAL_COMMIT=$(git rev-parse HEAD)
DROPLET_COMMIT=$(ssh root@${DROPLET_IP} "cd ${DROPLET_PATH} && git rev-parse HEAD 2>/dev/null" || echo "unknown")

echo "Local HEAD:  ${LOCAL_COMMIT:0:8}"
echo "Droplet HEAD: ${DROPLET_COMMIT:0:8}"
echo ""

if [ "$LOCAL_COMMIT" = "$DROPLET_COMMIT" ]; then
    echo "✅ Droplet and local are at the same commit"
else
    echo "⚠️  Droplet and local are at different commits"
    echo ""
    echo "Commits in local but not on droplet:"
    ssh root@${DROPLET_IP} "cd ${DROPLET_PATH} && git log --oneline ${DROPLET_COMMIT}..${LOCAL_COMMIT} 2>/dev/null" || echo "  (Could not determine)"
fi

echo ""
echo "=========================================="

