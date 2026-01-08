// campaign/instagram/InstagramService.ts

import crypto from 'crypto';
import type {
  InstagramWebhookEvent,
  InstagramMessage,
  InstagramComment,
  InstagramMention,
  MetaInstagramWebhookPayload,
} from './schemas/instagram-webhooks.schema';

/**
 * Instagram Service
 * 
 * Handles all Instagram webhooks including:
 * - Instagram Direct Messages
 * - Comments on posts/reels
 * - @mentions in stories/posts
 * - Story insights
 * - Live video comments
 * 
 * Documentation:
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/instagram
 * https://developers.facebook.com/docs/instagram-api
 */
export class InstagramService {
  private appSecret: string;
  private instagramAccessToken: string;
  private verifyToken: string;

  constructor() {
    this.appSecret = process.env['INSTAGRAM_APP_SECRET'] || process.env['FACEBOOK_APP_SECRET'] || '';
    this.instagramAccessToken = process.env['INSTAGRAM_ACCESS_TOKEN'] || '';
    this.verifyToken = process.env['INSTAGRAM_VERIFY_TOKEN'] || '';

    if (!this.appSecret) {
      console.warn('⚠️ INSTAGRAM_APP_SECRET not configured');
    }
    if (!this.instagramAccessToken) {
      console.warn('⚠️ INSTAGRAM_ACCESS_TOKEN not configured');
    }
  }

  // ==========================================================================
  // WEBHOOK VERIFICATION
  // ==========================================================================

  /**
   * Verify webhook signature using HMAC SHA-256
   * 
   * Meta sends signature in header: x-hub-signature-256
   * Format: sha256=<signature>
   */
  verifyWebhookSignature(signature: string, body: string): boolean {
    if (!signature || !this.appSecret) {
      console.error('❌ Missing signature or app secret');
      return false;
    }

    try {
      // Remove 'sha256=' prefix
      const signatureHash = signature.replace('sha256=', '');

      // Calculate expected signature
      const expectedHash = crypto
        .createHmac('sha256', this.appSecret)
        .update(body)
        .digest('hex');

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signatureHash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  }

  /**
   * Verify webhook endpoint (GET request from Meta)
   */
  verifyWebhookEndpoint(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('✅ Instagram webhook verified successfully');
      return challenge;
    }
    console.error('❌ Instagram webhook verification failed');
    return null;
  }

  // ==========================================================================
  // MAIN WEBHOOK HANDLER
  // ==========================================================================

  /**
   * Main webhook processing entry point
   */
  async handleWebhook(webhookData: MetaInstagramWebhookPayload): Promise<boolean> {
    try {
      console.log('📩 Instagram webhook received:', JSON.stringify(webhookData, null, 2));

      if (webhookData.object !== 'instagram') {
        console.warn(`⚠️ Unexpected webhook object type: ${webhookData.object}`);
        return false;
      }

      // Process each entry
      for (const entry of webhookData.entry) {
        const instagramId = entry.id;
        const timestamp = entry.time;

        // Process messaging events (Instagram DMs)
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            await this.processMessagingEvent(instagramId, messagingEvent, timestamp);
          }
        }

        // Process change events (Comments, Mentions, etc.)
        if (entry.changes) {
          for (const change of entry.changes) {
            await this.processChangeEvent(instagramId, change, timestamp);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to process Instagram webhook:', error);
      return false;
    }
  }

  // ==========================================================================
  // MESSAGING EVENT PROCESSORS
  // ==========================================================================

  /**
   * Process Instagram messaging events (DMs)
   */
  private async processMessagingEvent(
    instagramId: string,
    messagingEvent: any,
    timestamp: number
  ): Promise<void> {
    const sender = messagingEvent.sender?.id;
    const recipient = messagingEvent.recipient?.id;

    console.log(`🔔 Instagram messaging event from ${sender} to ${recipient}`);

    // Message
    if (messagingEvent.message) {
      await this.processMessage(instagramId, messagingEvent, timestamp);
    }

    // Postback (button clicks, ice breakers)
    if (messagingEvent.postback) {
      await this.processPostback(instagramId, messagingEvent, timestamp);
    }

    // Delivery confirmation
    if (messagingEvent.delivery) {
      await this.processDelivery(instagramId, messagingEvent, timestamp);
    }

    // Read receipt
    if (messagingEvent.read) {
      await this.processRead(instagramId, messagingEvent, timestamp);
    }

    // Opt-in
    if (messagingEvent.optin) {
      await this.processOptin(instagramId, messagingEvent, timestamp);
    }

    // Referral
    if (messagingEvent.referral) {
      await this.processReferral(instagramId, messagingEvent, timestamp);
    }

    // Reaction
    if (messagingEvent.reaction) {
      await this.processMessageReaction(instagramId, messagingEvent, timestamp);
    }
  }

  /**
   * Process incoming Instagram DM
   */
  private async processMessage(instagramId: string, event: any, timestamp: number): Promise<void> {
    const message = event.message;
    const senderId = event.sender.id;

    console.log(`💬 Instagram DM from ${senderId}: ${message.text || '[attachment]'}`);

    // Check for attachments
    if (message.attachments) {
      for (const attachment of message.attachments) {
        console.log(`📎 Attachment type: ${attachment.type}`);
        
        // Handle story replies/mentions
        if (attachment.type === 'story_mention') {
          console.log(`📖 Story mention/reply`);
          if (attachment.payload?.url) {
            console.log(`🔗 Story URL: ${attachment.payload.url}`);
          }
        }
        
        // Handle shared posts
        if (attachment.type === 'share') {
          console.log(`🔄 Shared post/reel`);
        }
      }
    }

    // TODO: Store message in database
    // TODO: Trigger auto-response if configured
    // TODO: Route to human agent if needed
    // TODO: Update conversation thread

    // Check for opt-out keywords
    if (message.text) {
      const optOutKeywords = ['stop', 'unsubscribe', 'opt-out', 'optout'];
      if (optOutKeywords.some(keyword => message.text.toLowerCase().includes(keyword))) {
        console.log(`🚫 Opt-out request detected from ${senderId}`);
        await this.handleOptOut(senderId, instagramId);
      }
    }
  }

  /**
   * Process postback (button click, ice breaker)
   */
  private async processPostback(instagramId: string, event: any, timestamp: number): Promise<void> {
    const postback = event.postback;
    const senderId = event.sender.id;

    console.log(`🔘 Instagram postback from ${senderId}: ${postback.title}`);
    console.log(`📦 Payload: ${postback.payload}`);

    // TODO: Handle postback based on payload
    // TODO: Trigger appropriate workflow
  }

  /**
   * Process delivery confirmation
   */
  private async processDelivery(instagramId: string, event: any, timestamp: number): Promise<void> {
    const delivery = event.delivery;
    const senderId = event.sender.id;

    console.log(`✅ Instagram messages delivered to ${senderId}`);
    console.log(`⏰ Watermark: ${new Date(delivery.watermark).toISOString()}`);

    // TODO: Update message status in database
  }

  /**
   * Process read receipt
   */
  private async processRead(instagramId: string, event: any, timestamp: number): Promise<void> {
    const read = event.read;
    const senderId = event.sender.id;

    console.log(`👁️ Instagram messages read by ${senderId}`);
    console.log(`⏰ Watermark: ${new Date(read.watermark).toISOString()}`);

    // TODO: Update message read status in database
  }

  /**
   * Process opt-in
   */
  private async processOptin(instagramId: string, event: any, timestamp: number): Promise<void> {
    const optin = event.optin;
    const senderId = event.sender.id;

    console.log(`✅ Instagram user ${senderId} opted in`);
    console.log(`📝 Ref: ${optin.ref}`);

    // TODO: Store opt-in in database
    // TODO: Send welcome message
  }

  /**
   * Process referral (from ad click)
   */
  private async processReferral(instagramId: string, event: any, timestamp: number): Promise<void> {
    const referral = event.referral;
    const senderId = event.sender.id;

    console.log(`📢 Instagram referral from ${senderId}`);
    console.log(`🔗 Source: ${referral.source}`);
    console.log(`📝 Ref: ${referral.ref}`);

    // TODO: Track referral in analytics
    // TODO: Send targeted welcome message
  }

  /**
   * Process message reaction
   */
  private async processMessageReaction(instagramId: string, event: any, timestamp: number): Promise<void> {
    const reaction = event.reaction;
    const senderId = event.sender.id;

    console.log(`❤️ Instagram reaction from ${senderId}: ${reaction.emoji || reaction.reaction}`);
    console.log(`📨 Message ID: ${reaction.mid}`);

    // TODO: Store reaction in analytics
  }

  // ==========================================================================
  // CHANGE EVENT PROCESSORS
  // ==========================================================================

  /**
   * Process Instagram change events (Comments, Mentions, etc.)
   */
  private async processChangeEvent(
    instagramId: string,
    change: any,
    timestamp: number
  ): Promise<void> {
    const field = change.field;
    const value = change.value;

    console.log(`🔔 Instagram change event - Field: ${field}`);

    switch (field) {
      case 'comments':
        await this.processComment(instagramId, value, timestamp);
        break;

      case 'mentions':
        await this.processMention(instagramId, value, timestamp);
        break;

      case 'story_insights':
        await this.processStoryInsight(instagramId, value, timestamp);
        break;

      case 'live_comments':
        await this.processLiveComment(instagramId, value, timestamp);
        break;

      case 'business_account':
        await this.processBusinessAccountUpdate(instagramId, value, timestamp);
        break;

      default:
        console.log(`⚠️ Unhandled Instagram change field: ${field}`);
    }
  }

  /**
   * Process comment on post/reel/IGTV
   */
  private async processComment(instagramId: string, value: any, timestamp: number): Promise<void> {
    const commentId = value.id;
    const mediaId = value.media?.id;
    const parentId = value.parent_id;
    const fromId = value.from?.id;
    const fromUsername = value.from?.username;
    const text = value.text;
    const verb = value.verb || 'add';

    console.log(`💬 Instagram comment ${verb} - ID: ${commentId}`);
    console.log(`📝 Media ID: ${mediaId}`);
    console.log(`👤 From: ${fromUsername} (${fromId})`);
    console.log(`💭 Text: ${text}`);

    if (parentId) {
      console.log(`↩️ Reply to comment: ${parentId}`);
    }

    // TODO: Store comment in database
    // TODO: Enable auto-moderation
    // TODO: Send notification for brand mentions
    // TODO: Sentiment analysis for negative comments
  }

  /**
   * Process @mention in story/post/comment
   */
  private async processMention(instagramId: string, value: any, timestamp: number): Promise<void> {
    const mediaId = value.media_id;
    const commentId = value.comment_id;
    const fromId = value.from?.id;
    const fromUsername = value.from?.username;
    const text = value.text;
    const permalink = value.permalink;

    console.log(`@️ Instagram mention by ${fromUsername} (${fromId})`);
    console.log(`📝 Media ID: ${mediaId}`);
    console.log(`💬 Text: ${text}`);
    console.log(`🔗 Link: ${permalink}`);

    if (commentId) {
      console.log(`💭 In comment: ${commentId}`);
    }

    // TODO: Store mention in database
    // TODO: Send notification to admin
    // TODO: Enable auto-response for mentions
    // TODO: Track brand awareness metrics
  }

  /**
   * Process story insights
   */
  private async processStoryInsight(instagramId: string, value: any, timestamp: number): Promise<void> {
    const mediaId = value.media_id;
    const metric = value.metric;
    const metricValue = value.value;

    console.log(`📊 Instagram story insight - Metric: ${metric} = ${metricValue}`);
    console.log(`📝 Media ID: ${mediaId}`);

    // TODO: Store insights in analytics database
    // TODO: Track engagement trends
    // TODO: Generate reports
  }

  /**
   * Process live video comment
   */
  private async processLiveComment(instagramId: string, value: any, timestamp: number): Promise<void> {
    const liveVideoId = value.live_video_id;
    const commentId = value.id;
    const fromId = value.from?.id;
    const fromUsername = value.from?.username;
    const text = value.text;

    console.log(`📹 Instagram live comment by ${fromUsername}`);
    console.log(`🎬 Live video ID: ${liveVideoId}`);
    console.log(`💭 Text: ${text}`);

    // TODO: Store live comments for engagement analysis
    // TODO: Enable real-time moderation
  }

  /**
   * Process business account update
   */
  private async processBusinessAccountUpdate(instagramId: string, value: any, timestamp: number): Promise<void> {
    const updateType = value.field || 'unknown';

    console.log(`🏢 Instagram business account update - Type: ${updateType}`);
    console.log(`📊 Value:`, value);

    // TODO: Handle account updates (profile changes, follower count, etc.)
  }

  // ==========================================================================
  // OPT-OUT HANDLING
  // ==========================================================================

  /**
   * Handle user opt-out request
   */
  private async handleOptOut(userId: string, instagramId: string): Promise<void> {
    console.log(`🚫 Processing Instagram opt-out for user ${userId}`);

    // TODO: Add user to opt-out list in database
    // TODO: Stop all campaigns for this user

    // Send confirmation message
    try {
      await this.sendMessage(userId, 'You have been unsubscribed. Reply START to opt back in.');
    } catch (error) {
      console.error('❌ Failed to send opt-out confirmation:', error);
    }
  }

  // ==========================================================================
  // INSTAGRAM MESSAGING API
  // ==========================================================================

  /**
   * Send Instagram Direct Message
   */
  async sendMessage(recipientId: string, messageText: string): Promise<any> {
    if (!this.instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    const url = 'https://graph.facebook.com/v21.0/me/messages';
    
    const payload = {
      recipient: { id: recipientId },
      message: { text: messageText },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          access_token: this.instagramAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log(`✅ Instagram message sent to ${recipientId}:`, result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send Instagram message:', error);
      throw error;
    }
  }

  /**
   * Reply to a comment
   */
  async replyToComment(commentId: string, replyText: string): Promise<any> {
    if (!this.instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyText,
          access_token: this.instagramAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to reply to comment:', error);
      throw error;
    }
  }

  /**
   * Hide/Unhide a comment
   */
  async moderateComment(commentId: string, hide: boolean): Promise<any> {
    if (!this.instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    const url = `https://graph.facebook.com/v21.0/${commentId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hide,
          access_token: this.instagramAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      console.log(`✅ Comment ${commentId} ${hide ? 'hidden' : 'unhidden'}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to moderate comment:', error);
      throw error;
    }
  }

  /**
   * Get Instagram user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    if (!this.instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    const url = `https://graph.facebook.com/v21.0/${userId}?fields=id,username,name,profile_picture_url&access_token=${this.instagramAccessToken}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch Instagram user profile:', error);
      throw error;
    }
  }
}

