#!/usr/bin/env node

/**
 * Simple OAuth Test Script
 * Tests the OAuth endpoints to ensure they're working correctly
 */

const BASE_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:5173';

async function testOAuthEndpoints() {
  console.log('🧪 Testing OAuth Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ Health check: ${healthData.status}\n`);

    // Test 2: OAuth Providers
    console.log('2. Testing OAuth providers endpoint...');
    const providersResponse = await fetch(`${BASE_URL}/api/v1/auth/oauth/providers`);
    const providersData = await providersResponse.json();
    console.log(`   ✅ Providers found: ${providersData.providers.length}`);
    providersData.providers.forEach(provider => {
      console.log(`      - ${provider.name} (${provider.id})`);
    });
    console.log('');

    // Test 3: OAuth Authorization (will fail without credentials, but should return proper error)
    console.log('3. Testing OAuth authorization endpoint...');
    const authResponse = await fetch(
      `${BASE_URL}/api/v1/auth/oauth/authorize/google.com?redirect_uri=${encodeURIComponent(`${FRONTEND_URL}/auth/callback`)}`
    );
    
    if (authResponse.status === 400) {
      console.log('   ✅ Authorization endpoint responding (expected 400 without credentials)');
    } else if (authResponse.status === 429) {
      console.log('   ⚠️  Authorization endpoint rate limited (expected behavior)');
    } else {
      console.log(`   ❌ Unexpected status: ${authResponse.status}`);
    }
    console.log('');

    // Test 4: CORS Headers
    console.log('4. Testing CORS configuration...');
    const corsResponse = await fetch(`${BASE_URL}/api/v1/auth/oauth/providers`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = corsResponse.headers;
    const hasCors = corsHeaders.get('Access-Control-Allow-Origin');
    
    if (hasCors) {
      console.log('   ✅ CORS headers present');
    } else {
      console.log('   ❌ CORS headers missing');
    }
    console.log('');

    console.log('🎉 OAuth integration tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure OAuth provider credentials in .env file');
    console.log('2. Test the frontend OAuth components at http://localhost:5173/auth/test');
    console.log('3. Test the login page at http://localhost:5173/login');
    console.log('4. Follow the setup guide in OAUTH_SETUP.md');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure backend is running: cd apps/api && pnpm dev');
    console.log('2. Ensure frontend is running: cd apps/web && pnpm dev');
    console.log('3. Check that Redis is running: redis-server');
    console.log('4. Verify all import statements use .js extensions');
  }
}

// Run the tests
testOAuthEndpoints(); 