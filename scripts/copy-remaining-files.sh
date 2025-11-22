#!/bin/bash

# Copy remaining files that failed in the merge

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"
DROPLET_REPO="/opt/tetrix"

cd "$LOCAL_REPO"

echo "=== Copying Remaining Files from Droplet ==="
echo ""

# List of files that failed
FILES_TO_COPY=(
    "src/pages/api/v2/2fa/verify.ts"
    "src/pages/api/v2/auth/countries.ts"
    "src/pages/contact.astro"
    "tsconfig.json"
    "src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts"
)

echo "Files to copy:"
for file in "${FILES_TO_COPY[@]}"; do
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

for file in "${FILES_TO_COPY[@]}"; do
    echo ""
    echo "Copying: $file"
    
    # Check if file exists on droplet
    if ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" "test -f $DROPLET_REPO/$file" 2>/dev/null; then
        # Create directory if needed
        DIR=$(dirname "$file")
        if [ "$DIR" != "." ]; then
            mkdir -p "$LOCAL_REPO/$DIR"
        fi
        
        # Copy file
        if scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP:$DROPLET_REPO/$file" "$LOCAL_REPO/$file" 2>/dev/null; then
            echo "✅ Successfully copied: $file"
        else
            echo "❌ Failed to copy: $file"
        fi
    else
        echo "⚠️  File does not exist on droplet: $file"
    fi
done

echo ""
echo "=== Summary ==="
echo "Modified files:"
git status --short | grep -E "^ M" | head -10

echo ""
echo "✅ Done! Review changes with: git diff"

