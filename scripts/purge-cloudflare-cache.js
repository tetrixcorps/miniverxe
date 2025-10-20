#!/usr/bin/env node

/**
 * Cloudflare Cache Purge Script
 * 
 * This script purges the Cloudflare cache for your custom domain
 * to ensure users get the latest version of your JavaScript files.
 */

const https = require('https');

// Configuration - Replace with your actual values
const CLOUDFLARE_CONFIG = {
  zoneId: process.env.CLOUDFLARE_ZONE_ID || 'your-zone-id',
  apiToken: process.env.CLOUDFLARE_API_TOKEN || 'your-api-token',
  domain: process.env.CLOUDFLARE_DOMAIN || 'tetrixcorp.com'
};

// Function to make API request to Cloudflare
function makeCloudflareRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Function to purge cache for specific files
async function purgeCacheForFiles(files) {
  console.log('🧹 Purging cache for specific files...');
  
  const data = {
    files: files
  };

  try {
    const response = await makeCloudflareRequest(
      `/client/v4/zones/${CLOUDFLARE_CONFIG.zoneId}/purge_cache`,
      'POST',
      data
    );

    if (response.status === 200) {
      console.log('✅ Cache purged successfully for specific files');
      return true;
    } else {
      console.error('❌ Failed to purge cache:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error purging cache:', error.message);
    return false;
  }
}

// Function to purge entire cache
async function purgeEntireCache() {
  console.log('🧹 Purging entire cache...');
  
  const data = {
    purge_everything: true
  };

  try {
    const response = await makeCloudflareRequest(
      `/client/v4/zones/${CLOUDFLARE_CONFIG.zoneId}/purge_cache`,
      'POST',
      data
    );

    if (response.status === 200) {
      console.log('✅ Entire cache purged successfully');
      return true;
    } else {
      console.error('❌ Failed to purge entire cache:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error purging entire cache:', error.message);
    return false;
  }
}

// Function to get zone information
async function getZoneInfo() {
  try {
    const response = await makeCloudflareRequest(
      `/client/v4/zones?name=${CLOUDFLARE_CONFIG.domain}`
    );

    if (response.status === 200 && response.data.result && response.data.result.length > 0) {
      return response.data.result[0];
    } else {
      console.error('❌ Zone not found for domain:', CLOUDFLARE_CONFIG.domain);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting zone info:', error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Cloudflare cache purge...');
  console.log(`🌐 Domain: ${CLOUDFLARE_CONFIG.domain}`);
  
  // Check if we have the required configuration
  if (CLOUDFLARE_CONFIG.zoneId === 'your-zone-id' || CLOUDFLARE_CONFIG.apiToken === 'your-api-token') {
    console.log('⚠️  Please configure CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables');
    console.log('   You can find these in your Cloudflare dashboard');
    process.exit(1);
  }

  // Get zone information
  const zone = await getZoneInfo();
  if (!zone) {
    console.error('❌ Could not find zone information');
    process.exit(1);
  }

  console.log(`📋 Zone ID: ${zone.id}`);
  console.log(`📋 Zone Status: ${zone.status}`);

  // Purge specific JavaScript and CSS files
  const filesToPurge = [
    `https://${CLOUDFLARE_CONFIG.domain}/assets/header-auth.js`,
    `https://${CLOUDFLARE_CONFIG.domain}/assets/dashboard-routing-service.js`,
    `https://${CLOUDFLARE_CONFIG.domain}/_astro/2FAModal.astro_astro_type_script_index_0_lang.BWL0lr0y.js`,
    `https://${CLOUDFLARE_CONFIG.domain}/_astro/IndustryAuth.astro_astro_type_script_index_0_lang.BxmvkgE9.js`
  ];

  const success = await purgeCacheForFiles(filesToPurge);
  
  if (success) {
    console.log('🎉 Cache purge completed successfully!');
    console.log('⏳ Changes should be visible within 1-2 minutes');
  } else {
    console.log('🔄 Falling back to purging entire cache...');
    await purgeEntireCache();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { purgeCacheForFiles, purgeEntireCache, getZoneInfo };
