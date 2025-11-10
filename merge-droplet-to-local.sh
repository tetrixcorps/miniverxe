#!/bin/bash

# Merge droplet repository changes to local dev server

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"

echo "=== Merging Droplet Repository to Local ==="
echo ""

# Check local repository status
cd "$LOCAL_REPO"
echo "=== Local Repository ==="
echo "Location: $LOCAL_REPO"
echo "Branch: $(git branch --show-current)"
echo "Status:"
git status --short | head -10
echo ""

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  WARNING: You have uncommitted changes!"
    echo "Files modified:"
    git status --short
    echo ""
    read -p "Do you want to stash changes before merging? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stashing changes..."
        git stash push -m "Stashed before merging from droplet $(date +%Y%m%d_%H%M%S)"
        echo "✅ Changes stashed"
    else
        echo "❌ Aborting merge. Please commit or stash your changes first."
        exit 1
    fi
fi

echo ""
echo "=== Checking Droplet Repository ==="

# Determine which droplet repository to use
DROPLET_REPO=$(ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" "bash -c '
# Check /opt/tetrix first (where we have been working)
if [ -d /opt/tetrix/.git ] && [ -f /opt/tetrix/docker-compose.yml ]; then
    echo /opt/tetrix
    exit 0
fi
# Check /opt/miniverxe
if [ -d /opt/miniverxe/.git ] && [ -f /opt/miniverxe/docker-compose.yml ]; then
    echo /opt/miniverxe
    exit 0
fi
# Check /opt/tetrix/miniverxe
if [ -d /opt/tetrix/miniverxe/.git ] && [ -f /opt/tetrix/miniverxe/docker-compose.yml ]; then
    echo /opt/tetrix/miniverxe
    exit 0
fi
echo ERROR: No matching repository found
exit 1
'" 2>/dev/null | tail -1)

echo "Using droplet repository: $DROPLET_REPO"
echo ""

# Get droplet repository info
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" "bash -c '
cd $DROPLET_REPO
echo \"=== Droplet Repository ===\"
echo \"Location: $DROPLET_REPO\"
echo \"Branch: \$(git branch --show-current)\"
echo \"Remote: \$(git remote get-url origin)\"
echo \"Last commit: \$(git log -1 --oneline)\"
echo \"\"
echo \"Uncommitted changes:\"
git status --short | head -10
'" 2>/dev/null

echo ""
echo "=== Fetching from GitHub remote ==="

# Fetch all branches from origin
git fetch origin

echo ""
echo "=== Available branches ==="
git branch -r | head -10

echo ""
echo "=== Getting droplet branch info ==="

# Get the droplet branch name
DROPLET_BRANCH=$(ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" "cd $DROPLET_REPO && git branch --show-current" 2>/dev/null)

echo "Droplet branch: $DROPLET_BRANCH"
echo "Local branch: $(git branch --show-current)"
echo ""

# Check if droplet branch exists in remote
if git show-ref --verify --quiet "refs/remotes/origin/$DROPLET_BRANCH"; then
    echo "✅ Found $DROPLET_BRANCH branch in remote"
    MERGE_BRANCH="origin/$DROPLET_BRANCH"
else
    echo "⚠️  Branch $DROPLET_BRANCH not found in remote"
    echo "Checking if droplet has uncommitted changes..."
    
    # Check for uncommitted changes on droplet
    DROPLET_CHANGES=$(ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" "cd $DROPLET_REPO && git status --short" 2>/dev/null)
    
    if [ -n "$DROPLET_CHANGES" ]; then
        echo "⚠️  Droplet has uncommitted changes that won't be merged:"
        echo "$DROPLET_CHANGES" | head -5
        echo ""
        echo "You may want to commit these on the droplet first, or use a different merge method."
    fi
    
    # Use the droplet branch from remote if it exists, otherwise use current branch
    MERGE_BRANCH="origin/$DROPLET_BRANCH"
    if ! git show-ref --verify --quiet "refs/remotes/$MERGE_BRANCH"; then
        echo "❌ Cannot merge: branch $DROPLET_BRANCH not found in remote"
        echo "Please push the droplet branch to GitHub first, or use a different merge method."
        exit 1
    fi
fi

echo ""
echo "=== Merging droplet changes ==="

# Ask user if they want to merge
read -p "Merge $MERGE_BRANCH into local $(git branch --show-current)? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Merge cancelled"
    exit 0
fi

echo ""
echo "Merging $MERGE_BRANCH..."
if git merge "$MERGE_BRANCH" --no-edit; then
    echo "✅ Merge successful!"
    echo ""
    echo "=== Merge Summary ==="
    git log --oneline -10
else
    echo "❌ Merge conflicts detected!"
    echo ""
    echo "Conflicted files:"
    git diff --name-only --diff-filter=U
    echo ""
    echo "Please resolve conflicts and run:"
    echo "  git add ."
    echo "  git commit"
    exit 1
fi

echo ""
echo "✅ Merge complete!"

