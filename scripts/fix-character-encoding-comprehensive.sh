#!/bin/bash

# TETRIX Comprehensive Character Encoding Fix Script
# Based on the successful pattern used in ProductsModal.astro

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 TETRIX Comprehensive Character Encoding Fix${NC}"
echo "======================================================"

# Define the pages directory
PAGES_DIR="src/pages"

# Comprehensive character mapping based on ProductsModal.astro pattern
declare -A CHAR_MAP=(
    # Communication & Voice
    ["📞"]="&#128222;"
    ["🎤"]="&#127908;"
    ["☎️"]="&#9742;&#65039;"
    ["🔐"]="&#128272;"
    ["📱"]="&#128241;"
    ["📲"]="&#128242;"
    ["💬"]="&#128172;"
    
    # AI & Automation
    ["🤖"]="&#129302;"
    ["🧠"]="&#129504;"
    ["🏷️"]="&#127991;&#65039;"
    ["⚡"]="&#9889;"
    
    # Business & Commerce
    ["💼"]="&#128188;"
    ["💰"]="&#128176;"
    ["🔗"]="&#128279;"
    ["✍️"]="&#9997;&#65039;"
    ["📝"]="&#128221;"
    ["↻"]="&#8635;"
    
    # Industry Solutions
    ["🏭"]="&#127981;"
    ["🏥"]="&#127973;"
    ["🏦"]="&#127976;"
    ["🛒"]="&#128722;"
    ["🚛"]="&#128739;"
    ["📡"]="&#128225;"
    
    # IoT & Technology
    ["🔧"]="&#128295;"
    ["⚙️"]="&#9881;&#65039;"
    ["📊"]="&#128202;"
    ["🚀"]="&#128640;"
    ["💡"]="&#128161;"
    ["🔒"]="&#128274;"
    ["🛡️"]="&#128737;&#65039;"
    ["📈"]="&#128200;"
    ["🌐"]="&#127760;"
    ["⚡"]="&#9889;"
    ["🔌"]="&#128224;"
    ["🏠"]="&#127968;"
    ["🏢"]="&#127970;"
    ["☁️"]="&#9729;&#65039;"
    
    # Common symbols
    ["→"]="&#8594;"
    ["•"]="&#8226;"
    ["✓"]="&#10003;"
    ["×"]="&#215;"
    ["⚠"]="&#9888;"
    ["💳"]="&#128179;"
)

# Function to fix encoding in a file
fix_file_encoding() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo -n "Fixing $file... "
    
    # Copy original file to temp
    cp "$file" "$temp_file"
    
    # Replace each problematic character with HTML entity
    for char in "${!CHAR_MAP[@]}"; do
        replacement="${CHAR_MAP[$char]}"
        # Use a more robust replacement that handles the character properly
        sed -i "s|${char}|${replacement}|g" "$temp_file"
    done
    
    # Replace the original file with the fixed version
    mv "$temp_file" "$file"
    
    echo -e "${GREEN}✅ Fixed${NC}"
}

# Function to find all Astro files with emoji characters
find_files_with_emojis() {
    find "$PAGES_DIR" -name "*.astro" -exec grep -l "[🔧⚙️📊🚀💡🔒🛡️📈🌐⚡📞💬🏥🏦🛒🔐📡💰🔗✍️🤖⚡💼🏭📱☎️💳📲🎤🧠🏷️🔌🏠🏢☁️]" {} \;
}

# Main execution
echo -e "${YELLOW}Finding files with character encoding issues...${NC}"
files_to_fix=($(find_files_with_emojis))

if [ ${#files_to_fix[@]} -eq 0 ]; then
    echo -e "${GREEN}No files found with character encoding issues.${NC}"
    exit 0
fi

echo -e "${YELLOW}Found ${#files_to_fix[@]} files to fix:${NC}"
for file in "${files_to_fix[@]}"; do
    echo "  - $file"
done

echo ""
echo -e "${YELLOW}Starting character encoding fixes...${NC}"

# Fix each file
for file in "${files_to_fix[@]}"; do
    if [ -f "$file" ]; then
        fix_file_encoding "$file"
    else
        echo -e "${RED}❌ File not found: $file${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Character encoding fixes completed!${NC}"
echo -e "${BLUE}Fixed files:${NC}"
for file in "${files_to_fix[@]}"; do
    echo "  ✅ $file"
done

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the pages to verify fixes"
echo "2. Commit and push changes"
echo "3. Deploy to production"
