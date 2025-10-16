#!/bin/bash

# Script to fix duplicated HTML entities across all files
# This script finds patterns like &#128222;#128222; and replaces them with &#128222;

echo "🔧 Fixing duplicated HTML entities..."

# Find all files with duplicated HTML entities
files=$(grep -r "&#[0-9]\+;#128" src/ | cut -d: -f1 | sort | uniq)

for file in $files; do
    echo "Processing: $file"
    
    # Fix duplicated HTML entities (pattern: &#number;#number;)
    sed -i 's/&#\([0-9]\+\);#\1;/&#\1;/g' "$file"
    
    # Fix patterns with emoji + duplicated entities (like 🏥&#127973;#127973;)
    sed -i 's/\([^0-9]\)\(&#[0-9]\+\);#\2;/\1&#\2;/g' "$file"
done

echo "✅ Fixed duplicated HTML entities in all files"
echo "📋 Files processed:"
echo "$files"
