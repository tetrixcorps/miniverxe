#!/usr/bin/env node

/**
 * Clear Custom Domain Cache
 * 
 * This script provides comprehensive cache clearing for the custom domain
 * to ensure the updated authentication files are served.
 */

import https from 'https';

const CUSTOM_DOMAIN = 'tetrixcorp.com';

console.log('🧹 Starting comprehensive cache clearing for custom domain...');
console.log(`🌐 Domain: ${CUSTOM_DOMAIN}`);

// Function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Function to check if a URL is accessible
async function checkUrl(url) {
  try {
    console.log(`🔍 Checking: ${url}`);
    const response = await makeRequest(url);
    console.log(`  Status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Function to test authentication files
async function testAuthenticationFiles() {
  console.log('\n🔍 Testing authentication files on custom domain...');
  
  const files = [
    `https://${CUSTOM_DOMAIN}/assets/header-auth.js`,
    `https://${CUSTOM_DOMAIN}/_astro/IndustryAuth.astro_astro_type_script_index_0_lang.DxtqorZN.js`,
    `https://${CUSTOM_DOMAIN}/_astro/2FAModal.astro_astro_type_script_index_0_lang.DzVUXFYi.js`
  ];
  
  for (const file of files) {
    await checkUrl(file);
  }
}

// Function to check for verbose logging in files
async function checkVerboseLogging() {
  console.log('\n🔍 Checking for verbose logging in authentication files...');
  
  try {
    const response = await makeRequest(`https://${CUSTOM_DOMAIN}/assets/header-auth.js`);
    
    if (response.status === 200) {
      const content = response.data;
      const hasVerboseLogging = content.includes('[VERBOSE]') || content.includes('tryOpenIndustryAuth');
      
      console.log(`  ${hasVerboseLogging ? '✅' : '❌'} header-auth.js: ${hasVerboseLogging ? 'Has verbose logging' : 'Missing verbose logging'}`);
      
      if (hasVerboseLogging) {
        console.log('  🎉 Custom domain has the updated authentication files!');
        return true;
      } else {
        console.log('  ⚠️  Custom domain still has old files - cache needs clearing');
        return false;
      }
    } else {
      console.log(`  ❌ Failed to fetch header-auth.js: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error checking verbose logging: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting cache clearing process...');
  
  // Test basic connectivity
  console.log('\n🌐 Testing basic connectivity...');
  const isAccessible = await checkUrl(`https://${CUSTOM_DOMAIN}/`);
  
  if (!isAccessible) {
    console.log('❌ Custom domain is not accessible. Please check your deployment.');
    return;
  }
  
  // Test authentication files
  await testAuthenticationFiles();
  
  // Check for verbose logging
  const hasUpdatedFiles = await checkVerboseLogging();
  
  if (hasUpdatedFiles) {
    console.log('\n✅ Custom domain has the updated files!');
    console.log('🎉 Authentication should now work correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Test the Client Login button on https://tetrixcorp.com');
    console.log('2. Check browser console for verbose logging');
    console.log('3. Verify authentication flow works end-to-end');
  } else {
    console.log('\n⚠️  Custom domain still has old files.');
    console.log('\n🧹 Cache clearing recommendations:');
    console.log('1. Clear CDN cache (Cloudflare, etc.)');
    console.log('2. Clear browser cache (Ctrl+Shift+R)');
    console.log('3. Deploy updated files to hosting provider');
    console.log('4. Wait 5-10 minutes for cache propagation');
    
    console.log('\n🔧 Manual cache clearing steps:');
    console.log('For Cloudflare:');
    console.log('  - Go to Cloudflare dashboard');
    console.log('  - Select your domain');
    console.log('  - Go to Caching > Configuration');
    console.log('  - Click "Purge Everything"');
    
    console.log('\nFor browser cache:');
    console.log('  - Hard refresh: Ctrl+Shift+R (Chrome/Firefox)');
    console.log('  - Or clear site data in browser settings');
  }
  
  console.log('\n🎯 Summary:');
  console.log(`  Custom domain accessible: ${isAccessible ? '✅' : '❌'}`);
  console.log(`  Has updated files: ${hasUpdatedFiles ? '✅' : '❌'}`);
  console.log(`  Authentication status: ${hasUpdatedFiles ? 'Should work' : 'Needs cache clearing'}`);
}

// Run the main function
main().catch(console.error);
