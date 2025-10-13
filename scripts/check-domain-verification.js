#!/usr/bin/env node

// Check domain verification status and get DNS records
import axios from 'axios';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here';
const DOMAIN = 'mg.tetrixcorp.com';

async function checkDomainVerification() {
  console.log(`🔍 Checking domain verification for: ${DOMAIN}\n`);
  
  try {
    // Check domain status
    console.log('1. Checking domain status...');
    const domainResponse = await axios.get(`https://api.mailgun.net/v3/domains/${DOMAIN}`, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      }
    });
    
    console.log('✅ Domain found!');
    console.log('   Domain:', domainResponse.data.domain?.name);
    console.log('   State:', domainResponse.data.domain?.state);
    console.log('   Type:', domainResponse.data.domain?.type);
    console.log('   Created:', domainResponse.data.domain?.created_at);
    
    // Get verification records
    console.log('\n2. Getting verification records...');
    try {
      const verificationResponse = await axios.get(`https://api.mailgun.net/v3/domains/${DOMAIN}/verification`, {
        auth: {
          username: 'api',
          password: MAILGUN_API_KEY
        }
      });
      
      console.log('✅ Verification records retrieved!');
      
      if (verificationResponse.data.domain?.dns_records) {
        console.log('\n📋 DNS Records Required for Verification:');
        console.log('='.repeat(60));
        
        verificationResponse.data.domain.dns_records.forEach((record, index) => {
          console.log(`\n${index + 1}. ${record.record_type} Record:`);
          console.log(`   Name: ${record.name}`);
          console.log(`   Value: ${record.value}`);
          console.log(`   Priority: ${record.priority || 'N/A'}`);
          console.log(`   TTL: ${record.ttl || 'Default'}`);
          console.log(`   Status: ${record.valid ? '✅ Valid' : '❌ Invalid'}`);
        });
      }
      
    } catch (verificationError) {
      console.log('❌ Could not get verification records:', verificationError.response?.status);
      console.log('   This might mean the domain needs to be set up first.');
    }
    
    // Try to get webhook info
    console.log('\n3. Checking webhook configuration...');
    try {
      const webhooksResponse = await axios.get(`https://api.mailgun.net/v3/domains/${DOMAIN}/webhooks`, {
        auth: {
          username: 'api',
          password: MAILGUN_API_KEY
        }
      });
      
      console.log('✅ Webhooks accessible');
      console.log('   Webhook count:', Object.keys(webhooksResponse.data.webhooks || {}).length);
      
    } catch (webhookError) {
      console.log('⚠️  Webhooks not accessible:', webhookError.response?.status);
    }
    
    // Instructions
    console.log('\n📝 Next Steps:');
    console.log('='.repeat(30));
    if (domainResponse.data.domain?.state === 'unverified') {
      console.log('1. Add the DNS records shown above to your domain');
      console.log('2. Wait for DNS propagation (5-15 minutes)');
      console.log('3. Run this script again to verify');
      console.log('4. Once verified, test email sending');
    } else if (domainResponse.data.domain?.state === 'active') {
      console.log('✅ Domain is already verified and ready to use!');
    } else {
      console.log(`Domain state is: ${domainResponse.data.domain?.state}`);
      console.log('Check Mailgun dashboard for more details.');
    }
    
    return domainResponse.data.domain?.state === 'active';
    
  } catch (error) {
    console.error('\n❌ Failed to check domain verification:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.message || error.response.statusText);
      console.error('   Details:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    return false;
  }
}

// Run the check
checkDomainVerification()
  .then(isVerified => {
    if (isVerified) {
      console.log('\n🎉 Domain is verified and ready to use!');
    } else {
      console.log('\n⏳ Domain needs verification. Please add DNS records.');
    }
    process.exit(isVerified ? 0 : 1);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
