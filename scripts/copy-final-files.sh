#!/bin/bash

# Copy final remaining files with proper path handling

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"
DROPLET_REPO="/opt/tetrix"

cd "$LOCAL_REPO"

echo "=== Copying Final Remaining Files ==="
echo ""

# Files to copy with proper escaping
declare -A FILES=(
    ["src/pages/contact.astro"]="src/pages/contact.astro"
    ["tsconfig.json"]="tsconfig.json"
    ["src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts"]="src/pages/api/v1/joromi/sessions/\\[sessionId\\]/messages/stream.ts"
)

echo "Files to copy:"
for file in "${!FILES[@]}"; do
    echo "  - $file"
done
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo "=== Copying files ==="

for local_path in "${!FILES[@]}"; do
    droplet_path="${FILES[$local_path]}"
    
    echo ""
    echo "Copying: $local_path"
    
    # Create directory if needed
    DIR=$(dirname "$local_path")
    if [ "$DIR" != "." ]; then
        mkdir -p "$LOCAL_REPO/$DIR"
    fi
    
    # Use rsync or scp with proper escaping
    # Try rsync first (handles special characters better)
    if rsync -e "ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o LogLevel=ERROR" \
        "$DROPLET_USER@$DROPLET_IP:$DROPLET_REPO/$droplet_path" \
        "$LOCAL_REPO/$local_path" 2>/dev/null; then
        echo "✅ Successfully copied: $local_path"
    # Fallback to scp with quoted path
    elif scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
        "$DROPLET_USER@$DROPLET_IP:$DROPLET_REPO/$droplet_path" \
        "$LOCAL_REPO/$local_path" 2>/dev/null; then
        echo "✅ Successfully copied: $local_path"
    else
        echo "❌ Failed to copy: $local_path"
        echo "   Trying alternative method..."
        
        # Alternative: use SSH with cat and redirect
        if ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR \
            "$DROPLET_USER@$DROPLET_IP" "cat $DROPLET_REPO/$droplet_path" > "$LOCAL_REPO/$local_path" 2>/dev/null; then
            echo "✅ Successfully copied (alternative method): $local_path"
        else
            echo "❌ All copy methods failed for: $local_path"
        fi
    fi
done

echo ""
echo "=== Summary ==="
echo "Modified files:"
git status --short | grep -E "^ M" | head -10

echo ""
echo "All files:"
git status --short | head -15

echo ""
echo "✅ Done! Review changes with: git diff"

