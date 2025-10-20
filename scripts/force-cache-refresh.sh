#!/bin/bash

# Force Cache Refresh Script
# This script forces a cache refresh by adding cache-busting parameters

echo "🔄 Forcing cache refresh for tetrixcorp.com..."

# Test both URLs with cache-busting parameters
TIMESTAMP=$(date +%s)

echo "=== Testing DigitalOcean App URL ==="
curl -s "https://tetrix-minimal-uzzxn.ondigitalocean.app/?v=$TIMESTAMP" | grep -o 'openIndustryAuthModal' | head -1

echo -e "\n=== Testing Custom Domain with Cache Bust ==="
curl -s "https://tetrixcorp.com/?v=$TIMESTAMP" | grep -o 'openIndustryAuthModal' | head -1

echo -e "\n=== Testing JavaScript Files with Cache Bust ==="
echo "Header Auth JS:"
curl -s "https://tetrixcorp.com/assets/header-auth.js?v=$TIMESTAMP" | head -5

echo -e "\nIndustry Auth JS:"
curl -s "https://tetrixcorp.com/_astro/IndustryAuth.astro_astro_type_script_index_0_lang.BxmvkgE9.js?v=$TIMESTAMP" | head -5

echo -e "\n=== Cache Headers Check ==="
echo "DigitalOcean App URL Headers:"
curl -s -I "https://tetrix-minimal-uzzxn.ondigitalocean.app/assets/header-auth.js" | grep -i "cache\|etag"

echo -e "\nCustom Domain Headers:"
curl -s -I "https://tetrixcorp.com/assets/header-auth.js" | grep -i "cache\|etag"

echo -e "\n=== Manual Cache Purge Instructions ==="
echo "If the custom domain is still serving old content:"
echo "1. Go to Cloudflare Dashboard: https://dash.cloudflare.com"
echo "2. Select your domain: tetrixcorp.com"
echo "3. Go to Caching > Configuration"
echo "4. Click 'Purge Everything' or 'Custom Purge'"
echo "5. Add these URLs to purge:"
echo "   - https://tetrixcorp.com/assets/header-auth.js"
echo "   - https://tetrixcorp.com/_astro/IndustryAuth.astro_astro_type_script_index_0_lang.BxmvkgE9.js"
echo "   - https://tetrixcorp.com/_astro/2FAModal.astro_astro_type_script_index_0_lang.BWL0lr0y.js"

echo -e "\n=== Alternative: Browser Cache Clear ==="
echo "Users can also clear their browser cache:"
echo "1. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "2. Or open Developer Tools > Network tab > Right-click > 'Empty Cache and Hard Reload'"
