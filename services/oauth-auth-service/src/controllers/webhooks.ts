import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock webhook data store
const webhooks: any[] = [];

// Register webhook
router.post('/register', async (req, res) => {
  try {
    const {
      url,
      events,
      secret,
      customerId,
      description
    } = req.body;

    // Validate required fields
    if (!url || !events || !customerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['url', 'events', 'customerId']
      });
    }

    // Validate events array
    const validEvents = [
      'user.registered',
      'user.login',
      'user.logout',
      'user.updated',
      'token.generated',
      'token.revoked',
      'oauth.authorized',
      'oauth.token_refreshed'
    ];

    const invalidEvents = events.filter((event: string) => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        error: 'Invalid events',
        invalidEvents,
        validEvents
      });
    }

    // Create webhook record
    const webhook = {
      id: uuidv4(),
      url,
      events,
      secret: secret || uuidv4(),
      customerId,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    webhooks.push(webhook);

    res.status(201).json({
      success: true,
      webhook,
      message: 'Webhook registered successfully'
    });
  } catch (error) {
    console.error('Webhook registration error:', error);
    res.status(500).json({
      error: 'Failed to register webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test webhook
router.post('/:webhookId/test', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const { event, data } = req.body;

    const webhook = webhooks.find(w => w.id === webhookId);
    
    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook not found',
        webhookId
      });
    }

    if (webhook.status !== 'active') {
      return res.status(400).json({
        error: 'Webhook not active',
        status: webhook.status
      });
    }

    // Simulate webhook delivery
    const testPayload = {
      id: uuidv4(),
      event: event || 'webhook.test',
      data: data || { test: true, timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      webhookId
    };

    // In production, this would make an actual HTTP request
    console.log(`Testing webhook ${webhookId} to ${webhook.url}:`, testPayload);

    res.status(200).json({
      success: true,
      testPayload,
      message: 'Webhook test initiated'
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    res.status(500).json({
      error: 'Failed to test webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get webhook status
router.get('/:webhookId/status', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhook = webhooks.find(w => w.id === webhookId);
    
    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook not found',
        webhookId
      });
    }
    
    res.status(200).json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        status: webhook.status,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt
      }
    });
  } catch (error) {
    console.error('Get webhook status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve webhook status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update webhook
router.put('/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const { url, events, status, description } = req.body;
    
    const webhookIndex = webhooks.findIndex(w => w.id === webhookId);
    
    if (webhookIndex === -1) {
      return res.status(404).json({
        error: 'Webhook not found',
        webhookId
      });
    }
    
    const webhook = webhooks[webhookIndex];
    
    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (status) webhook.status = status;
    if (description) webhook.description = description;
    
    webhook.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      webhook,
      message: 'Webhook updated successfully'
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({
      error: 'Failed to update webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete webhook
router.delete('/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhookIndex = webhooks.findIndex(w => w.id === webhookId);
    
    if (webhookIndex === -1) {
      return res.status(404).json({
        error: 'Webhook not found',
        webhookId
      });
    }
    
    webhooks.splice(webhookIndex, 1);
    
    res.status(200).json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({
      error: 'Failed to delete webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all webhooks
router.get('/', async (req, res) => {
  try {
    const { customerId, status, limit = 50, offset = 0 } = req.query;
    
    let filteredWebhooks = webhooks;
    
    if (customerId) {
      filteredWebhooks = filteredWebhooks.filter(webhook => webhook.customerId === customerId);
    }
    
    if (status) {
      filteredWebhooks = filteredWebhooks.filter(webhook => webhook.status === status);
    }
    
    const paginatedWebhooks = filteredWebhooks.slice(Number(offset), Number(offset) + Number(limit));
    
    res.status(200).json({
      success: true,
      webhooks: paginatedWebhooks,
      total: filteredWebhooks.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({
      error: 'Failed to retrieve webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
