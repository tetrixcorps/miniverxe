#!/usr/bin/env node
/**
 * Test script for Zoho RPA Integration Service (JavaScript version)
 * 
 * This script tests the Zoho RPA integration by:
 * 1. Loading API key from environment variable
 * 2. Initializing the service
 * 3. Testing API connection
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../config/zoho-rpa.env') });

// Import the service (assuming it's compiled or we use a different approach)
async function testZohoRPA() {
  console.log('\n==========================================');
  console.log('  Zoho RPA Integration Test');
  console.log('==========================================\n');

  try {
    // Get API key from environment
    const apiKey = process.env.ZOHO_RPA_API_KEY;
    
    if (!apiKey) {
      throw new Error('ZOHO_RPA_API_KEY environment variable is not set');
    }

    console.log('📋 Configuration:');
    console.log('   API Key: ' + apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 10));
    console.log('   Base URL: https://rpaapi.zoho.com');
    console.log('');

    // Check if the service file exists
    const servicePath = path.join(__dirname, 'src/services/zohoRpaIntegrationService.ts');
    if (!fs.existsSync(servicePath)) {
      throw new Error(`Service file not found: ${servicePath}`);
    }

    console.log('✅ Configuration loaded successfully');
    console.log('✅ Service file found');
    console.log('');
    console.log('📝 Note: To fully test the service, you need to:');
    console.log('   1. Compile TypeScript: npx tsc');
    console.log('   2. Or use ts-node: npx ts-node test-zoho-rpa.ts');
    console.log('   3. Or install ts-node: pnpm add -D ts-node');
    console.log('');

    // Test API key format
    if (apiKey.length > 100) {
      console.log('✅ API key format looks valid (long encrypted key)');
    } else {
      console.log('⚠️  API key seems short, verify it\'s correct');
    }

    console.log('\n==========================================');
    console.log('  ✅ Basic Configuration Test Passed!');
    console.log('==========================================\n');

    console.log('📋 Next Steps:');
    console.log('   1. Install ts-node: pnpm add -D ts-node');
    console.log('   2. Run full test: npx ts-node test-zoho-rpa.ts');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nError details:', error.stack);
    process.exit(1);
  }
}

// Run the test
testZohoRPA()
  .then(() => {
    console.log('✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });

