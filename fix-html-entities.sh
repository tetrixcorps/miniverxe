#!/bin/bash

# Script to fix malformed HTML entities by adding missing & prefix
# This fixes patterns like #128200; to &#128200;

echo "🔧 Fixing malformed HTML entities across the codebase..."

# Find all files with malformed HTML entities and fix them
find src -type f \( -name "*.astro" -o -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec grep -l "#128[0-9]\+;" {} \; | while read file; do
    echo "Processing: $file"
    
    # Fix malformed HTML entities by adding & prefix
    sed -i 's/#128\([0-9]\+\);/&#128\1;/g' "$file"
    
    # Also fix any other common malformed patterns
    sed -i 's/#127\([0-9]\+\);/&#127\1;/g' "$file"
    sed -i 's/#129\([0-9]\+\);/&#129\1;/g' "$file"
done

echo "✅ HTML entity fixes completed!"
echo "📋 Summary of changes:"
echo "  - Fixed malformed HTML entities by adding missing & prefix"
echo "  - Pattern: #128XXX; → &#128XXX;"
echo "  - Pattern: #127XXX; → &#127XXX;"
echo "  - Pattern: #129XXX; → &#129XXX;"
echo ""
echo "🚀 Ready to deploy the fixes!"
