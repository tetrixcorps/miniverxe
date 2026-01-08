// campaign/facebook/schemas/facebook-page-webhooks.schema.ts

import { z } from 'zod';

/**
 * Facebook Page Webhook Event Schemas
 * 
 * Supports all webhook fields from:
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/page
 */

// ============================================================================
// BASE SCHEMA
// ============================================================================

export const FacebookWebhookEventSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  eventType: z.string(), // e.g., 'message', 'postback', 'leadgen', 'feed'
  field: z.string(), // Webhook field name from Meta
  payload: z.record(z.any()), // Raw JSON payload
  processed: z.boolean().default(false),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

// ============================================================================
// MESSENGER MESSAGING SCHEMAS
// ============================================================================

// Message attachment schema
const MessageAttachmentSchema = z.object({
  type: z.enum(['image', 'video', 'audio', 'file', 'template', 'fallback']),
  payload: z.object({
    url: z.string().url().optional(),
    sticker_id: z.number().optional(),
    template_type: z.string().optional(),
    elements: z.array(z.any()).optional(),
  }),
});

// Quick reply schema
const QuickReplySchema = z.object({
  payload: z.string(),
});

// Message schema
const MessengerMessageSchema = z.object({
  mid: z.string(), // Message ID
  text: z.string().optional(),
  quick_reply: QuickReplySchema.optional(),
  reply_to: z.object({
    mid: z.string(),
  }).optional(),
  attachments: z.array(MessageAttachmentSchema).optional(),
  is_echo: z.boolean().optional(),
  app_id: z.number().optional(),
  metadata: z.string().optional(),
});

// Sender/Recipient schema
const MessagingUserSchema = z.object({
  id: z.string(), // Page-scoped ID (PSID)
});

// Messaging event base
const MessagingEventBaseSchema = z.object({
  sender: MessagingUserSchema,
  recipient: MessagingUserSchema,
  timestamp: z.number(),
});

/**
 * 1. MESSAGES - Messenger conversations
 */
export const FacebookMessengerMessageSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('message'),
  field: z.literal('messages'),
  pageId: z.string(),
  senderId: z.string(), // PSID
  recipientId: z.string(), // Page ID
  messageId: z.string(),
  messageText: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  quickReply: z.string().optional(),
  isEcho: z.boolean().optional(),
  replyTo: z.string().optional(), // Message ID being replied to
});

/**
 * 2. MESSAGING_POSTBACKS - Button clicks, quick replies
 */
export const FacebookMessagingPostbackSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('postback'),
  field: z.literal('messaging_postbacks'),
  pageId: z.string(),
  senderId: z.string(), // PSID
  recipientId: z.string(),
  postbackPayload: z.string(), // Developer-defined payload
  postbackTitle: z.string().optional(),
  referral: z.record(z.any()).optional(), // If from ad
});

/**
 * 3. MESSAGING_OPTINS - User opts in to receive messages
 */
export const FacebookMessagingOptinSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('optin'),
  field: z.literal('messaging_optins'),
  pageId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  ref: z.string().optional(), // Data-ref parameter
  userRef: z.string().optional(),
});

/**
 * 4. MESSAGING_OPTOUTS - User opts out
 */
export const FacebookMessagingOptoutSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('optout'),
  field: z.literal('messaging_optouts'),
  pageId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
});

/**
 * 5. MESSAGE_DELIVERIES - Delivery confirmations
 */
export const FacebookMessageDeliverySchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('delivery'),
  field: z.literal('message_deliveries'),
  pageId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  messageIds: z.array(z.string()),
  watermark: z.number(), // Timestamp
});

/**
 * 6. MESSAGE_READS - Read receipts
 */
export const FacebookMessageReadSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('read'),
  field: z.literal('message_reads'),
  pageId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  watermark: z.number(),
});

/**
 * 7. MESSAGING_REFERRALS - Message from ad click
 */
export const FacebookMessagingReferralSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('referral'),
  field: z.literal('messaging_referrals'),
  pageId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  referralSource: z.string(), // e.g., 'SHORTLINK', 'ADS'
  referralType: z.string(), // e.g., 'OPEN_THREAD'
  referralRef: z.string().optional(),
  adId: z.string().optional(),
});

/**
 * 8. MESSAGE_REACTIONS - Reactions to messages
 */
export const FacebookMessageReactionSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('message_reaction'),
  field: z.literal('message_reactions'),
  pageId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  messageId: z.string(),
  reaction: z.enum(['smile', 'angry', 'sad', 'wow', 'love', 'like', 'dislike', 'other']),
  emoji: z.string().optional(),
  action: z.enum(['react', 'unreact']),
});

// ============================================================================
// LEADGEN SCHEMAS
// ============================================================================

/**
 * 9. LEADGEN - Lead generation form submission
 */
export const FacebookLeadGenSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('leadgen'),
  field: z.literal('leadgen'),
  pageId: z.string(),
  leadgenId: z.string(), // Lead ID to fetch full data
  formId: z.string(),
  adgroupId: z.string().optional(),
  adId: z.string().optional(),
  createdTime: z.string().datetime(),
});

// ============================================================================
// PAGE ENGAGEMENT SCHEMAS
// ============================================================================

/**
 * 10. FEED - New posts on page
 */
export const FacebookFeedSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('feed'),
  field: z.literal('feed'),
  pageId: z.string(),
  postId: z.string(),
  verb: z.enum(['add', 'edited', 'remove', 'hide']),
  itemType: z.enum(['status', 'photo', 'video', 'link', 'share']),
  message: z.string().optional(),
  link: z.string().optional(),
  photoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

/**
 * 11. MENTION - Page mentioned in post/comment
 */
export const FacebookMentionSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('mention'),
  field: z.literal('mention'),
  pageId: z.string(),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  fromId: z.string(), // User/Page that mentioned
  message: z.string(),
  permalink: z.string().url(),
});

/**
 * 12. COMMENTS - Comments on page posts
 */
export const FacebookCommentSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('comment'),
  field: z.literal('feed'),
  pageId: z.string(),
  commentId: z.string(),
  postId: z.string(),
  parentId: z.string().optional(), // For comment replies
  fromId: z.string(),
  fromName: z.string().optional(),
  message: z.string(),
  verb: z.enum(['add', 'edited', 'remove', 'hide']),
  createdTime: z.number(),
});

/**
 * 13. REACTIONS - Reactions to posts
 */
export const FacebookReactionSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('reaction'),
  field: z.literal('reaction'),
  pageId: z.string(),
  postId: z.string(),
  reactionType: z.enum(['like', 'love', 'haha', 'wow', 'sad', 'angry', 'care']),
  fromId: z.string(),
  verb: z.enum(['add', 'remove']),
});

/**
 * 14. LIVE_VIDEOS - Live video events
 */
export const FacebookLiveVideoSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('live_video'),
  field: z.literal('live_videos'),
  pageId: z.string(),
  videoId: z.string(),
  status: z.enum(['live', 'scheduled', 'VOD']),
  broadcastStartTime: z.number().optional(),
});

/**
 * 15. RATINGS - Page ratings
 */
export const FacebookRatingSchema = FacebookWebhookEventSchema.extend({
  eventType: z.literal('rating'),
  field: z.literal('ratings'),
  pageId: z.string(),
  ratingId: z.string(),
  reviewerId: z.string(),
  reviewerName: z.string().optional(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  openGraphStoryId: z.string().optional(),
  verb: z.enum(['add', 'edited', 'remove']),
});

// ============================================================================
// UNION TYPES
// ============================================================================

export type FacebookWebhookEvent = z.infer<typeof FacebookWebhookEventSchema>;
export type FacebookMessengerMessage = z.infer<typeof FacebookMessengerMessageSchema>;
export type FacebookMessagingPostback = z.infer<typeof FacebookMessagingPostbackSchema>;
export type FacebookMessagingOptin = z.infer<typeof FacebookMessagingOptinSchema>;
export type FacebookMessagingOptout = z.infer<typeof FacebookMessagingOptoutSchema>;
export type FacebookMessageDelivery = z.infer<typeof FacebookMessageDeliverySchema>;
export type FacebookMessageRead = z.infer<typeof FacebookMessageReadSchema>;
export type FacebookMessagingReferral = z.infer<typeof FacebookMessagingReferralSchema>;
export type FacebookMessageReaction = z.infer<typeof FacebookMessageReactionSchema>;
export type FacebookLeadGen = z.infer<typeof FacebookLeadGenSchema>;
export type FacebookFeed = z.infer<typeof FacebookFeedSchema>;
export type FacebookMention = z.infer<typeof FacebookMentionSchema>;
export type FacebookComment = z.infer<typeof FacebookCommentSchema>;
export type FacebookReaction = z.infer<typeof FacebookReactionSchema>;
export type FacebookLiveVideo = z.infer<typeof FacebookLiveVideoSchema>;
export type FacebookRating = z.infer<typeof FacebookRatingSchema>;

// ============================================================================
// WEBHOOK PAYLOAD STRUCTURE FROM META
// ============================================================================

/**
 * Standard webhook payload structure from Meta
 */
export const MetaWebhookPayloadSchema = z.object({
  object: z.string(), // 'page' for page webhooks
  entry: z.array(z.object({
    id: z.string(), // Page ID
    time: z.number(),
    messaging: z.array(z.any()).optional(), // Messaging events
    changes: z.array(z.object({
      field: z.string(),
      value: z.any(),
    })).optional(), // Other change events
  })),
});

export type MetaWebhookPayload = z.infer<typeof MetaWebhookPayloadSchema>;

