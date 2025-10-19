#!/usr/bin/env node
// Campaign Execution Script
// Executes email and SMS campaigns for construction, fleet, and healthcare industries

// Load environment variables from .env file
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
const envPath = path.join(__dirname, '..', '..', '.env');
console.log('🔧 Loading environment from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ Environment loaded successfully');
  console.log('📧 MAILGUN_API_KEY:', process.env['MAILGUN_API_KEY'] ? '✅ Set' : '❌ Not set');
  console.log('📧 MAILGUN_DOMAIN:', process.env['MAILGUN_DOMAIN'] || 'Not set');
}

import { EmailCampaignService } from './email/EmailCampaignService';
import { SMSCampaignService } from './sms/SMSCampaignService';
import { SalesFunnelService } from './SalesFunnelService';
import { CampaignManager } from './api/CampaignManager';

// Sample lead data for testing
const sampleLeads = [
  // Construction Industry Leads
  {
    email: 'john.smith@constructionco.com',
    phoneNumber: '+15551234567',
    firstName: 'John',
    lastName: 'Smith',
    company: 'Smith Construction Co.',
    industry: 'construction' as const,
    source: 'website' as const,
    customFields: { projectCount: 15, safetyScore: 95 },
    tags: ['general-contractor', 'commercial']
  },
  {
    email: 'sarah.johnson@buildright.com',
    phoneNumber: '+15551234568',
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'BuildRight Construction',
    industry: 'construction' as const,
    source: 'referral' as const,
    customFields: { projectCount: 8, safetyScore: 88 },
    tags: ['residential', 'renovation']
  },
  {
    email: 'mike.davis@megaconstruction.com',
    phoneNumber: '+15551234569',
    firstName: 'Mike',
    lastName: 'Davis',
    company: 'Mega Construction Group',
    industry: 'construction' as const,
    source: 'email' as const,
    customFields: { projectCount: 25, safetyScore: 92 },
    tags: ['commercial', 'infrastructure']
  },

  // Fleet Management Leads
  {
    email: 'lisa.wilson@fleetlogistics.com',
    phoneNumber: '+15551234570',
    firstName: 'Lisa',
    lastName: 'Wilson',
    company: 'Fleet Logistics Inc.',
    industry: 'fleet' as const,
    source: 'website' as const,
    customFields: { fleetSize: 45, deliveryCount: 200 },
    tags: ['logistics', 'delivery']
  },
  {
    email: 'robert.brown@transitco.com',
    phoneNumber: '+15551234571',
    firstName: 'Robert',
    lastName: 'Brown',
    company: 'Transit Co.',
    industry: 'fleet' as const,
    source: 'sms' as const,
    customFields: { fleetSize: 12, deliveryCount: 80 },
    tags: ['transportation', 'local']
  },
  {
    email: 'jennifer.garcia@shippingpro.com',
    phoneNumber: '+15551234572',
    firstName: 'Jennifer',
    lastName: 'Garcia',
    company: 'Shipping Pro',
    industry: 'fleet' as const,
    source: 'referral' as const,
    customFields: { fleetSize: 30, deliveryCount: 150 },
    tags: ['shipping', 'national']
  },

  // Healthcare Leads
  {
    email: 'dr.james.miller@healthcare.com',
    phoneNumber: '+15551234573',
    firstName: 'Dr. James',
    lastName: 'Miller',
    company: 'Miller Medical Group',
    industry: 'healthcare' as const,
    source: 'website' as const,
    customFields: { patientCount: 500, appointmentCount: 50 },
    tags: ['primary-care', 'family-medicine']
  },
  {
    email: 'nurse.sarah.anderson@clinic.com',
    phoneNumber: '+15551234574',
    firstName: 'Sarah',
    lastName: 'Anderson',
    company: 'Anderson Family Clinic',
    industry: 'healthcare' as const,
    source: 'email' as const,
    customFields: { patientCount: 300, appointmentCount: 35 },
    tags: ['clinic', 'family-medicine']
  },
  {
    email: 'admin@specialtycare.com',
    phoneNumber: '+15551234575',
    firstName: 'Michael',
    lastName: 'Taylor',
    company: 'Specialty Care Center',
    industry: 'healthcare' as const,
    source: 'referral' as const,
    customFields: { patientCount: 800, appointmentCount: 75 },
    tags: ['specialty', 'multi-specialty']
  }
];

async function executeCampaigns() {
  console.log('🚀 Starting TETRIX Campaign Execution...\n');

  try {
    // Initialize services
    console.log('📧 Initializing Email Campaign Service...');
    const emailService = new EmailCampaignService();
    
    console.log('📱 Initializing SMS Campaign Service...');
    const smsService = new SMSCampaignService();
    
    console.log('🎯 Initializing Sales Funnel Service...');
    const funnelService = new SalesFunnelService();
    
    console.log('🎪 Initializing Campaign Manager...');
    const campaignManager = new CampaignManager({
      emailService,
      smsService,
      funnelService
    });

    // Campaign configuration
    const campaignConfig = {
      campaignName: 'TETRIX Industry Dashboard Launch',
      fromEmail: 'noreply@tetrixcorp.com',
      fromName: 'TETRIX Team',
      replyTo: 'support@tetrixcorp.com',
      fromNumber: '+15551234567' // Your Telnyx phone number
    };

    console.log('\n📊 Campaign Configuration:');
    console.log(`Campaign Name: ${campaignConfig.campaignName}`);
    console.log(`From Email: ${campaignConfig.fromEmail}`);
    console.log(`From Name: ${campaignConfig.fromName}`);
    console.log(`Reply To: ${campaignConfig.replyTo}`);
    console.log(`From Number: ${campaignConfig.fromNumber}`);
    console.log(`Total Leads: ${sampleLeads.length}`);

    // Execute campaigns for all industries
    console.log('\n🎯 Executing Industry Campaigns...');
    const results = await campaignManager.executeAllIndustryCampaigns(
      sampleLeads,
      campaignConfig.campaignName,
      campaignConfig.fromEmail,
      campaignConfig.fromName,
      campaignConfig.replyTo,
      campaignConfig.fromNumber
    );

    // Display results
    console.log('\n📈 Campaign Results:');
    console.log('='.repeat(50));
    
    results.forEach(result => {
      console.log(`\n🏭 ${result.industry.toUpperCase()} Industry:`);
      console.log(`   Campaign ID: ${result.campaignId}`);
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   Total Recipients: ${result.totalRecipients}`);
      console.log(`   Total Sent: ${result.totalSent}`);
      console.log(`   Total Failed: ${result.totalFailed}`);
      console.log(`   Execution Time: ${result.executionTime}ms`);
      
      if (result.emailResults) {
        console.log(`   📧 Email: ${result.emailResults.sentCount} sent, ${result.emailResults.failedCount} failed`);
        if (result.emailResults.error) {
          console.log(`   Email Error: ${result.emailResults.error}`);
        }
      }
      
      if (result.smsResults) {
        console.log(`   📱 SMS: ${result.smsResults.sentCount} sent, ${result.smsResults.failedCount} failed`);
        if (result.smsResults.error) {
          console.log(`   SMS Error: ${result.smsResults.error}`);
        }
      }
      
      if (result.funnelResults) {
        console.log(`   🎯 Funnel: ${result.funnelResults.leadsAdded} leads added, ${result.funnelResults.highValueLeads} high-value`);
      }
    });

    // Get campaign analytics
    console.log('\n📊 Campaign Analytics:');
    console.log('='.repeat(50));
    
    const analytics = campaignManager.getCampaignAnalytics();
    console.log(`Total Leads: ${analytics.totalLeads}`);
    console.log(`Conversion Rate: ${analytics.conversionRates['construction']?.toFixed(1) || '0.0'}% (Construction)`);
    console.log(`Conversion Rate: ${analytics.conversionRates['fleet']?.toFixed(1) || '0.0'}% (Fleet)`);
    console.log(`Conversion Rate: ${analytics.conversionRates['healthcare']?.toFixed(1) || '0.0'}% (Healthcare)`);
    console.log(`Total Revenue: $${analytics.revenue.toLocaleString()}`);
    console.log(`Leads Needing Attention: ${analytics.leadsNeedingAttention}`);

    // Get lead recommendations
    console.log('\n💡 Lead Recommendations:');
    console.log('='.repeat(50));
    
    const recommendations = campaignManager.getLeadRecommendations();
    console.log(`High-Value Leads: ${recommendations.highValueLeads.length}`);
    console.log(`Leads Needing Attention: ${recommendations.leadsNeedingAttention.length}`);
    console.log('\nNext Actions:');
    recommendations.nextActions.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action}`);
    });

    // Export campaign data
    console.log('\n📁 Exporting Campaign Data...');
    const csvData = campaignManager.exportCampaignData('csv');
    const jsonData = campaignManager.exportCampaignData('json');
    
    // In a real implementation, you would save these to files
    console.log(`CSV Data Length: ${csvData.length} characters`);
    console.log(`JSON Data Length: ${jsonData.length} characters`);

    console.log('\n✅ Campaign execution completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Monitor email and SMS delivery rates');
    console.log('2. Track lead engagement and responses');
    console.log('3. Follow up with high-value leads');
    console.log('4. Analyze campaign performance metrics');
    console.log('5. Optimize campaigns based on results');

  } catch (error) {
    console.error('\n❌ Campaign execution failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Execute the campaign if this script is run directly
if (require.main === module) {
  executeCampaigns().catch(console.error);
}

export { executeCampaigns, sampleLeads };
