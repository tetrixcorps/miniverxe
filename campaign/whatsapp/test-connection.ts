console.log('Starting test script...');

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the campaign/whatsapp directory
const envPath = resolve(__dirname, '.env');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded.');
}

import { WhatsAppCampaignService } from './WhatsAppCampaignService';

async function testConnection() {
  console.log('Testing WhatsApp Business Platform Connection...');
  console.log('------------------------------------------------');

  try {
    const service = new WhatsAppCampaignService();
    console.log('✅ Service initialized');

    console.log('Fetching Business Profile...');
    const profile = await service.getBusinessProfile();

    if (profile) {
      console.log('✅ Connection Successful!');
      console.log('------------------------------------------------');
      console.log('Business Profile Data:');
      console.log(JSON.stringify(profile, null, 2));
    } else {
      console.log('❌ Failed to fetch profile (returned null)');
    }

  } catch (error) {
    console.error('❌ Connection Failed:');
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }
  }
}

testConnection().catch(err => console.error('Unhandled error:', err));
