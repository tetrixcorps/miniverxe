import { useAuth } from '../contexts/AuthContext';
import { useSubscriptionModals } from '../contexts/SubscriptionModalsContext';
import { useCallback } from 'react';
import { ContentType, AccessOptions, SubscriptionTier, TIER_ACCESS_RULES, TIER_FEATURES } from '../constants/subscription';

export const usePaywall = () => {
  const { user, subscription } = useAuth();
  const { showUpgradeModal } = useSubscriptionModals();
  
  const checkAccess = useCallback((contentType: ContentType, options?: AccessOptions) => {
    // Always allow free content
    if (!options?.isPremium) return { hasAccess: true };
    
    // Check if user is logged in
    if (!user) {
      return { 
        hasAccess: false,
        reason: 'login_required',
        upgradeAction: () => showAuthModal('login')
      };
    }
    
    // Check subscription tier
    const tierHasAccess = TIER_ACCESS_RULES[subscription.tier][contentType];
    if (!tierHasAccess) {
      return {
        hasAccess: false,
        reason: 'upgrade_required',
        upgradeAction: () => showUpgradeModal({
          currentTier: subscription.tier,
          requiredTier: options?.requiredTier || SubscriptionTier.PREMIUM
        })
      };
    }
    
    // Check usage limits
    if (contentType === 'translation' && 
        subscription.dailyUsage >= TIER_FEATURES[subscription.tier].dailyTranslationLimit) {
      return {
        hasAccess: false,
        reason: 'usage_limit_reached',
        upgradeAction: () => showUpgradeModal({
          currentTier: subscription.tier,
          requiredTier: getNextTier(subscription.tier)
        })
      };
    }
    
    return { hasAccess: true };
  }, [user, subscription, showUpgradeModal]);
  
  return { checkAccess };
}; 