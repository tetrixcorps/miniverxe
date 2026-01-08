// campaign/_shared/UnifiedMessageStorage.ts

import type { WebhookPlatform } from './UnifiedWebhookRouter';

/**
 * Unified Message Storage
 * 
 * Provides a unified interface for storing messages from all platforms
 * (WhatsApp, Facebook Messenger, Instagram DMs)
 */

export interface UnifiedMessage {
  id: string; // UUID
  platform: WebhookPlatform;
  platformMessageId: string; // Message ID from platform
  conversationId: string; // Conversation/thread ID
  
  // Sender/Recipient
  senderId: string; // Platform-specific sender ID (PSID, phone number, IGSID)
  senderName?: string;
  senderUsername?: string;
  recipientId: string; // Business account ID
  
  // Message content
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'interactive' | 'template' | 'story_mention';
  text?: string;
  mediaUrl?: string;
  mimeType?: string;
  
  // Context
  replyTo?: string; // Message ID being replied to
  context?: Record<string, any>; // Additional context (referral data, etc.)
  
  // Status
  status: 'received' | 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
  
  // Metadata
  timestamp: string; // ISO 8601
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedEngagement {
  id: string;
  platform: WebhookPlatform;
  platformEngagementId: string;
  
  // Type
  engagementType: 'comment' | 'mention' | 'reaction' | 'rating' | 'share';
  
  // Content
  contentId: string; // Post/Story/Media ID
  contentType?: 'post' | 'story' | 'reel' | 'video' | 'live';
  
  // User
  userId: string;
  username?: string;
  
  // Engagement content
  text?: string;
  reaction?: string; // Emoji or reaction type
  rating?: number; // 1-5 stars
  
  // Context
  parentId?: string; // For comment replies
  
  // Metadata
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mock storage implementation
 * Replace with actual database integration (Prisma, TypeORM, etc.)
 */
class MockStorage {
  private messages: UnifiedMessage[] = [];
  private engagements: UnifiedEngagement[] = [];

  // Messages
  async saveMessage(message: UnifiedMessage): Promise<UnifiedMessage> {
    this.messages.push(message);
    console.log(`[Storage] Saved message: ${message.id} (${message.platform})`);
    return message;
  }

  async getMessageById(id: string): Promise<UnifiedMessage | undefined> {
    return this.messages.find(m => m.id === id);
  }

  async getMessagesByConversation(conversationId: string): Promise<UnifiedMessage[]> {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  async getMessagesByPlatform(platform: WebhookPlatform): Promise<UnifiedMessage[]> {
    return this.messages.filter(m => m.platform === platform);
  }

  async updateMessageStatus(
    id: string,
    status: UnifiedMessage['status']
  ): Promise<UnifiedMessage | undefined> {
    const message = this.messages.find(m => m.id === id);
    if (message) {
      message.status = status;
      message.updatedAt = new Date().toISOString();
      console.log(`[Storage] Updated message ${id} status to ${status}`);
    }
    return message;
  }

  // Engagements
  async saveEngagement(engagement: UnifiedEngagement): Promise<UnifiedEngagement> {
    this.engagements.push(engagement);
    console.log(`[Storage] Saved engagement: ${engagement.id} (${engagement.platform})`);
    return engagement;
  }

  async getEngagementById(id: string): Promise<UnifiedEngagement | undefined> {
    return this.engagements.find(e => e.id === id);
  }

  async getEngagementsByContent(contentId: string): Promise<UnifiedEngagement[]> {
    return this.engagements.filter(e => e.contentId === contentId);
  }

  async getEngagementsByPlatform(platform: WebhookPlatform): Promise<UnifiedEngagement[]> {
    return this.engagements.filter(e => e.platform === platform);
  }

  // Statistics
  getTotalMessages(): number {
    return this.messages.length;
  }

  getTotalEngagements(): number {
    return this.engagements.length;
  }

  getMessagesByPlatformCount(): Record<WebhookPlatform, number> {
    return {
      whatsapp: this.messages.filter(m => m.platform === 'whatsapp').length,
      facebook: this.messages.filter(m => m.platform === 'facebook').length,
      instagram: this.messages.filter(m => m.platform === 'instagram').length,
    };
  }
}

export class UnifiedMessageStorage {
  private storage: MockStorage;

  constructor() {
    // Replace with actual database client
    this.storage = new MockStorage();
  }

  // ==========================================================================
  // MESSAGE OPERATIONS
  // ==========================================================================

  /**
   * Store incoming message from any platform
   */
  async storeMessage(
    platform: WebhookPlatform,
    messageData: Partial<UnifiedMessage>
  ): Promise<UnifiedMessage> {
    const message: UnifiedMessage = {
      id: crypto.randomUUID(),
      platform,
      platformMessageId: messageData.platformMessageId || '',
      conversationId: messageData.conversationId || '',
      senderId: messageData.senderId || '',
      senderName: messageData.senderName,
      senderUsername: messageData.senderUsername,
      recipientId: messageData.recipientId || '',
      messageType: messageData.messageType || 'text',
      text: messageData.text,
      mediaUrl: messageData.mediaUrl,
      mimeType: messageData.mimeType,
      replyTo: messageData.replyTo,
      context: messageData.context,
      status: messageData.status || 'received',
      direction: messageData.direction || 'inbound',
      timestamp: messageData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.storage.saveMessage(message);
  }

  /**
   * Update message status (delivered, read, etc.)
   */
  async updateMessageStatus(
    platformMessageId: string,
    status: UnifiedMessage['status']
  ): Promise<void> {
    const message = await this.storage.getMessageById(platformMessageId);
    if (message) {
      await this.storage.updateMessageStatus(message.id, status);
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(conversationId: string): Promise<UnifiedMessage[]> {
    return await this.storage.getMessagesByConversation(conversationId);
  }

  /**
   * Search messages by platform
   */
  async getMessagesByPlatform(platform: WebhookPlatform): Promise<UnifiedMessage[]> {
    return await this.storage.getMessagesByPlatform(platform);
  }

  // ==========================================================================
  // ENGAGEMENT OPERATIONS
  // ==========================================================================

  /**
   * Store engagement (comment, mention, reaction)
   */
  async storeEngagement(
    platform: WebhookPlatform,
    engagementData: Partial<UnifiedEngagement>
  ): Promise<UnifiedEngagement> {
    const engagement: UnifiedEngagement = {
      id: crypto.randomUUID(),
      platform,
      platformEngagementId: engagementData.platformEngagementId || '',
      engagementType: engagementData.engagementType || 'comment',
      contentId: engagementData.contentId || '',
      contentType: engagementData.contentType,
      userId: engagementData.userId || '',
      username: engagementData.username,
      text: engagementData.text,
      reaction: engagementData.reaction,
      rating: engagementData.rating,
      parentId: engagementData.parentId,
      timestamp: engagementData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.storage.saveEngagement(engagement);
  }

  /**
   * Get engagements for specific content
   */
  async getContentEngagements(contentId: string): Promise<UnifiedEngagement[]> {
    return await this.storage.getEngagementsByContent(contentId);
  }

  /**
   * Search engagements by platform
   */
  async getEngagementsByPlatform(platform: WebhookPlatform): Promise<UnifiedEngagement[]> {
    return await this.storage.getEngagementsByPlatform(platform);
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  /**
   * Get message statistics
   */
  async getMessageStats(): Promise<{
    total: number;
    byPlatform: Record<WebhookPlatform, number>;
    byDirection: { inbound: number; outbound: number };
  }> {
    const total = this.storage.getTotalMessages();
    const byPlatform = this.storage.getMessagesByPlatformCount();
    
    // TODO: Implement actual database queries
    const byDirection = {
      inbound: 0,
      outbound: 0,
    };

    return { total, byPlatform, byDirection };
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStats(): Promise<{
    total: number;
    byPlatform: Record<WebhookPlatform, number>;
    byType: Record<string, number>;
  }> {
    const total = this.storage.getTotalEngagements();
    
    // TODO: Implement actual database queries
    const byPlatform: Record<WebhookPlatform, number> = {
      whatsapp: 0,
      facebook: 0,
      instagram: 0,
    };

    const byType: Record<string, number> = {
      comment: 0,
      mention: 0,
      reaction: 0,
      rating: 0,
      share: 0,
    };

    return { total, byPlatform, byType };
  }

  /**
   * Get conversation metrics
   */
  async getConversationMetrics(conversationId: string): Promise<{
    messageCount: number;
    lastMessageTime: string;
    responseTime: number | null;
  }> {
    const messages = await this.getConversation(conversationId);
    
    return {
      messageCount: messages.length,
      lastMessageTime: messages[messages.length - 1]?.timestamp || new Date().toISOString(),
      responseTime: null, // TODO: Calculate average response time
    };
  }
}

