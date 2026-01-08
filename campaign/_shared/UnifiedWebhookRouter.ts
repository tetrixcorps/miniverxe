// campaign/_shared/UnifiedWebhookRouter.ts

import { WhatsAppCampaignService } from '../whatsapp/WhatsAppCampaignService';
import { FacebookPageService } from '../facebook/FacebookPageService';
import { InstagramService } from '../instagram/InstagramService';

/**
 * Unified Webhook Router
 * 
 * Routes webhook events to appropriate platform handlers
 * Provides centralized logging, monitoring, and error handling
 */

export type WebhookPlatform = 'whatsapp' | 'facebook' | 'instagram';

export interface WebhookEvent {
  platform: WebhookPlatform;
  timestamp: number;
  payload: any;
  signature?: string;
  verified: boolean;
}

export interface WebhookProcessingResult {
  success: boolean;
  platform: WebhookPlatform;
  eventType?: string;
  error?: string;
  processingTime: number;
}

export class UnifiedWebhookRouter {
  private whatsappService: WhatsAppCampaignService;
  private facebookService: FacebookPageService;
  private instagramService: InstagramService;

  constructor() {
    this.whatsappService = new WhatsAppCampaignService();
    this.facebookService = new FacebookPageService();
    this.instagramService = new InstagramService();
  }

  // ==========================================================================
  // WEBHOOK ROUTING
  // ==========================================================================

  /**
   * Route webhook to appropriate platform handler
   */
  async routeWebhook(
    platform: WebhookPlatform,
    signature: string,
    body: string
  ): Promise<WebhookProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`🔀 Routing ${platform} webhook...`);

      // Verify signature first
      const verified = await this.verifySignature(platform, signature, body);
      if (!verified) {
        console.error(`❌ ${platform} webhook signature verification failed`);
        return {
          success: false,
          platform,
          error: 'Invalid signature',
          processingTime: Date.now() - startTime,
        };
      }

      // Parse payload
      const payload = JSON.parse(body);

      // Create webhook event
      const webhookEvent: WebhookEvent = {
        platform,
        timestamp: Date.now(),
        payload,
        signature,
        verified: true,
      };

      // Route to platform-specific handler
      let success = false;
      let eventType: string | undefined;

      switch (platform) {
        case 'whatsapp':
          success = await this.whatsappService.handleWebhook(payload);
          eventType = this.extractWhatsAppEventType(payload);
          break;

        case 'facebook':
          success = await this.facebookService.handleWebhook(payload);
          eventType = this.extractFacebookEventType(payload);
          break;

        case 'instagram':
          success = await this.instagramService.handleWebhook(payload);
          eventType = this.extractInstagramEventType(payload);
          break;

        default:
          console.error(`❌ Unknown platform: ${platform}`);
          return {
            success: false,
            platform,
            error: 'Unknown platform',
            processingTime: Date.now() - startTime,
          };
      }

      const processingTime = Date.now() - startTime;

      console.log(`✅ ${platform} webhook processed in ${processingTime}ms`);

      // Log webhook event (for analytics)
      await this.logWebhookEvent(webhookEvent, success, processingTime);

      return {
        success,
        platform,
        eventType,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Error routing ${platform} webhook:`, error);

      return {
        success: false,
        platform,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      };
    }
  }

  // ==========================================================================
  // SIGNATURE VERIFICATION
  // ==========================================================================

  /**
   * Verify webhook signature for any platform
   */
  private async verifySignature(
    platform: WebhookPlatform,
    signature: string,
    body: string
  ): Promise<boolean> {
    try {
      switch (platform) {
        case 'whatsapp':
          return this.whatsappService.verifyWebhookSignature(signature, body);

        case 'facebook':
          return this.facebookService.verifyWebhookSignature(signature, body);

        case 'instagram':
          return this.instagramService.verifyWebhookSignature(signature, body);

        default:
          console.error(`❌ Unknown platform for signature verification: ${platform}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Signature verification error for ${platform}:`, error);
      return false;
    }
  }

  // ==========================================================================
  // WEBHOOK VERIFICATION (GET requests)
  // ==========================================================================

  /**
   * Verify webhook endpoint for any platform
   */
  verifyWebhookEndpoint(
    platform: WebhookPlatform,
    mode: string,
    token: string,
    challenge: string
  ): string | null {
    try {
      switch (platform) {
        case 'whatsapp':
          return this.whatsappService.verifyWebhookSignature(token, challenge) ? challenge : null;

        case 'facebook':
          return this.facebookService.verifyWebhookEndpoint(mode, token, challenge);

        case 'instagram':
          return this.instagramService.verifyWebhookEndpoint(mode, token, challenge);

        default:
          console.error(`❌ Unknown platform for endpoint verification: ${platform}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ Endpoint verification error for ${platform}:`, error);
      return null;
    }
  }

  // ==========================================================================
  // EVENT TYPE EXTRACTION
  // ==========================================================================

  /**
   * Extract event type from WhatsApp webhook
   */
  private extractWhatsAppEventType(payload: any): string | undefined {
    try {
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      return changes?.field;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract event type from Facebook webhook
   */
  private extractFacebookEventType(payload: any): string | undefined {
    try {
      const entry = payload.entry?.[0];
      
      // Check for messaging events
      if (entry?.messaging && entry.messaging.length > 0) {
        const messagingEvent = entry.messaging[0];
        if (messagingEvent.message) return 'message';
        if (messagingEvent.postback) return 'postback';
        if (messagingEvent.delivery) return 'delivery';
        if (messagingEvent.read) return 'read';
        if (messagingEvent.optin) return 'optin';
        if (messagingEvent.referral) return 'referral';
        if (messagingEvent.reaction) return 'reaction';
      }

      // Check for change events
      if (entry?.changes && entry.changes.length > 0) {
        return entry.changes[0].field;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract event type from Instagram webhook
   */
  private extractInstagramEventType(payload: any): string | undefined {
    try {
      const entry = payload.entry?.[0];
      
      // Check for messaging events
      if (entry?.messaging && entry.messaging.length > 0) {
        const messagingEvent = entry.messaging[0];
        if (messagingEvent.message) return 'message';
        if (messagingEvent.postback) return 'postback';
        if (messagingEvent.delivery) return 'delivery';
        if (messagingEvent.read) return 'read';
        if (messagingEvent.optin) return 'optin';
        if (messagingEvent.reaction) return 'reaction';
      }

      // Check for change events
      if (entry?.changes && entry.changes.length > 0) {
        return entry.changes[0].field;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  // ==========================================================================
  // LOGGING AND ANALYTICS
  // ==========================================================================

  /**
   * Log webhook event for analytics
   */
  private async logWebhookEvent(
    event: WebhookEvent,
    success: boolean,
    processingTime: number
  ): Promise<void> {
    try {
      // TODO: Store in database for analytics
      console.log(`📊 Webhook logged:`, {
        platform: event.platform,
        timestamp: event.timestamp,
        success,
        processingTime,
      });

      // TODO: Update metrics
      // - Total webhooks received per platform
      // - Success/failure rates
      // - Average processing time
      // - Event type distribution
    } catch (error) {
      console.error('❌ Failed to log webhook event:', error);
    }
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Check health of all webhook services
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    platforms: Record<WebhookPlatform, boolean>;
  }> {
    const platformHealth: Record<WebhookPlatform, boolean> = {
      whatsapp: false,
      facebook: false,
      instagram: false,
    };

    try {
      // Check WhatsApp service
      platformHealth.whatsapp = !!this.whatsappService;

      // Check Facebook service
      platformHealth.facebook = !!this.facebookService;

      // Check Instagram service
      platformHealth.instagram = !!this.instagramService;

      const healthy = Object.values(platformHealth).every(h => h);

      return { healthy, platforms: platformHealth };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { healthy: false, platforms: platformHealth };
    }
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get webhook statistics
   * TODO: Implement with database queries
   */
  async getStatistics(): Promise<{
    total: number;
    byPlatform: Record<WebhookPlatform, number>;
    successRate: number;
    averageProcessingTime: number;
  }> {
    // Placeholder - implement with actual database queries
    return {
      total: 0,
      byPlatform: {
        whatsapp: 0,
        facebook: 0,
        instagram: 0,
      },
      successRate: 0,
      averageProcessingTime: 0,
    };
  }
}

