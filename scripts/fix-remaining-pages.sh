#!/bin/bash

# Fix remaining pages with character encoding issues
# Apply the same ProductsModal.astro pattern to all pages

set -e

echo "🔧 Fixing remaining pages with character encoding issues..."

# Function to fix a specific file
fix_file() {
    local file="$1"
    echo "Fixing $file..."
    
    # Replace raw emojis with HTML entities
    sed -i 's/📞/&#128222;/g' "$file"
    sed -i 's/💬/&#128172;/g' "$file"
    sed -i 's/⚙️/&#9881;&#65039;/g' "$file"
    sed -i 's/🔧/&#128295;/g' "$file"
    sed -i 's/🏥/&#127973;/g' "$file"
    sed -i 's/🔐/&#128272;/g' "$file"
    sed -i 's/📡/&#128225;/g' "$file"
    sed -i 's/📈/&#128200;/g' "$file"
    sed -i 's/🌐/&#127760;/g' "$file"
    sed -i 's/🚀/&#128640;/g' "$file"
    sed -i 's/💡/&#128161;/g' "$file"
    sed -i 's/🔒/&#128274;/g' "$file"
    sed -i 's/🛡️/&#128737;&#65039;/g' "$file"
    sed -i 's/⚡/&#9889;/g' "$file"
    sed -i 's/📊/&#128202;/g' "$file"
    sed -i 's/💰/&#128176;/g' "$file"
    sed -i 's/🤖/&#129302;/g' "$file"
    sed -i 's/🧠/&#129504;/g' "$file"
    sed -i 's/🏷️/&#127991;&#65039;/g' "$file"
    sed -i 's/💼/&#128188;/g' "$file"
    sed -i 's/🏭/&#127981;/g' "$file"
    sed -i 's/📱/&#128241;/g' "$file"
    sed -i 's/☎️/&#9742;&#65039;/g' "$file"
    sed -i 's/💳/&#128179;/g' "$file"
    sed -i 's/📲/&#128242;/g' "$file"
    sed -i 's/🎤/&#127908;/g' "$file"
    sed -i 's/🔌/&#128224;/g' "$file"
    sed -i 's/🏠/&#127968;/g' "$file"
    sed -i 's/🏢/&#127970;/g' "$file"
    sed -i 's/☁️/&#9729;&#65039;/g' "$file"
    sed -i 's/🛒/&#128722;/g' "$file"
    sed -i 's/🚛/&#128739;/g' "$file"
    sed -i 's/🏦/&#127976;/g' "$file"
    
    echo "✅ Fixed $file"
}

# Get list of files with raw emojis
files=($(find src/pages -name "*.astro" -exec grep -l "📞\|💬\|⚙️\|🔧\|🏥\|🔐\|📡\|📈\|🌐\|🚀\|💡\|🔒\|🛡️\|⚡\|📊\|💰\|🤖\|🧠\|🏷️\|💼\|🏭\|📱\|☎️\|💳\|📲\|🎤\|🔌\|🏠\|🏢\|☁️\|🛒\|🚛\|🏦" {} \;))

if [ ${#files[@]} -eq 0 ]; then
    echo "No files found with raw emoji characters."
    exit 0
fi

echo "Found ${#files[@]} files to fix:"
for file in "${files[@]}"; do
    echo "  - $file"
done

echo ""
echo "Starting fixes..."

# Fix each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "❌ File not found: $file"
    fi
done

echo ""
echo "🎉 All character encoding fixes completed!"
