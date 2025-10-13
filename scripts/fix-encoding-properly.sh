#!/bin/bash

# TETRIX Character Encoding Fix Script - PROPER VERSION
# This script properly fixes all character encoding issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 TETRIX Character Encoding Fix - PROPER VERSION${NC}"
echo "======================================================"

# Define the pages directory
PAGES_DIR="src/pages"

# Function to fix encoding in a file properly
fix_file_encoding() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo -n "Fixing $file... "
    
    # Copy original file to temp
    cp "$file" "$temp_file"
    
    # First, fix the malformed HTML entities that were created
    sed -i 's/📞#128222;/&#128222;/g' "$temp_file"
    sed -i 's/🎤#127908;/&#127908;/g' "$temp_file"
    sed -i 's/☎️#9742;&#65039;/&#9742;&#65039;/g' "$temp_file"
    sed -i 's/🔐#128272;/&#128272;/g' "$temp_file"
    sed -i 's/📱#128241;/&#128241;/g' "$temp_file"
    sed -i 's/📲#128242;/&#128242;/g' "$temp_file"
    sed -i 's/💬#128172;/&#128172;/g' "$temp_file"
    sed -i 's/📊#128202;/&#128202;/g' "$temp_file"
    sed -i 's/🚛#128739;/&#128739;/g' "$temp_file"
    sed -i 's/🏥#127973;/&#127973;/g' "$temp_file"
    sed -i 's/🏦#127976;/&#127976;/g' "$temp_file"
    sed -i 's/🛒#128722;/&#128722;/g' "$temp_file"
    sed -i 's/📡#128225;/&#128225;/g' "$temp_file"
    sed -i 's/💰#128176;/&#128176;/g' "$temp_file"
    sed -i 's/🔗#128279;/&#128279;/g' "$temp_file"
    sed -i 's/✍️#9997;&#65039;/&#9997;&#65039;/g' "$temp_file"
    sed -i 's/🤖#129302;/&#129302;/g' "$temp_file"
    sed -i 's/⚡#9889;/&#9889;/g' "$temp_file"
    sed -i 's/💼#128188;/&#128188;/g' "$temp_file"
    sed -i 's/🏭#127981;/&#127981;/g' "$temp_file"
    sed -i 's/💳#128179;/&#128179;/g' "$temp_file"
    sed -i 's/🧠#129504;/&#129504;/g' "$temp_file"
    sed -i 's/🏷️#127991;&#65039;/&#127991;&#65039;/g' "$temp_file"
    sed -i 's/⚙️#9881;&#65039;/&#9881;&#65039;/g' "$temp_file"
    sed -i 's/🔌#128224;/&#128224;/g' "$temp_file"
    sed -i 's/🏠#127968;/&#127968;/g' "$temp_file"
    sed -i 's/🏢#127970;/&#127970;/g' "$temp_file"
    sed -i 's/☁️#9729;&#65039;/&#9729;&#65039;/g' "$temp_file"
    sed -i 's/🛡️#128737;&#65039;/&#128737;&#65039;/g' "$temp_file"
    
    # Now replace any remaining raw emoji characters with proper HTML entities
    sed -i 's/📞/&#128222;/g' "$temp_file"
    sed -i 's/🎤/&#127908;/g' "$temp_file"
    sed -i 's/☎️/&#9742;&#65039;/g' "$temp_file"
    sed -i 's/🔐/&#128272;/g' "$temp_file"
    sed -i 's/📱/&#128241;/g' "$temp_file"
    sed -i 's/📲/&#128242;/g' "$temp_file"
    sed -i 's/💬/&#128172;/g' "$temp_file"
    sed -i 's/📊/&#128202;/g' "$temp_file"
    sed -i 's/🚛/&#128739;/g' "$temp_file"
    sed -i 's/🏥/&#127973;/g' "$temp_file"
    sed -i 's/🏦/&#127976;/g' "$temp_file"
    sed -i 's/🛒/&#128722;/g' "$temp_file"
    sed -i 's/📡/&#128225;/g' "$temp_file"
    sed -i 's/💰/&#128176;/g' "$temp_file"
    sed -i 's/🔗/&#128279;/g' "$temp_file"
    sed -i 's/✍️/&#9997;&#65039;/g' "$temp_file"
    sed -i 's/🤖/&#129302;/g' "$temp_file"
    sed -i 's/⚡/&#9889;/g' "$temp_file"
    sed -i 's/💼/&#128188;/g' "$temp_file"
    sed -i 's/🏭/&#127981;/g' "$temp_file"
    sed -i 's/💳/&#128179;/g' "$temp_file"
    sed -i 's/🧠/&#129504;/g' "$temp_file"
    sed -i 's/🏷️/&#127991;&#65039;/g' "$temp_file"
    sed -i 's/⚙️/&#9881;&#65039;/g' "$temp_file"
    sed -i 's/🔌/&#128224;/g' "$temp_file"
    sed -i 's/🏠/&#127968;/g' "$temp_file"
    sed -i 's/🏢/&#127970;/g' "$temp_file"
    sed -i 's/☁️/&#9729;&#65039;/g' "$temp_file"
    sed -i 's/🛡️/&#128737;&#65039;/g' "$temp_file"
    
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
echo -e "${YELLOW}🔧 Fixing character encoding properly...${NC}"
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
    if grep -q "[📞🎤☎️🔐📱📲💬📊🚛🏥🏦🛒📡💰🔗✍️🤖⚡💼🏭💳🧠🏷️⚙️🔌🏠🏢☁️🛡️]" "$file" 2>/dev/null; then
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
