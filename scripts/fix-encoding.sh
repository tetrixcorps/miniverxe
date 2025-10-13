#!/bin/bash

# TETRIX Character Encoding Fix Script
# This script fixes all character encoding issues across all pages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 TETRIX Character Encoding Fix Script${NC}"
echo "=============================================="

# Define the pages directory
PAGES_DIR="src/pages"

# Character mapping for common problematic characters
declare -A CHAR_MAP=(
    ["→"]="&rarr;"
    ["•"]="&bull;"
    ["✓"]="&check;"
    ["×"]="&times;"
    ["⚠"]="&warning;"
    ["🔒"]="&#128274;"
    ["📞"]="&#128222;"
    ["💬"]="&#128172;"
    ["📊"]="&#128202;"
    ["🚛"]="&#128739;"
    ["🏥"]="&#127973;"
    ["🏦"]="&#127976;"
    ["🛒"]="&#128722;"
    ["🔐"]="&#128272;"
    ["📡"]="&#128225;"
    ["💰"]="&#128176;"
    ["🔗"]="&#128279;"
    ["✍️"]="&#9997;&#65039;"
    ["🤖"]="&#129302;"
    ["⚡"]="&#9889;"
    ["💼"]="&#128188;"
    ["🏭"]="&#127981;"
    ["📱"]="&#128241;"
    ["☎️"]="&#9742;&#65039;"
    ["💳"]="&#128179;"
    ["📲"]="&#128242;"
    ["🎤"]="&#127908;"
    ["🧠"]="&#129504;"
    ["🏷️"]="&#127991;&#65039;"
    ["⚙️"]="&#9881;&#65039;"
    ["🔌"]="&#128224;"
    ["🏠"]="&#127968;"
    ["🏢"]="&#127970;"
    ["☁️"]="&#9729;&#65039;"
    ["🛡️"]="&#128737;&#65039;"
)

# Function to fix encoding in a file
fix_file_encoding() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo -n "Fixing $file... "
    
    # Copy original file to temp
    cp "$file" "$temp_file"
    
    # Replace each problematic character
    for char in "${!CHAR_MAP[@]}"; do
        replacement="${CHAR_MAP[$char]}"
        sed -i "s/$char/$replacement/g" "$temp_file"
    done
    
    # Replace the original file with the fixed version
    mv "$temp_file" "$file"
    
    echo -e "${GREEN}✅ Fixed${NC}"
}

# Function to find all Astro files
find_astro_files() {
    find "$PAGES_DIR" -name "*.astro" -type f
}

# Main execution
echo -e "${YELLOW}🔍 Scanning for Astro files...${NC}"
files=$(find_astro_files)

if [ -z "$files" ]; then
    echo -e "${RED}❌ No Astro files found in $PAGES_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found $(echo "$files" | wc -l) Astro files${NC}"
echo ""

# Fix each file
echo -e "${YELLOW}🔧 Fixing character encoding...${NC}"
echo ""

file_count=0
for file in $files; do
    fix_file_encoding "$file"
    ((file_count++))
done

echo ""
echo -e "${GREEN}✅ Successfully fixed $file_count files${NC}"

# Verify the fixes
echo ""
echo -e "${YELLOW}🔍 Verifying fixes...${NC}"

# Check for remaining problematic characters
remaining_issues=0
for file in $files; do
    if grep -q "[→•✓×⚠🔒📞💬📊🚛🏥🏦🛒🔐📡💰🔗✍️🤖⚡💼🏭📱☎️💳📲🎤🧠🏷️💬⚙️🔌🏠🏢☁️📊🛡️]" "$file" 2>/dev/null; then
        echo -e "${RED}❌ $file still has encoding issues${NC}"
        ((remaining_issues++))
    fi
done

if [ $remaining_issues -eq 0 ]; then
    echo -e "${GREEN}✅ All character encoding issues have been resolved!${NC}"
else
    echo -e "${YELLOW}⚠️  $remaining_issues files still have encoding issues${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Character encoding fix complete!${NC}"
