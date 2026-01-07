import { describe, it, expect, beforeAll } from 'vitest';
import { WhatsAppCampaignService } from './WhatsAppCampaignService';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

describe('WhatsApp Integration Functional Test', () => {
  let whatsappService: WhatsAppCampaignService;

  beforeAll(() => {
    // Ensure we have the credentials
    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      console.warn('⚠️ WHATSAPP_ACCESS_TOKEN not found in environment');
    }
    
    whatsappService = new WhatsAppCampaignService();
  });

  it('should authenticate and fetch business profile', async () => {
    console.log('🔄 Testing WhatsApp connection...');
    console.log(`📱 Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    console.log(`💼 Business Account ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}`);
    
    try {
      const profile = await whatsappService.getBusinessProfile();
      
      console.log('✅ Connection Successful!');
      console.log('📊 Business Profile Data:', JSON.stringify(profile, null, 2));
      
      expect(profile).toBeDefined();
      // If the token is valid, we should get some data back, even if empty object if profile not set
      // Usually it returns an object with "data" array or specific fields
      expect(profile).not.toBeNull();
      
      if (profile.error) {
        throw new Error(`API Error: ${profile.error.message}`);
      }
    } catch (error) {
      console.error('❌ Connection Failed:', error);
      throw error;
    }
  });

  it('should validate the configured phone number', () => {
    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
    if (phoneNumber) {
      const isValid = whatsappService.validatePhoneNumber(phoneNumber);
      console.log(`📞 Validating configured phone number (${phoneNumber}): ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      expect(isValid).toBe(true);
    } else {
      console.warn('⚠️ WHATSAPP_PHONE_NUMBER not configured');
    }
  });
});

