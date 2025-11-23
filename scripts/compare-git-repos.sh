#!/bin/bash

# Compare local and droplet git repositories

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"

echo "=== Comparing Git Repositories ==="
echo ""

echo "=== LOCAL Repository ==="
cd /home/diegomartinez/Desktop/tetrix
echo "Location: $(pwd)"
echo "Remote URL: $(git remote get-url origin 2>/dev/null || echo 'Not found')"
echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
echo ""

echo "=== DROPLET Repositories ==="
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'COMPARE'
echo "Checking all git repositories on droplet..."
echo ""

for dir in /opt/tetrix /opt/miniverxe /opt/tetrix/miniverxe; do
    if [ -d "$dir/.git" ]; then
        echo "=== $dir ==="
        cd "$dir" 2>/dev/null || continue
        echo "Remote URL: $(git remote get-url origin 2>/dev/null || echo 'No remote')"
        echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
        echo "Last commit: $(git log -1 --oneline 2>/dev/null || echo 'No commits')"
        echo ""
    fi
done
COMPARE

echo ""
echo "=== Matching Repository ==="
LOCAL_URL=$(cd /home/diegomartinez/Desktop/tetrix && git remote get-url origin 2>/dev/null)

ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << MATCH
LOCAL_URL="$LOCAL_URL"
echo "Local repository URL: \$LOCAL_URL"
echo ""

for dir in /opt/tetrix /opt/miniverxe /opt/tetrix/miniverxe; do
    if [ -d "\$dir/.git" ]; then
        DROPLET_URL=\$(cd "\$dir" && git remote get-url origin 2>/dev/null)
        if [ "\$DROPLET_URL" = "\$LOCAL_URL" ]; then
            echo "✅ MATCH FOUND: \$dir"
            echo "   Remote URL: \$DROPLET_URL"
        fi
    fi
done
MATCH

echo ""
echo "✅ Comparison complete"

