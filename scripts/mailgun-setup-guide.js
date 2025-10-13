#!/usr/bin/env node

// Mailgun setup guide and current status
import axios from 'axios';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here';

async function getMailgunStatus() {
  console.log('🔍 Mailgun Account Status and Setup Guide\n');
  
  try {
    // Get account info
    const accountResponse = await axios.get('https://api.mailgun.net/v3/domains', {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      }
    });
    
    console.log('📊 Current Account Status:');
    console.log('='.repeat(40));
    console.log('✅ API Key: Valid');
    console.log('✅ Account: Active');
    console.log(`📧 Domains: ${accountResponse.data.items?.length || 0} configured`);
    
    console.log('\n📋 Available Domains:');
    console.log('='.repeat(30));
    
    if (accountResponse.data.items && accountResponse.data.items.length > 0) {
      accountResponse.data.items.forEach((domain, index) => {
        console.log(`\n${index + 1}. ${domain.name}`);
        console.log(`   State: ${domain.state}`);
        console.log(`   Type: ${domain.type}`);
        console.log(`   Created: ${domain.created_at}`);
        console.log(`   Status: ${domain.state === 'active' ? '✅ Ready to use' : '❌ Needs verification'}`);
      });
    }
    
    // Recommendations
    console.log('\n🎯 Recommendations:');
    console.log('='.repeat(30));
    
    const activeDomain = accountResponse.data.items?.find(d => d.state === 'active');
    if (activeDomain) {
      console.log(`✅ Use domain: ${activeDomain.name}`);
      console.log('   This domain is active and ready for sending emails.');
      console.log('   Update your environment variable:');
      console.log(`   export MAILGUN_DOMAIN="${activeDomain.name}"`);
    } else {
      console.log('❌ No active domains found.');
      console.log('   You need to verify one of the domains first.');
    }
    
    // Setup instructions for tetrixcorp.com
    console.log('\n📝 Setting up tetrixcorp.com:');
    console.log('='.repeat(40));
    console.log('Since you\'ve reached the domain limit, you have two options:');
    console.log('');
    console.log('Option 1: Delete an existing domain and add tetrixcorp.com');
    console.log('  1. Go to Mailgun dashboard');
    console.log('  2. Delete smsmaverick.org (unverified)');
    console.log('  3. Add tetrixcorp.com');
    console.log('  4. Add the required DNS records');
    console.log('');
    console.log('Option 2: Use the sandbox domain for now');
    console.log('  1. Use sandbox93103484a9d34e6688727d42fea082c1.mailgun.org');
    console.log('  2. This domain is already active and ready');
    console.log('  3. Upgrade your Mailgun plan for more domains later');
    
    // DNS records for tetrixcorp.com (when you add it)
    console.log('\n🔧 DNS Records for tetrixcorp.com:');
    console.log('='.repeat(45));
    console.log('When you add tetrixcorp.com, you\'ll need these DNS records:');
    console.log('');
    console.log('1. TXT Record (Domain Verification):');
    console.log('   Name: @');
    console.log('   Value: v=spf1 include:mailgun.org ~all');
    console.log('   TTL: 3600');
    console.log('');
    console.log('2. CNAME Record (DKIM):');
    console.log('   Name: m._domainkey');
    console.log('   Value: m.mailgun.org');
    console.log('   TTL: 3600');
    console.log('');
    console.log('3. TXT Record (DKIM):');
    console.log('   Name: m._domainkey');
    console.log('   Value: (will be provided by Mailgun)');
    console.log('   TTL: 3600');
    console.log('');
    console.log('4. MX Record (Mail Exchange):');
    console.log('   Name: @');
    console.log('   Value: mxa.mailgun.org');
    console.log('   Priority: 10');
    console.log('   TTL: 3600');
    console.log('');
    console.log('   Name: @');
    console.log('   Value: mxb.mailgun.org');
    console.log('   Priority: 10');
    console.log('   TTL: 3600');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Failed to get account status:');
    
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
getMailgunStatus()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
