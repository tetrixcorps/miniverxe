#!/usr/bin/env node

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Test environment configuration
import { env, validateEnvironment, getEnvironmentInfo } from './src/lib/env.js';

async function testEnvironmentConfig() {
  try {
    console.log('🔍 Testing Environment Configuration...\n');
    
    // Display environment info
    const envInfo = getEnvironmentInfo();
    console.log('📊 Environment Information:');
    console.log(`   Node Environment: ${envInfo.nodeEnv}`);
    console.log(`   Site URL: ${envInfo.siteUrl}`);
    console.log(`   Firebase Project: ${envInfo.firebaseProjectId}`);
    console.log(`   Mailgun Domain: ${envInfo.mailgunDomain}`);
    console.log(`   Has Mailgun Key: ${envInfo.hasMailgunKey ? '✅' : '❌'}`);
    console.log(`   Has Telnyx Key: ${envInfo.hasTelnyxKey ? '✅' : '❌'}`);
    console.log(`   Has Sinch Key: ${envInfo.hasSinchKey ? '✅' : '❌'}`);
    
    console.log('\n🧪 Validating Environment Variables...');
    
    // Validate environment
    const isValid = validateEnvironment();
    
    if (isValid) {
      console.log('✅ Environment validation passed!');
      
      // Test Firebase config
      console.log('\n🔥 Firebase Configuration:');
      console.log(`   API Key: ${env.firebase.apiKey.substring(0, 10)}...`);
      console.log(`   Project ID: ${env.firebase.projectId}`);
      console.log(`   Auth Domain: ${env.firebase.authDomain}`);
      
      // Test Mailgun config
      console.log('\n📧 Mailgun Configuration:');
      console.log(`   API Key: ${env.mailgun.apiKey ? env.mailgun.apiKey.substring(0, 10) + '...' : 'Not set'}`);
      console.log(`   Domain: ${env.mailgun.domain}`);
      
      console.log('\n🎉 Environment configuration test completed successfully!');
    } else {
      console.log('❌ Environment validation failed!');
      console.log('Please check your .env file and ensure all required variables are set.');
    }
    
  } catch (error) {
    console.error('❌ Environment test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testEnvironmentConfig();
