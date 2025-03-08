import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tiktokAuth } from '../services/auth/tikTokAuth';
import { useApi } from '../services/api';

export const useTikTokIntegration = () => {
  const { user, refreshUser } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const api = useApi();
  
  // Check if user has connected TikTok account
  const hasConnectedTikTok = Boolean(
    user?.social_accounts?.tiktok?.access_token
  );
  
  // Check if TikTok token needs refresh
  const needsTokenRefresh = useCallback(() => {
    if (!hasConnectedTikTok) return false;
    
    const expiresAt = user?.social_accounts?.tiktok?.expires_at;
    if (!expiresAt) return true;
    
    // Token needs refresh if it expires in less than 24 hours
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    return (expiryTime - currentTime) < (24 * 60 * 60 * 1000);
  }, [user, hasConnectedTikTok]);
  
  // Refresh token if needed
  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      if (hasConnectedTikTok && needsTokenRefresh()) {
        try {
          await api.post('/auth/tiktok/refresh');
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh TikTok token:', error);
        }
      }
    };
    
    refreshTokenIfNeeded();
  }, [hasConnectedTikTok, needsTokenRefresh, api, refreshUser]);
  
  // Connect TikTok account
  const connectTikTok = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      await tiktokAuth.login();
      await refreshUser();
    } catch (error) {
      console.error('TikTok connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [refreshUser]);
  
  // Disconnect TikTok account
  const disconnectTikTok = useCallback(async () => {
    try {
      await api.post('/auth/tiktok/disconnect');
      await refreshUser();
    } catch (error) {
      console.error('Failed to disconnect TikTok account:', error);
    }
  }, [api, refreshUser]);
  
  return {
    hasConnectedTikTok,
    isConnecting,
    connectionError,
    connectTikTok,
    disconnectTikTok,
    tiktokUsername: user?.social_accounts?.tiktok?.username,
    tikTokProfileImage: user?.social_accounts?.tiktok?.profile_image
  };
}; 