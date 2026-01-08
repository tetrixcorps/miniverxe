// campaign/facebook/FacebookPageService.ts

import crypto from 'crypto';
import type {
  FacebookWebhookEvent,
  FacebookMessengerMessage,
  FacebookMessagingPostback,
  FacebookLeadGen,
  FacebookMention,
  FacebookComment,
  MetaWebhookPayload,
} from './schemas/facebook-page-webhooks.schema';

/**
 * Facebook Page Service
 * 
 * Handles all Facebook Page webhooks including:
 * - Messenger conversations
 * - Lead generation
 * - Page engagement (comments, mentions, reactions)
 * - Post updates
 * 
 * Documentation:
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/page
 * https://developers.facebook.com/docs/messenger-platform/webhooks
 */
export class FacebookPageService {
  private appSecret: string;
  private pageAccessToken: string;
  private verifyToken: string;

  constructor() {
    this.appSecret = process.env['FACEBOOK_APP_SECRET'] || '';
    this.pageAccessToken = process.env['FACEBOOK_PAGE_ACCESS_TOKEN'] || '';
    this.verifyToken = process.env['FACEBOOK_VERIFY_TOKEN'] || '';

    if (!this.appSecret) {
      console.warn('⚠️ FACEBOOK_APP_SECRET not configured');
    }
    if (!this.pageAccessToken) {
      console.warn('⚠️ FACEBOOK_PAGE_ACCESS_TOKEN not configured');
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
      console.log('✅ Facebook Page webhook verified successfully');
      return challenge;
    }
    console.error('❌ Facebook Page webhook verification failed');
    return null;
  }

  // ==========================================================================
  // MAIN WEBHOOK HANDLER
  // ==========================================================================

  /**
   * Main webhook processing entry point
   */
  async handleWebhook(webhookData: MetaWebhookPayload): Promise<boolean> {
    try {
      console.log('📩 Facebook Page webhook received:', JSON.stringify(webhookData, null, 2));

      if (webhookData.object !== 'page') {
        console.warn(`⚠️ Unexpected webhook object type: ${webhookData.object}`);
        return false;
      }

      // Process each entry (usually one per webhook)
      for (const entry of webhookData.entry) {
        const pageId = entry.id;
        const timestamp = entry.time;

        // Process messaging events (Messenger)
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            await this.processMessagingEvent(pageId, messagingEvent, timestamp);
          }
        }

        // Process change events (Feed, Leadgen, etc.)
        if (entry.changes) {
          for (const change of entry.changes) {
            await this.processChangeEvent(pageId, change, timestamp);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to process Facebook Page webhook:', error);
      return false;
    }
  }

  // ==========================================================================
  // MESSAGING EVENT PROCESSORS
  // ==========================================================================

  /**
   * Process Messenger messaging events
   */
  private async processMessagingEvent(
    pageId: string,
    messagingEvent: any,
    timestamp: number
  ): Promise<void> {
    const sender = messagingEvent.sender?.id;
    const recipient = messagingEvent.recipient?.id;

    console.log(`🔔 Messaging event from ${sender} to ${recipient}`);

    // Message
    if (messagingEvent.message) {
      await this.processMessage(pageId, messagingEvent, timestamp);
    }

    // Postback (button clicks, quick replies)
    if (messagingEvent.postback) {
      await this.processPostback(pageId, messagingEvent, timestamp);
    }

    // Delivery confirmation
    if (messagingEvent.delivery) {
      await this.processDelivery(pageId, messagingEvent, timestamp);
    }

    // Read receipt
    if (messagingEvent.read) {
      await this.processRead(pageId, messagingEvent, timestamp);
    }

    // Opt-in
    if (messagingEvent.optin) {
      await this.processOptin(pageId, messagingEvent, timestamp);
    }

    // Referral (from ad click)
    if (messagingEvent.referral) {
      await this.processReferral(pageId, messagingEvent, timestamp);
    }

    // Reaction
    if (messagingEvent.reaction) {
      await this.processMessageReaction(pageId, messagingEvent, timestamp);
    }
  }

  /**
   * Process incoming Messenger message
   */
  private async processMessage(pageId: string, event: any, timestamp: number): Promise<void> {
    const message = event.message;
    const senderId = event.sender.id;

    console.log(`💬 Message from ${senderId}: ${message.text || '[attachment]'}`);

    // Check for quick reply
    if (message.quick_reply) {
      console.log(`⚡ Quick reply payload: ${message.quick_reply.payload}`);
    }

    // Check for attachments
    if (message.attachments) {
      for (const attachment of message.attachments) {
        console.log(`📎 Attachment type: ${attachment.type}`);
        if (attachment.payload?.url) {
          console.log(`🔗 Attachment URL: ${attachment.payload.url}`);
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
        await this.handleOptOut(senderId, pageId);
      }
    }
  }

  /**
   * Process postback (button click, quick reply)
   */
  private async processPostback(pageId: string, event: any, timestamp: number): Promise<void> {
    const postback = event.postback;
    const senderId = event.sender.id;

    console.log(`🔘 Postback from ${senderId}: ${postback.title}`);
    console.log(`📦 Payload: ${postback.payload}`);

    // Check if postback came from ad
    if (postback.referral) {
      console.log(`📢 Postback from ad: ${postback.referral.source}`);
      console.log(`🔗 Ad ref: ${postback.referral.ref}`);
    }

    // TODO: Handle postback based on payload
    // TODO: Trigger appropriate workflow
    // TODO: Send follow-up message
  }

  /**
   * Process delivery confirmation
   */
  private async processDelivery(pageId: string, event: any, timestamp: number): Promise<void> {
    const delivery = event.delivery;
    const senderId = event.sender.id;

    console.log(`✅ Messages delivered to ${senderId}`);
    console.log(`📨 Message IDs: ${delivery.mids?.join(', ')}`);
    console.log(`⏰ Watermark: ${new Date(delivery.watermark).toISOString()}`);

    // TODO: Update message status in database
  }

  /**
   * Process read receipt
   */
  private async processRead(pageId: string, event: any, timestamp: number): Promise<void> {
    const read = event.read;
    const senderId = event.sender.id;

    console.log(`👁️ Messages read by ${senderId}`);
    console.log(`⏰ Watermark: ${new Date(read.watermark).toISOString()}`);

    // TODO: Update message read status in database
  }

  /**
   * Process opt-in
   */
  private async processOptin(pageId: string, event: any, timestamp: number): Promise<void> {
    const optin = event.optin;
    const senderId = event.sender.id;

    console.log(`✅ User ${senderId} opted in`);
    console.log(`📝 Ref: ${optin.ref}`);

    // TODO: Store opt-in in database
    // TODO: Send welcome message
  }

  /**
   * Process referral (from ad click)
   */
  private async processReferral(pageId: string, event: any, timestamp: number): Promise<void> {
    const referral = event.referral;
    const senderId = event.sender.id;

    console.log(`📢 Referral from ${senderId}`);
    console.log(`🔗 Source: ${referral.source}`);
    console.log(`📝 Ref: ${referral.ref}`);
    console.log(`🎯 Ad ID: ${referral.ad_id}`);

    // TODO: Track referral in analytics
    // TODO: Send targeted welcome message
  }

  /**
   * Process message reaction
   */
  private async processMessageReaction(pageId: string, event: any, timestamp: number): Promise<void> {
    const reaction = event.reaction;
    const senderId = event.sender.id;

    console.log(`❤️ Reaction from ${senderId}: ${reaction.emoji || reaction.reaction}`);
    console.log(`📨 Message ID: ${reaction.mid}`);
    console.log(`🎬 Action: ${reaction.action}`);

    // TODO: Store reaction in analytics
  }

  // ==========================================================================
  // CHANGE EVENT PROCESSORS
  // ==========================================================================

  /**
   * Process page change events (Feed, Leadgen, etc.)
   */
  private async processChangeEvent(
    pageId: string,
    change: any,
    timestamp: number
  ): Promise<void> {
    const field = change.field;
    const value = change.value;

    console.log(`🔔 Change event - Field: ${field}`);

    switch (field) {
      case 'leadgen':
        await this.processLeadGen(pageId, value, timestamp);
        break;

      case 'feed':
        await this.processFeed(pageId, value, timestamp);
        break;

      case 'mention':
        await this.processMention(pageId, value, timestamp);
        break;

      case 'ratings':
        await this.processRating(pageId, value, timestamp);
        break;

      case 'live_videos':
        await this.processLiveVideo(pageId, value, timestamp);
        break;

      default:
        console.log(`⚠️ Unhandled change field: ${field}`);
    }
  }

  /**
   * Process lead generation form submission
   */
  private async processLeadGen(pageId: string, value: any, timestamp: number): Promise<void> {
    const leadgenId = value.leadgen_id;
    const formId = value.form_id;
    const adId = value.ad_id;
    const adgroupId = value.adgroup_id;

    console.log(`📝 Lead generated - ID: ${leadgenId}`);
    console.log(`📋 Form ID: ${formId}`);
    console.log(`🎯 Ad ID: ${adId}`);

    // Fetch full lead data from Graph API
    try {
      const leadData = await this.fetchLeadData(leadgenId);
      console.log('📊 Lead data:', leadData);

      // TODO: Store lead in database
      // TODO: Send notification to sales team
      // TODO: Trigger CRM integration
      // TODO: Send auto-response to lead
    } catch (error) {
      console.error('❌ Failed to fetch lead data:', error);
    }
  }

  /**
   * Process feed event (new post, edit, delete)
   */
  private async processFeed(pageId: string, value: any, timestamp: number): Promise<void> {
    const postId = value.post_id;
    const verb = value.verb; // 'add', 'edited', 'remove'
    const item = value.item;

    console.log(`📰 Feed ${verb} - Post ID: ${postId}`);
    console.log(`📝 Item: ${item}`);

    // If it's a comment on a post
    if (value.comment_id) {
      await this.processComment(pageId, value, timestamp);
      return;
    }

    // TODO: Store post event in database
    // TODO: Track post engagement
  }

  /**
   * Process page mention
   */
  private async processMention(pageId: string, value: any, timestamp: number): Promise<void> {
    const postId = value.post_id;
    const fromId = value.from?.id;
    const message = value.message;
    const permalink = value.permalink_url;

    console.log(`@️ Page mentioned by ${fromId}`);
    console.log(`💬 Message: ${message}`);
    console.log(`🔗 Link: ${permalink}`);

    // TODO: Store mention in database
    // TODO: Send notification to admin
    // TODO: Enable auto-response if configured
  }

  /**
   * Process comment on post
   */
  private async processComment(pageId: string, value: any, timestamp: number): Promise<void> {
    const commentId = value.comment_id;
    const postId = value.post_id;
    const parentId = value.parent_id;
    const fromId = value.from?.id;
    const message = value.message;
    const verb = value.verb;

    console.log(`💬 Comment ${verb} - ID: ${commentId}`);
    console.log(`📝 Post ID: ${postId}`);
    console.log(`👤 From: ${fromId}`);
    console.log(`💭 Message: ${message}`);

    if (parentId) {
      console.log(`↩️ Reply to comment: ${parentId}`);
    }

    // TODO: Store comment in database
    // TODO: Enable auto-moderation
    // TODO: Send notification for negative sentiment
  }

  /**
   * Process page rating
   */
  private async processRating(pageId: string, value: any, timestamp: number): Promise<void> {
    const reviewerId = value.reviewer_id;
    const rating = value.rating;
    const reviewText = value.review_text;
    const verb = value.verb;

    console.log(`⭐ Rating ${verb} - ${rating}/5 stars`);
    console.log(`👤 Reviewer: ${reviewerId}`);
    console.log(`📝 Review: ${reviewText}`);

    // TODO: Store rating in database
    // TODO: Send notification for low ratings
    // TODO: Request response from page manager
  }

  /**
   * Process live video event
   */
  private async processLiveVideo(pageId: string, value: any, timestamp: number): Promise<void> {
    const videoId = value.id;
    const status = value.status; // 'live', 'scheduled', 'VOD'
    const broadcastStartTime = value.broadcast_start_time;

    console.log(`📹 Live video - Status: ${status}`);
    console.log(`🎬 Video ID: ${videoId}`);

    // TODO: Notify followers
    // TODO: Track live video analytics
  }

  // ==========================================================================
  // OPT-OUT HANDLING
  // ==========================================================================

  /**
   * Handle user opt-out request
   */
  private async handleOptOut(userId: string, pageId: string): Promise<void> {
    console.log(`🚫 Processing opt-out for user ${userId}`);

    // TODO: Add user to opt-out list in database
    // TODO: Send confirmation message
    // TODO: Stop all campaigns for this user

    // Send confirmation message
    try {
      await this.sendMessage(userId, 'You have been unsubscribed. Reply START to opt back in.');
    } catch (error) {
      console.error('❌ Failed to send opt-out confirmation:', error);
    }
  }

  // ==========================================================================
  // MESSENGER SEND API
  // ==========================================================================

  /**
   * Send message via Messenger Send API
   */
  async sendMessage(recipientId: string, messageText: string): Promise<any> {
    if (!this.pageAccessToken) {
      throw new Error('Page access token not configured');
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
          access_token: this.pageAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Messenger API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log(`✅ Message sent to ${recipientId}:`, result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send message with quick replies
   */
  async sendQuickReply(recipientId: string, text: string, quickReplies: Array<{title: string, payload: string}>): Promise<any> {
    if (!this.pageAccessToken) {
      throw new Error('Page access token not configured');
    }

    const url = 'https://graph.facebook.com/v21.0/me/messages';
    
    const payload = {
      recipient: { id: recipientId },
      message: {
        text,
        quick_replies: quickReplies.map(qr => ({
          content_type: 'text',
          title: qr.title,
          payload: qr.payload,
        })),
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          access_token: this.pageAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Messenger API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to send quick reply:', error);
      throw error;
    }
  }

  // ==========================================================================
  // GRAPH API INTEGRATION
  // ==========================================================================

  /**
   * Fetch lead data from Graph API
   */
  private async fetchLeadData(leadgenId: string): Promise<any> {
    if (!this.pageAccessToken) {
      throw new Error('Page access token not configured');
    }

    const url = `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${this.pageAccessToken}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Graph API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch lead data:', error);
      throw error;
    }
  }

  /**
   * Get page profile information
   */
  async getPageProfile(pageId: string): Promise<any> {
    if (!this.pageAccessToken) {
      throw new Error('Page access token not configured');
    }

    const url = `https://graph.facebook.com/v21.0/${pageId}?fields=id,name,about,category,emails,phone,website&access_token=${this.pageAccessToken}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Graph API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch page profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile information (PSID)
   */
  async getUserProfile(userId: string): Promise<any> {
    if (!this.pageAccessToken) {
      throw new Error('Page access token not configured');
    }

    const url = `https://graph.facebook.com/v21.0/${userId}?fields=id,name,first_name,last_name,profile_pic&access_token=${this.pageAccessToken}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Graph API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw error;
    }
  }
}

