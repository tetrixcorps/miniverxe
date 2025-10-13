#!/usr/bin/env node

// Get DNS records for domain verification
import axios from 'axios';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here';
const DOMAIN = 'mg.tetrixcorp.com';

async function getDNSRecords() {
  console.log(`🔍 Getting DNS records for domain: ${DOMAIN}\n`);
  
  try {
    // Get DNS records for verification
    const dnsResponse = await axios.get(`https://api.mailgun.net/v3/domains/${DOMAIN}/verification`, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      }
    });
    
    console.log('📋 DNS Records Required for Verification:');
    console.log('='.repeat(60));
    
    if (dnsResponse.data.domain?.dns_records) {
      dnsResponse.data.domain.dns_records.forEach((record, index) => {
        console.log(`\n${index + 1}. ${record.record_type} Record:`);
        console.log(`   Name: ${record.name}`);
        console.log(`   Value: ${record.value}`);
        console.log(`   Priority: ${record.priority || 'N/A'}`);
        console.log(`   Status: ${record.valid ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`   TTL: ${record.ttl || 'Default'}`);
      });
    }
    
    // Get verification status
    console.log('\n📊 Current Verification Status:');
    console.log('='.repeat(40));
    const verificationResponse = await axios.get(`https://api.mailgun.net/v3/domains/${DOMAIN}/verify`, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      }
    });
    
    console.log('   Domain:', verificationResponse.data.domain?.name);
    console.log('   State:', verificationResponse.data.domain?.state);
    console.log('   Is Webhook Signed:', verificationResponse.data.domain?.web_scheme);
    console.log('   Is SMTP:', verificationResponse.data.domain?.smtp_login);
    
    // Instructions
    console.log('\n📝 Instructions for DNS Setup:');
    console.log('='.repeat(50));
    console.log('1. Go to your DNS provider for smsmaverick.org');
    console.log('2. Add the DNS records shown above');
    console.log('3. Wait for DNS propagation (5-15 minutes)');
    console.log('4. Run this script again to verify');
    
    // Alternative: Use sandbox domain
    console.log('\n🔄 Alternative: Use Sandbox Domain');
    console.log('='.repeat(40));
    console.log('Since smsmaverick.org needs verification, you can use the sandbox domain:');
    console.log('   sandbox93103484a9d34e6688727d42fea082c1.mailgun.org');
    console.log('   This domain is already active and ready to use.');
    console.log('   Update your environment variable:');
    console.log('   export MAILGUN_DOMAIN="sandbox93103484a9d34e6688727d42fea082c1.mailgun.org"');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Failed to get DNS records:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.message || error.response.statusText);
    } else {
      console.error('   Error:', error.message);
    }
    
    return false;
  }
}

// Run the script
getDNSRecords()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
