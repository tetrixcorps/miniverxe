#!/usr/bin/env node
/**
 * Marketing Messages API Onboarding Test
 * 
 * Run this script from the campaign/whatsapp directory:
 *   npx tsx test-onboarding.ts
 * 
 * Or from the project root:
 *   npx tsx campaign/whatsapp/test-onboarding.ts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  console.log('Loading env from:', envPath);
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    console.error('   Please create it from env.example');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    }
  });
  
  console.log('✅ Environment variables loaded');
}

loadEnv();

const config = {
  accessToken: process.env['WHATSAPP_ACCESS_TOKEN'],
  phoneNumberId: process.env['WHATSAPP_PHONE_NUMBER_ID'],
  businessAccountId: process.env['WHATSAPP_BUSINESS_ACCOUNT_ID'],
  apiVersion: process.env['WHATSAPP_API_VERSION'] || 'v21.0',
  apiBaseUrl: process.env['WHATSAPP_API_BASE_URL'] || 'https://graph.facebook.com'
};

console.log('\n🧪 Testing Marketing Messages Onboarding Workflow');
console.log('================================================\n');

// Validate configuration
if (!config.accessToken) {
  console.error('❌ WHATSAPP_ACCESS_TOKEN is required');
  process.exit(1);
}

if (!config.businessAccountId) {
  console.error('❌ WHATSAPP_BUSINESS_ACCOUNT_ID is required');
  process.exit(1);
}

// Test 1: Check Eligibility Status
async function checkEligibility() {
  return new Promise((resolve, reject) => {
    console.log('1. Checking Marketing Messages API Eligibility...');
    
    const options = {
      hostname: 'graph.facebook.com',
      path: `/${config.apiVersion}/${config.businessAccountId}?fields=marketing_messages_onboarding_status`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (res.statusCode === 200) {
            const status = json.marketing_messages_onboarding_status || 'UNKNOWN';
            const isEligible = status === 'ELIGIBLE';
            const isOnboarded = status === 'ONBOARDED';
            
            console.log(`   Status: ${status}`);
            console.log(`   Is Eligible: ${isEligible}`);
            console.log(`   Is Onboarded: ${isOnboarded}`);
            console.log(`   Full Response:`, JSON.stringify(json, null, 2));
            
            resolve({ status, isEligible, isOnboarded, data: json });
          } else {
            console.error('   ❌ API Error:', json);
            reject(new Error(`API returned ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          console.error('   ❌ Failed to parse response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('   ❌ Request Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run the test
checkEligibility()
  .then((result) => {
    console.log('\n================================================');
    
    if (result.isOnboarded) {
      console.log('✅ SUCCESS: Account is onboarded to Marketing Messages API!');
      console.log('   You can now use sendMarketingMessage() to send optimized messages.');
    } else if (result.isEligible) {
      console.log('⚠️  Account is eligible but not yet onboarded.');
      console.log('   To onboard:');
      console.log('   1. Go to https://developers.facebook.com/apps/');
      console.log('   2. Select your app');
      console.log('   3. Navigate to WhatsApp > Quickstart');
      console.log('   4. Click "Get started" on "Improve ROI with Marketing Messages API"');
    } else {
      console.log('❌ Account is not eligible for Marketing Messages API.');
      console.log('   Status:', result.status);
      console.log('   Check the response above for details.');
    }
    
    console.log('\nTest Complete');
  })
  .catch((error) => {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  });

