import { useEffect, useCallback } from 'react';

// Types for TikTok Share SDK
interface TikTokShareOptions {
  text?: string;
  title?: string;
  platform?: 'tiktok' | 'web';
  colorScheme?: 'light' | 'dark';
  orientation?: 'portrait' | 'landscape';
  hasGreenScreenEffect?: boolean;
  shareAsImage?: boolean;
}

declare global {
  interface Window {
    TikTokShare: {
      shareToTikTok: (options: TikTokShareOptions) => void;
    };
  }
}

export const useTikTokShare = () => {
  // Load TikTok Share SDK
  useEffect(() => {
    const loadShareKit = () => {
      const script = document.createElement('script');
      script.src = 'https://sf16-tiktok-web.ttwstatic.com/tiktok/share/tiktok-share-sdk.js';
      script.async = true;
      document.body.appendChild(script);
    };
    
    if (!window.TikTokShare) {
      loadShareKit();
    }
  }, []);
  
  // Check if TikTok Share SDK is ready
  const isShareKitReady = () => {
    return Boolean(window.TikTokShare);
  };
  
  // Share content to TikTok
  const shareToTikTok = useCallback((options: TikTokShareOptions) => {
    if (!isShareKitReady()) {
      console.error('TikTok Share SDK not loaded');
      return false;
    }
    
    try {
      window.TikTokShare.shareToTikTok(options);
      return true;
    } catch (error) {
      console.error('Failed to share to TikTok:', error);
      return false;
    }
  }, []);
  
  // Share translated content to TikTok
  const shareTranslation = useCallback((
    originalText: string,
    translatedText: string,
    originalLanguage: string,
    translatedLanguage: string
  ) => {
    return shareToTikTok({
      text: `${originalText}\n\n${translatedLanguage}: ${translatedText}`,
      title: `Translated from ${originalLanguage} to ${translatedLanguage} with JoromiGPT`,
      hasGreenScreenEffect: true
    });
  }, [shareToTikTok]);
  
  return {
    isShareKitReady,
    shareToTikTok,
    shareTranslation
  };
}; 