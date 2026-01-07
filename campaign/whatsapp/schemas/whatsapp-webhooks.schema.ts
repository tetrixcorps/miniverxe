// WhatsApp Webhooks Database Schema
// This schema defines the structure for storing WhatsApp webhook events

export interface WhatsAppWebhookLog {
  id: string;
  webhookType: 'messages' | 'statuses' | 'template_status' | 'phone_quality' | 'account_review' | 'account_update' | 'security';
  phoneNumberId: string;
  businessAccountId: string;
  rawPayload: any;
  processedAt: Date;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface WhatsAppMessage {
  id: string;
  messageId: string; // WhatsApp message ID (wamid)
  phoneNumberId: string;
  from: string;
  to?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | 'interactive' | 'button' | 'sticker';
  content: any; // Message content based on type
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  campaignId?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessageStatus {
  id: string;
  messageId: string; // WhatsApp message ID (wamid)
  recipientId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  conversationId?: string;
  pricing?: {
    billable: boolean;
    pricingModel: string;
    category: string;
  };
  error?: {
    code: number;
    title: string;
    message: string;
    errorData?: any;
  };
  createdAt: Date;
}

export interface WhatsAppTemplate {
  id: string;
  templateName: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';
  rejectionReason?: string;
  components: any[];
  businessAccountId: string;
  createdAt: Date;
  updatedAt: Date;
  lastStatusUpdate?: Date;
}

export interface WhatsAppPhoneNumber {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  messagingLimit: string; // e.g., "TIER_1K", "TIER_10K", "TIER_100K", "TIER_UNLIMITED"
  status: 'CONNECTED' | 'DISCONNECTED' | 'FLAGGED' | 'MIGRATED' | 'BANNED' | 'RESTRICTED';
  businessAccountId: string;
  lastQualityUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppAccountEvent {
  id: string;
  businessAccountId: string;
  eventType: 'review_update' | 'account_update' | 'security';
  event: string; // Specific event (e.g., 'APPROVED', 'REJECTED', 'VERIFIED', 'BANNED')
  data: any;
  timestamp: Date;
  createdAt: Date;
}

export interface WhatsAppCampaignAnalytics {
  id: string;
  campaignId: string;
  totalRecipients: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  responseRate: number;
  averageResponseTime?: number; // in seconds
  optOutCount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppOptOut {
  id: string;
  phoneNumber: string;
  reason?: string;
  optOutDate: Date;
  source: 'user_request' | 'compliance' | 'admin';
  campaignId?: string;
  createdAt: Date;
}

// Database indexes for performance
export const whatsappIndexes = {
  webhookLogs: [
    { fields: ['webhookType', 'createdAt'] },
    { fields: ['phoneNumberId', 'createdAt'] },
    { fields: ['businessAccountId', 'createdAt'] }
  ],
  messages: [
    { fields: ['messageId'], unique: true },
    { fields: ['from', 'createdAt'] },
    { fields: ['campaignId', 'createdAt'] },
    { fields: ['direction', 'status', 'createdAt'] }
  ],
  messageStatuses: [
    { fields: ['messageId', 'status'] },
    { fields: ['recipientId', 'createdAt'] }
  ],
  templates: [
    { fields: ['templateName', 'language'], unique: true },
    { fields: ['businessAccountId', 'status'] }
  ],
  phoneNumbers: [
    { fields: ['phoneNumberId'], unique: true },
    { fields: ['businessAccountId', 'status'] }
  ],
  accountEvents: [
    { fields: ['businessAccountId', 'eventType', 'createdAt'] }
  ],
  campaignAnalytics: [
    { fields: ['campaignId', 'date'] },
    { fields: ['date'] }
  ],
  optOuts: [
    { fields: ['phoneNumber'], unique: true },
    { fields: ['campaignId', 'createdAt'] }
  ]
};

