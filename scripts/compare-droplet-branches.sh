#!/bin/bash

# Script to compare local branches with droplet git repository
# Usage: ./scripts/compare-droplet-branches.sh [droplet-ip] [droplet-user]

DROPLET_IP="${1:-207.154.193.187}"
DROPLET_USER="${2:-root}"
DROPLET_PATH="/root/tetrix"

cd /home/diegomartinez/Desktop/tetrix

echo "=========================================="
echo "COMPARING LOCAL AND DROPLET GIT REPOS"
echo "=========================================="
echo ""

echo "=== LOCAL REPOSITORY ==="
echo "Current branch: $(git branch --show-current)"
echo "Remote: $(git remote get-url origin)"
echo ""
echo "Local commits (main):"
git log --oneline origin/main -3
echo ""

echo "Local commits (staging):"
git log --oneline origin/staging -3
echo ""

echo "Local commits (dev):"
git log --oneline origin/dev -3
echo ""

echo "=========================================="
echo "DROPLET REPOSITORY"
echo "=========================================="
echo ""

# Try to connect to droplet with SSH key
SSH_KEY="${HOME}/.ssh/tetrix_droplet_key"
if [ -f "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
elif [ -f "${SSH_KEY}.pem" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}.pem"
else
    SSH_CMD="ssh"
fi

if $SSH_CMD -o ConnectTimeout=5 ${DROPLET_USER}@${DROPLET_IP} "exit" 2>/dev/null; then
    echo "✅ SSH connection successful"
    echo ""
    
    $SSH_CMD ${DROPLET_USER}@${DROPLET_IP} << EOF
cd ${DROPLET_PATH}

echo "=== DROPLET GIT STATUS ==="
git status --short | head -5
echo ""

echo "=== DROPLET CURRENT BRANCH ==="
git branch --show-current
echo ""

echo "=== DROPLET REMOTE ==="
git remote -v
echo ""

echo "=== DROPLET LAST 3 COMMITS ==="
git log --oneline -3
echo ""

echo "=== DROPLET BRANCHES ==="
git branch -a | grep -E "(main|staging|dev)"
echo ""

echo "=== COMPARISON ==="
LOCAL_MAIN="$(cd /home/diegomartinez/Desktop/tetrix && git rev-parse origin/main)"
DROPLET_MAIN="\$(git rev-parse origin/main 2>/dev/null || echo 'not-found')"

if [ "\$LOCAL_MAIN" = "\$DROPLET_MAIN" ]; then
    echo "✅ Main branches match"
else
    echo "⚠️  Main branches differ"
    echo "   Local:  \${LOCAL_MAIN:0:8}"
    echo "   Droplet: \${DROPLET_MAIN:0:8}"
fi

EOF

else
    echo "❌ Cannot connect to droplet via SSH"
    echo ""
    echo "SSH key location checked: $SSH_KEY"
    if [ ! -f "$SSH_KEY" ]; then
        echo "⚠️  SSH key not found at: $SSH_KEY"
    fi
    echo ""
    echo "To connect manually, use:"
    echo "  ssh -i ~/.ssh/tetrix_droplet_key ${DROPLET_USER}@${DROPLET_IP}"
    echo ""
    echo "Manual comparison steps:"
    echo "1. SSH to droplet: ssh -i ~/.ssh/tetrix_droplet_key ${DROPLET_USER}@${DROPLET_IP}"
    echo "2. Run: cd ${DROPLET_PATH} && git log --oneline -3"
    echo "3. Compare with local: git log --oneline origin/main -3"
fi

echo ""
echo "=========================================="
echo "COMPARISON SUMMARY"
echo "=========================================="
echo ""
echo "Local main commit: $(git rev-parse origin/main | cut -c1-8)"
echo "Local staging commit: $(git rev-parse origin/staging | cut -c1-8)"
echo "Local dev commit: $(git rev-parse origin/dev | cut -c1-8)"
echo ""
echo "To manually check droplet:"
echo "  ssh ${DROPLET_USER}@${DROPLET_IP}"
echo "  cd ${DROPLET_PATH}"
echo "  git log --oneline -3"
echo "  git remote -v"

