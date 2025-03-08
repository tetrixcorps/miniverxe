export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
  CREATOR = 'creator'
}

interface TierFeatures {
  dailyTranslationLimit: number;
  hasAds: boolean;
  supportedLanguages: string[];
  allowedBroadcastMinutes: number;
  accessToPremiumContent: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  [SubscriptionTier.FREE]: {
    dailyTranslationLimit: 5000,
    hasAds: true,
    supportedLanguages: ['eng', 'fra', 'swh', 'yor', 'hau'],
    allowedBroadcastMinutes: 0,
    accessToPremiumContent: false
  },
  [SubscriptionTier.PREMIUM]: {
    dailyTranslationLimit: Infinity,
    hasAds: false,
    supportedLanguages: ['eng', 'fra', 'swh', 'yor', 'hau', 'amh', 'zul', /* all languages */],
    allowedBroadcastMinutes: 30,
    accessToPremiumContent: true
  },
  // Additional tiers...
} 