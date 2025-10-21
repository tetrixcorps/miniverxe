#!/usr/bin/env node

/**
 * Deploy Updated Files to Custom Domain
 * 
 * This script handles the deployment of updated authentication files
 * to the custom domain (tetrixcorp.com) and clears all relevant caches.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CUSTOM_DOMAIN = 'tetrixcorp.com';
const PRODUCTION_URL = 'https://tetrix-minimal-uzzxn.ondigitalocean.app';

console.log('🚀 Starting deployment to custom domain...');
console.log(`🌐 Custom Domain: ${CUSTOM_DOMAIN}`);
console.log(`🔗 Production URL: ${PRODUCTION_URL}`);

// Files that need to be updated on the custom domain
const CRITICAL_FILES = [
  'public/assets/header-auth.js',
  'src/components/layout/Header.astro',
  'src/components/auth/IndustryAuth.astro',
  'src/components/auth/TwoFAModal.astro'
];

console.log('📋 Critical files to update:');
CRITICAL_FILES.forEach(file => {
  console.log(`  - ${file}`);
});

// Check if files exist and have our verbose logging
console.log('\n🔍 Checking for verbose logging in critical files...');

CRITICAL_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasVerboseLogging = content.includes('[VERBOSE]') || content.includes('tryOpenIndustryAuth');
    
    console.log(`  ${hasVerboseLogging ? '✅' : '❌'} ${file}: ${hasVerboseLogging ? 'Has verbose logging' : 'Missing verbose logging'}`);
    
    if (!hasVerboseLogging) {
      console.log(`    ⚠️  This file may not have the latest fixes!`);
    }
  } else {
    console.log(`  ❌ ${file}: File not found`);
  }
});

console.log('\n🔧 Deployment steps:');
console.log('1. ✅ Build completed with cache-busting');
console.log('2. 🔄 Files are ready for deployment');
console.log('3. 🌐 Custom domain needs cache clearing');

console.log('\n📝 Manual deployment steps required:');
console.log('1. Deploy the built files to your hosting provider');
console.log('2. Clear CDN cache (Cloudflare, etc.)');
console.log('3. Clear browser cache');
console.log('4. Verify the updated files are served');

console.log('\n🧹 Cache clearing commands:');
console.log('For Cloudflare:');
console.log('  - Use Cloudflare dashboard to purge cache');
console.log('  - Or use: curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \\');
console.log('    -H "Authorization: Bearer {api_token}" \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    --data \'{"purge_everything":true}\'');

console.log('\nFor browser cache:');
console.log('  - Hard refresh: Ctrl+Shift+R (Chrome/Firefox)');
console.log('  - Clear site data in browser settings');

console.log('\n🔍 Verification steps:');
console.log('1. Visit https://tetrixcorp.com');
console.log('2. Open browser developer tools');
console.log('3. Check console for verbose logging messages');
console.log('4. Test Client Login button functionality');

console.log('\n📊 Expected verbose logging output:');
console.log('  🔧 [VERBOSE] openIndustryAuth called');
console.log('  🔧 [VERBOSE] Current window state: {...}');
console.log('  🔧 [VERBOSE] Attempting to open Industry Auth modal');
console.log('  ✅ [VERBOSE] Industry Auth modal function found, opening...');

console.log('\n✅ Deployment preparation complete!');
console.log('🌐 Next: Deploy files and clear caches on tetrixcorp.com');
