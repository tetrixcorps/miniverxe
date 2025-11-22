#!/bin/bash

# Direct merge: Copy changed files from droplet to local

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"
DROPLET_REPO="/opt/tetrix"

echo "=== Direct Merge from Droplet ==="
echo ""

cd "$LOCAL_REPO"

echo "=== Local Repository ==="
echo "Location: $LOCAL_REPO"
echo "Branch: $(git branch --show-current)"
echo ""

echo "=== Droplet Repository ==="
echo "Location: $DROPLET_REPO"
echo ""

# Get list of changed files on droplet
echo "=== Getting changed files from droplet ==="
CHANGED_FILES=$(ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" "cd $DROPLET_REPO && git status --short | grep -E '^[ M]' | awk '{print \$2}'" 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
    echo "⚠️  No modified files found on droplet"
    exit 0
fi

echo "Files to copy from droplet:"
echo "$CHANGED_FILES" | while read file; do
    echo "  - $file"
done
echo ""

# Ask for confirmation
read -p "Copy these files from droplet to local? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "=== Copying files ==="

# Create backup directory
BACKUP_DIR="$LOCAL_REPO/.droplet-merge-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Copy each file
COPIED=0
FAILED=0

echo "$CHANGED_FILES" | while read file; do
    if [ -z "$file" ]; then
        continue
    fi
    
    # Create directory structure if needed
    DIR=$(dirname "$file")
    if [ "$DIR" != "." ]; then
        mkdir -p "$LOCAL_REPO/$DIR"
    fi
    
    # Backup local file if it exists
    if [ -f "$LOCAL_REPO/$file" ]; then
        mkdir -p "$BACKUP_DIR/$DIR"
        cp "$LOCAL_REPO/$file" "$BACKUP_DIR/$file"
        echo "📦 Backed up: $file"
    fi
    
    # Copy from droplet
    if scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP:$DROPLET_REPO/$file" "$LOCAL_REPO/$file" 2>/dev/null; then
        echo "✅ Copied: $file"
        COPIED=$((COPIED + 1))
    else
        echo "❌ Failed: $file"
        FAILED=$((FAILED + 1))
        # Restore backup if copy failed
        if [ -f "$BACKUP_DIR/$file" ]; then
            cp "$BACKUP_DIR/$file" "$LOCAL_REPO/$file"
            echo "   Restored from backup"
        fi
    fi
done

echo ""
echo "=== Summary ==="
echo "Files copied: $COPIED"
echo "Files failed: $FAILED"
echo "Backup location: $BACKUP_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All files copied successfully!"
    echo ""
    echo "=== Local repository status ==="
    git status --short | head -20
    echo ""
    echo "Next steps:"
    echo "1. Review the changes: git diff"
    echo "2. Stage the files: git add ."
    echo "3. Commit: git commit -m 'Merge changes from droplet'"
    echo ""
    echo "To restore from backup:"
    echo "  cp -r $BACKUP_DIR/* $LOCAL_REPO/"
else
    echo "⚠️  Some files failed to copy. Check the errors above."
    echo "Backup is available at: $BACKUP_DIR"
fi

