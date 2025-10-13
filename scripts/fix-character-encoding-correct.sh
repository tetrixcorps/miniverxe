#!/bin/bash

# TETRIX Character Encoding Fix - CORRECT VERSION
# This script properly fixes the malformed HTML entities created by the previous script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 TETRIX Character Encoding Fix - CORRECT VERSION${NC}"
echo "======================================================"

# Define the pages directory
PAGES_DIR="src/pages"

# Function to fix malformed HTML entities
fix_malformed_entities() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo -n "Fixing malformed entities in $file... "
    
    # Copy original file to temp
    cp "$file" "$temp_file"
    
    # Fix the malformed HTML entities that were created
    sed -i 's/📈#128200;/&#128200;/g' "$temp_file"
    sed -i 's/⚙️#9881;⚙️#65039;/&#9881;&#65039;/g' "$temp_file"
    sed -i 's/🔧#128295;/&#128295;/g' "$temp_file"
    sed -i 's/🌐#127760;/&#127760;/g' "$temp_file"
    sed -i 's/🚀#128640;/&#128640;/g' "$temp_file"
    sed -i 's/💡#128161;/&#128161;/g' "$temp_file"
    sed -i 's/🔒#128274;/&#128274;/g' "$temp_file"
    sed -i 's/🛡️#128737;&#65039;/&#128737;&#65039;/g' "$temp_file"
    sed -i 's/⚡#9889;/&#9889;/g' "$temp_file"
    sed -i 's/📊#128202;/&#128202;/g' "$temp_file"
    sed -i 's/💰#128176;/&#128176;/g' "$temp_file"
    sed -i 's/🤖#129302;/&#129302;/g' "$temp_file"
    sed -i 's/🧠#129504;/&#129504;/g' "$temp_file"
    sed -i 's/🏥#127973;/&#127973;/g' "$temp_file"
    sed -i 's/🏦#127976;/&#127976;/g' "$temp_file"
    sed -i 's/🛒#128722;/&#128722;/g' "$temp_file"
    sed -i 's/📱#128241;/&#128241;/g' "$temp_file"
    sed -i 's/📞#128222;/&#128222;/g' "$temp_file"
    sed -i 's/💬#128172;/&#128172;/g' "$temp_file"
    sed -i 's/🎤#127908;/&#127908;/g' "$temp_file"
    sed -i 's/☎️#9742;&#65039;/&#9742;&#65039;/g' "$temp_file"
    sed -i 's/🔐#128272;/&#128272;/g' "$temp_file"
    sed -i 's/📲#128242;/&#128242;/g' "$temp_file"
    sed -i 's/🏷️#127991;&#65039;/&#127991;&#65039;/g' "$temp_file"
    sed -i 's/💼#128188;/&#128188;/g' "$temp_file"
    sed -i 's/🏭#127981;/&#127981;/g' "$temp_file"
    sed -i 's/🔗#128279;/&#128279;/g' "$temp_file"
    sed -i 's/✍️#9997;&#65039;/&#9997;&#65039;/g' "$temp_file"
    sed -i 's/📝#128221;/&#128221;/g' "$temp_file"
    sed -i 's/↻#8635;/&#8635;/g' "$temp_file"
    sed -i 's/🚛#128739;/&#128739;/g' "$temp_file"
    sed -i 's/📡#128225;/&#128225;/g' "$temp_file"
    sed -i 's/💳#128179;/&#128179;/g' "$temp_file"
    sed -i 's/🔌#128224;/&#128224;/g' "$temp_file"
    sed -i 's/🏠#127968;/&#127968;/g' "$temp_file"
    sed -i 's/🏢#127970;/&#127970;/g' "$temp_file"
    sed -i 's/☁️#9729;&#65039;/&#9729;&#65039;/g' "$temp_file"
    
    # Replace the original file with the fixed version
    mv "$temp_file" "$file"
    
    echo -e "${GREEN}✅ Fixed${NC}"
}

# Function to find all Astro files with malformed entities
find_files_with_malformed_entities() {
    find "$PAGES_DIR" -name "*.astro" -exec grep -l "📈#128200;\|⚙️#9881;\|🔧#128295;\|🌐#127760;\|🚀#128640;\|💡#128161;\|🔒#128274;\|🛡️#128737;\|⚡#9889;\|📊#128202;\|💰#128176;\|🤖#129302;\|🧠#129504;\|🏥#127973;\|🏦#127976;\|🛒#128722;\|📱#128241;\|📞#128222;\|💬#128172;\|🎤#127908;\|☎️#9742;\|🔐#128272;\|📲#128242;\|🏷️#127991;\|💼#128188;\|🏭#127981;\|🔗#128279;\|✍️#9997;\|📝#128221;\|↻#8635;\|🚛#128739;\|📡#128225;\|💳#128179;\|🔌#128224;\|🏠#127968;\|🏢#127970;\|☁️#9729;" {} \;
}

# Main execution
echo -e "${YELLOW}Finding files with malformed HTML entities...${NC}"
files_to_fix=($(find_files_with_malformed_entities))

if [ ${#files_to_fix[@]} -eq 0 ]; then
    echo -e "${GREEN}No files found with malformed HTML entities.${NC}"
    exit 0
fi

echo -e "${YELLOW}Found ${#files_to_fix[@]} files to fix:${NC}"
for file in "${files_to_fix[@]}"; do
    echo "  - $file"
done

echo ""
echo -e "${YELLOW}Starting malformed entity fixes...${NC}"

# Fix each file
for file in "${files_to_fix[@]}"; do
    if [ -f "$file" ]; then
        fix_malformed_entities "$file"
    else
        echo -e "${RED}❌ File not found: $file${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Malformed HTML entity fixes completed!${NC}"
echo -e "${BLUE}Fixed files:${NC}"
for file in "${files_to_fix[@]}"; do
    echo "  ✅ $file"
done

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the pages to verify fixes"
echo "2. Commit and push changes"
echo "3. Deploy to production"
