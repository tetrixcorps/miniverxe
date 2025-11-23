#!/bin/bash

# Find git repository on droplet

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"

echo "=== Locating Git Repository on Droplet ==="
echo ""

ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'FIND_GIT'
echo "=== Checking /opt/tetrix ==="
cd /opt/tetrix 2>/dev/null && pwd

if [ -d .git ]; then
    echo "✅ Git repository found at: $(pwd)"
    echo ""
    echo "=== Git Status ==="
    git status --short | head -10
    echo ""
    echo "=== Current Branch ==="
    git branch --show-current
    echo ""
    echo "=== Remote Repositories ==="
    git remote -v
    echo ""
    echo "=== Last Commit ==="
    git log -1 --oneline
else
    echo "❌ No .git directory found at /opt/tetrix"
    echo ""
    echo "=== Searching for git repositories ==="
    find /opt -name '.git' -type d 2>/dev/null | head -5
    echo ""
    echo "=== Checking if directory exists ==="
    ls -la /opt/tetrix 2>/dev/null | head -10 || echo "Directory /opt/tetrix does not exist"
fi
FIND_GIT

echo ""
echo "✅ Search complete"

