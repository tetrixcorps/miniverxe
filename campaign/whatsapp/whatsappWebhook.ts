import express, { Request, Response } from 'express';
import { WhatsAppCampaignService } from '../WhatsAppCampaignService';

const router = express.Router();
const whatsappService = new WhatsAppCampaignService();

/**
 * WhatsApp Webhook Verification Endpoint
 * Meta will call this endpoint to verify your webhook URL
 * 
 * @route GET /webhooks/whatsapp
 */
router.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env['WHATSAPP_VERIFY_TOKEN'];

    // Check if the mode and token are correct
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ WhatsApp webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('❌ WhatsApp webhook verification failed');
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('Error in webhook verification:', error);
    res.sendStatus(500);
  }
});

/**
 * WhatsApp Webhook Handler
 * Receives incoming messages, status updates, and other events from WhatsApp
 * 
 * @route POST /webhooks/whatsapp
 */
router.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature for security
    if (!whatsappService.verifyWebhookSignature(signature, body)) {
      console.error('❌ Invalid webhook signature');
      return res.sendStatus(403);
    }

    // Process the webhook payload
    const webhookData = req.body;

    // Log the webhook for debugging
    console.log('📩 WhatsApp webhook received:', JSON.stringify(webhookData, null, 2));

    // Handle the webhook
    await whatsappService.handleWebhook(webhookData);

    // Acknowledge receipt of the webhook
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

/**
 * Send WhatsApp Campaign
 * 
 * @route POST /api/whatsapp/campaigns/send
 */
router.post('/api/whatsapp/campaigns/send', async (req: Request, res: Response) => {
  try {
    const { campaignId, industry, recipients } = req.body;

    if (!industry || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: industry, recipients'
      });
    }

    // Create campaign from template
    const campaign = whatsappService.createCampaignFromTemplate(
      industry,
      campaignId || `${industry}_campaign_${Date.now()}`
    );

    // Send campaign
    const result = await whatsappService.sendCampaign(campaign, recipients);

    res.json(result);
  } catch (error) {
    console.error('Error sending WhatsApp campaign:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get Business Profile
 * 
 * @route GET /api/whatsapp/profile
 */
router.get('/api/whatsapp/profile', async (_req: Request, res: Response) => {
  try {
    const profile = await whatsappService.getBusinessProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update Business Profile
 * 
 * @route POST /api/whatsapp/profile
 */
router.post('/api/whatsapp/profile', async (req: Request, res: Response) => {
  try {
    const profileData = req.body;
    const success = await whatsappService.updateBusinessProfile(profileData);
    
    res.json({ success });
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Validate Phone Number
 * 
 * @route POST /api/whatsapp/validate-phone
 */
router.post('/api/whatsapp/validate-phone', (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        valid: false,
        error: 'Phone number is required'
      });
    }

    const valid = whatsappService.validatePhoneNumber(phoneNumber);

    res.json({ valid, phoneNumber });
  } catch (error) {
    console.error('Error validating phone number:', error);
    res.status(500).json({
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

