// campaign/instagram/schemas/instagram-webhooks.schema.ts

import { z } from 'zod';

/**
 * Instagram Webhook Event Schemas
 * 
 * Supports all webhook fields from:
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/instagram
 */

// ============================================================================
// BASE SCHEMA
// ============================================================================

export const InstagramWebhookEventSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  eventType: z.string(), // e.g., 'message', 'comment', 'mention'
  field: z.string(), // Webhook field name from Meta
  payload: z.record(z.any()), // Raw JSON payload
  processed: z.boolean().default(false),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

// ============================================================================
// INSTAGRAM MESSAGING SCHEMAS
// ============================================================================

/**
 * 1. MESSAGES - Instagram Direct Messages
 */
export const InstagramMessageSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('message'),
  field: z.literal('messages'),
  instagramId: z.string(), // Instagram Business Account ID
  senderId: z.string(), // Instagram-scoped ID (IGSID)
  recipientId: z.string(), // Business account ID
  messageId: z.string(),
  messageText: z.string().optional(),
  attachments: z.array(z.object({
    type: z.enum(['image', 'video', 'audio', 'file', 'story_mention', 'share']),
    payload: z.object({
      url: z.string().url().optional(),
      title: z.string().optional(),
    }),
  })).optional(),
  replyTo: z.string().optional(), // Message ID being replied to
  isEcho: z.boolean().optional(),
});

/**
 * 2. MESSAGING_SEEN - Message read receipts
 */
export const InstagramMessageSeenSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('message_seen'),
  field: z.literal('messaging_seen'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  watermark: z.number(), // Timestamp of last message seen
});

/**
 * 3. MESSAGING_POSTBACK - Button/quick reply interactions
 */
export const InstagramPostbackSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('postback'),
  field: z.literal('messaging_postback'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  postbackPayload: z.string(),
  postbackTitle: z.string().optional(),
});

/**
 * 4. MESSAGING_REACTION - Reactions to messages
 */
export const InstagramMessageReactionSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('message_reaction'),
  field: z.literal('messaging_reaction'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  messageId: z.string(),
  reaction: z.string().optional(), // Emoji
  action: z.enum(['react', 'unreact']),
});

/**
 * 5. MESSAGING_DELIVERIES - Delivery confirmations
 */
export const InstagramMessageDeliverySchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('delivery'),
  field: z.literal('messaging_deliveries'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  messageIds: z.array(z.string()),
  watermark: z.number(),
});

/**
 * 6. MESSAGING_REFERRAL - Referrals from ads or other sources
 */
export const InstagramReferralSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('referral'),
  field: z.literal('messaging_referral'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  referralSource: z.string(), // e.g., 'ADS', 'SHORTLINK'
  referralType: z.string(),
  referralRef: z.string().optional(),
  adId: z.string().optional(),
});

/**
 * 7. MESSAGING_OPTINS - User opts in to receive messages
 */
export const InstagramOptinSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('optin'),
  field: z.literal('messaging_optins'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  ref: z.string().optional(),
  userRef: z.string().optional(),
});

/**
 * 8. MESSAGING_OPTOUTS - User opts out
 */
export const InstagramOptoutSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('optout'),
  field: z.literal('messaging_optouts'),
  instagramId: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
});

// ============================================================================
// INSTAGRAM ENGAGEMENT SCHEMAS
// ============================================================================

/**
 * 9. COMMENTS - Comments on media (posts, reels, stories)
 */
export const InstagramCommentSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('comment'),
  field: z.literal('comments'),
  instagramId: z.string(),
  commentId: z.string(),
  mediaId: z.string(), // Post/Reel/IGTV ID
  parentId: z.string().optional(), // For comment replies
  fromId: z.string(), // Commenter's Instagram ID
  fromUsername: z.string().optional(),
  text: z.string(),
  verb: z.enum(['add', 'edited', 'remove', 'hide']),
});

/**
 * 10. MENTIONS - @mentions in stories, captions, comments
 */
export const InstagramMentionSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('mention'),
  field: z.literal('mentions'),
  instagramId: z.string(),
  mediaId: z.string(),
  commentId: z.string().optional(), // If mentioned in comment
  fromId: z.string(),
  fromUsername: z.string().optional(),
  text: z.string().optional(),
  permalink: z.string().url().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'STORY']).optional(),
});

/**
 * 11. STORY_INSIGHTS - Story engagement metrics
 */
export const InstagramStoryInsightSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('story_insight'),
  field: z.literal('story_insights'),
  instagramId: z.string(),
  mediaId: z.string(),
  metric: z.enum(['impressions', 'reach', 'taps_forward', 'taps_back', 'exits', 'replies']),
  value: z.number(),
});

/**
 * 12. LIVE_COMMENTS - Comments on live videos
 */
export const InstagramLiveCommentSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('live_comment'),
  field: z.literal('live_comments'),
  instagramId: z.string(),
  liveVideoId: z.string(),
  commentId: z.string(),
  fromId: z.string(),
  fromUsername: z.string().optional(),
  text: z.string(),
  timestamp: z.number(),
});

/**
 * 13. BUSINESS_ACCOUNT - Account updates
 */
export const InstagramBusinessAccountSchema = InstagramWebhookEventSchema.extend({
  eventType: z.literal('business_account_update'),
  field: z.literal('business_account'),
  instagramId: z.string(),
  updateType: z.string(), // e.g., 'profile_update', 'followers_count'
  value: z.any(),
});

// ============================================================================
// UNION TYPES
// ============================================================================

export type InstagramWebhookEvent = z.infer<typeof InstagramWebhookEventSchema>;
export type InstagramMessage = z.infer<typeof InstagramMessageSchema>;
export type InstagramMessageSeen = z.infer<typeof InstagramMessageSeenSchema>;
export type InstagramPostback = z.infer<typeof InstagramPostbackSchema>;
export type InstagramMessageReaction = z.infer<typeof InstagramMessageReactionSchema>;
export type InstagramMessageDelivery = z.infer<typeof InstagramMessageDeliverySchema>;
export type InstagramReferral = z.infer<typeof InstagramReferralSchema>;
export type InstagramOptin = z.infer<typeof InstagramOptinSchema>;
export type InstagramOptout = z.infer<typeof InstagramOptoutSchema>;
export type InstagramComment = z.infer<typeof InstagramCommentSchema>;
export type InstagramMention = z.infer<typeof InstagramMentionSchema>;
export type InstagramStoryInsight = z.infer<typeof InstagramStoryInsightSchema>;
export type InstagramLiveComment = z.infer<typeof InstagramLiveCommentSchema>;
export type InstagramBusinessAccount = z.infer<typeof InstagramBusinessAccountSchema>;

// ============================================================================
// WEBHOOK PAYLOAD STRUCTURE FROM META
// ============================================================================

/**
 * Standard webhook payload structure from Meta
 */
export const MetaInstagramWebhookPayloadSchema = z.object({
  object: z.string(), // 'instagram' for Instagram webhooks
  entry: z.array(z.object({
    id: z.string(), // Instagram Business Account ID
    time: z.number(),
    messaging: z.array(z.any()).optional(), // Messaging events
    changes: z.array(z.object({
      field: z.string(),
      value: z.any(),
    })).optional(), // Other change events
  })),
});

export type MetaInstagramWebhookPayload = z.infer<typeof MetaInstagramWebhookPayloadSchema>;

