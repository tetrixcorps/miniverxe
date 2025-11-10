#!/bin/bash

# Script to compare all local branches (main, staging, dev) with droplet git repository
# Usage: ./scripts/compare-all-branches.sh [droplet-ip] [droplet-user]

DROPLET_IP="${1:-207.154.193.187}"
DROPLET_USER="${2:-root}"
DROPLET_PATH="/root/tetrix"

cd /home/diegomartinez/Desktop/tetrix

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "COMPREHENSIVE BRANCH COMPARISON"
echo "Local vs Droplet Git Repository"
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

# Test SSH connection
if ! $SSH_CMD -o ConnectTimeout=5 ${DROPLET_USER}@${DROPLET_IP} "exit" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to droplet via SSH${NC}"
    echo ""
    echo "SSH key location checked: $SSH_KEY"
    if [ ! -f "$SSH_KEY" ]; then
        echo -e "${YELLOW}⚠️  SSH key not found at: $SSH_KEY${NC}"
    fi
    echo ""
    echo "To connect manually, use:"
    echo "  ssh -i ~/.ssh/tetrix_droplet_key ${DROPLET_USER}@${DROPLET_IP}"
    exit 1
fi

echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Get local branch information
echo "=== LOCAL REPOSITORY ==="
echo "Current branch: $(git branch --show-current)"
echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'not configured')"
echo ""

# Function to compare a branch
compare_branch() {
    local branch_name=$1
    echo "----------------------------------------"
    echo -e "${BLUE}Comparing branch: ${branch_name}${NC}"
    echo "----------------------------------------"
    
    # Check if branch exists locally
    if ! git rev-parse --verify "origin/${branch_name}" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Branch '${branch_name}' does not exist locally${NC}"
        echo ""
        return
    fi
    
    # Get local commit
    LOCAL_COMMIT=$(git rev-parse "origin/${branch_name}")
    LOCAL_COMMIT_SHORT="${LOCAL_COMMIT:0:8}"
    LOCAL_MESSAGE=$(git log -1 --pretty=format:"%s" "origin/${branch_name}")
    
    echo "Local commit: ${LOCAL_COMMIT_SHORT}"
    echo "Local message: ${LOCAL_MESSAGE}"
    echo ""
    
    # Get droplet commit
    DROPLET_COMMIT=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git fetch origin ${branch_name} 2>/dev/null; git rev-parse origin/${branch_name} 2>/dev/null" || echo "not-found")
    
    if [ "$DROPLET_COMMIT" = "not-found" ]; then
        echo -e "${YELLOW}⚠️  Branch '${branch_name}' not found on droplet${NC}"
        echo ""
        return
    fi
    
    DROPLET_COMMIT_SHORT="${DROPLET_COMMIT:0:8}"
    DROPLET_MESSAGE=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git log -1 --pretty=format:'%s' origin/${branch_name} 2>/dev/null" || echo "unknown")
    
    echo "Droplet commit: ${DROPLET_COMMIT_SHORT}"
    echo "Droplet message: ${DROPLET_MESSAGE}"
    echo ""
    
    # Compare commits
    if [ "$LOCAL_COMMIT" = "$DROPLET_COMMIT" ]; then
        echo -e "${GREEN}✅ Branches are in sync${NC}"
    else
        echo -e "${RED}❌ Branches are out of sync${NC}"
        echo ""
        
        # Check if local is ahead
        LOCAL_AHEAD=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git rev-list --count origin/${branch_name}..${LOCAL_COMMIT} 2>/dev/null" || echo "0")
        # Check if droplet is ahead
        DROPLET_AHEAD=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git rev-list --count ${LOCAL_COMMIT}..origin/${branch_name} 2>/dev/null" || echo "0")
        
        if [ "$LOCAL_AHEAD" != "0" ]; then
            echo -e "${YELLOW}📤 Local is ${LOCAL_AHEAD} commit(s) ahead${NC}"
            echo "Commits in local but not on droplet:"
            $SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git log --oneline ${DROPLET_COMMIT}..${LOCAL_COMMIT} 2>/dev/null" | sed 's/^/  /' || echo "  (Could not determine)"
            echo ""
        fi
        
        if [ "$DROPLET_AHEAD" != "0" ]; then
            echo -e "${YELLOW}📥 Droplet is ${DROPLET_AHEAD} commit(s) ahead${NC}"
            echo "Commits on droplet but not in local:"
            $SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git log --oneline ${LOCAL_COMMIT}..${DROPLET_COMMIT} 2>/dev/null" | sed 's/^/  /' || echo "  (Could not determine)"
            echo ""
        fi
    fi
    echo ""
}

# Compare main branch
compare_branch "main"

# Compare staging branch
compare_branch "staging"

# Compare dev branch
compare_branch "dev"

# Get droplet current branch and status
echo "----------------------------------------"
echo -e "${BLUE}Droplet Current Status${NC}"
echo "----------------------------------------"
DROPLET_CURRENT_BRANCH=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git branch --show-current 2>/dev/null" || echo "unknown")
DROPLET_CURRENT_COMMIT=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git rev-parse HEAD 2>/dev/null" || echo "unknown")
DROPLET_CURRENT_COMMIT_SHORT="${DROPLET_CURRENT_COMMIT:0:8}"

echo "Current branch: ${DROPLET_CURRENT_BRANCH}"
echo "Current commit: ${DROPLET_CURRENT_COMMIT_SHORT}"
echo ""

# Check if droplet has uncommitted changes
DROPLET_STATUS=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git status --porcelain 2>/dev/null" || echo "")
if [ -n "$DROPLET_STATUS" ]; then
    echo -e "${YELLOW}⚠️  Droplet has uncommitted changes:${NC}"
    echo "$DROPLET_STATUS" | sed 's/^/  /'
    echo ""
fi

# Get droplet remote info
echo "Droplet remote:"
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git remote -v 2>/dev/null" | sed 's/^/  /' || echo "  (Could not determine)"
echo ""

echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo ""

# Summary table
echo "Branch          | Local Commit | Droplet Commit | Status"
echo "----------------|--------------|----------------|--------"

for branch in main staging dev; do
    if git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
        LOCAL_C=$(git rev-parse "origin/${branch}" | cut -c1-8)
        DROPLET_C=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git rev-parse origin/${branch} 2>/dev/null | cut -c1-8" || echo "not-found")
        
        if [ "$DROPLET_C" = "not-found" ]; then
            STATUS="${YELLOW}⚠️  Not found${NC}"
        elif [ "$(git rev-parse origin/${branch})" = "$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git rev-parse origin/${branch} 2>/dev/null")" ]; then
            STATUS="${GREEN}✅ In sync${NC}"
        else
            STATUS="${RED}❌ Out of sync${NC}"
        fi
        
        printf "%-15s | %-12s | %-14s | %s\n" "$branch" "$LOCAL_C" "$DROPLET_C" "$STATUS"
    fi
done

echo ""
echo "=========================================="

