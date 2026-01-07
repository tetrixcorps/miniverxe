/**
 * Marketing Messages API Onboarding Test
 * 
 * Run from campaign/whatsapp directory:
 *   npx tsx test-onboarding.ts
 * 
 * Or from project root:
 *   npx tsx campaign/whatsapp/test-onboarding.ts
 */

import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory (works for both CommonJS and ES modules)
const __filename = typeof __dirname !== 'undefined' ? __dirname : fileURLToPath(import.meta.url);
const __dirname_path = typeof __dirname !== 'undefined' ? __dirname : dirname(__filename);

// Load environment variables from the current directory
const envPath = resolve(__dirname_path, '.env');
dotenv.config({ path: envPath });

import { WhatsAppCampaignService } from './WhatsAppCampaignService';

async function testOnboardingWorkflow() {
  console.log('🧪 Testing Marketing Messages Onboarding Workflow');
  console.log('------------------------------------------------');

  const service = new WhatsAppCampaignService();

  // 1. Check Eligibility
  console.log('1. Checking Eligibility Status...');
  const eligibility = await service.checkMarketingMessagesEligibility();
  console.log('   Status:', eligibility.status);
  console.log('   Is Eligible:', eligibility.isEligible);
  console.log('   Is Onboarded:', eligibility.isOnboarded);
  
  if (eligibility.data) {
    console.log('   Raw Data:', JSON.stringify(eligibility.data, null, 2));
  }

  // 2. Simulate Sending Marketing Message (Only if onboarded or eligible for test)
  // Note: We won't actually send to a real number to avoid costs/spam, 
  // but we'll prepare the call. If onboarded, we can try with the own phone number.
  
  if (eligibility.isOnboarded) {
    console.log('\n2. ✅ Account is onboarded! Attempting to send test marketing message...');
    
    // Using the business's own number for testing if available, or a placeholder
    const testPhone = process.env['WHATSAPP_PHONE_NUMBER'] || '15555555555';
    
    // Create a dummy campaign to get components
    const campaign = service.createCampaignFromTemplate('construction', 'Test Marketing');
    // Just grab the first component set for a dummy recipient
    const recipient = {
      phoneNumber: testPhone,
      firstName: 'Test User',
      lastName: 'Test',
      company: 'Test Co',
      industry: 'construction',
      email: 'test@example.com',
      customFields: {},
      tags: [],
      status: 'active' as const,
      subscribedAt: new Date()
    };
    
    // We need to access private method or just manually build components for this test
    // For this test script, I'll manually construct a simple component list
    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: 'Test User'
          }
        ]
      }
    ];

    console.log(`   Sending to ${testPhone}...`);
    
    // Format phone number manually since formatPhoneNumber is private
    // Remove all non-digit characters and ensure + prefix
    const digits = testPhone.replace(/\D/g, '');
    const formattedPhone = testPhone.startsWith('+') 
      ? testPhone 
      : (digits.length === 10 ? `+1${digits}` : `+${digits}`);
    
    const sendResult = await service.sendMarketingMessage(
      formattedPhone,
      campaign.templateName,
      'en_US',
      components
    );

    if (sendResult.success) {
      console.log('   ✅ Message Sent! ID:', sendResult.messageId);
    } else {
      console.log('   ❌ Send Failed:', sendResult.error);
    }

  } else {
    console.log('\n2. ⏭️ Account not yet onboarded. Skipping send test.');
    console.log('   To onboard: Go to Meta App Dashboard > WhatsApp > Quickstart');
    console.log('   and click "Get started" on "Improve ROI with Marketing Messages API".');
  }

  console.log('\n------------------------------------------------');
  console.log('Test Complete');
}

testOnboardingWorkflow().catch(console.error);

