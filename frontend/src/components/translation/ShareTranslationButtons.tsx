import React from 'react';
import { useTikTokShare } from '../../hooks/useTikTokShare';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';

interface ShareTranslationButtonsProps {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
}

const ShareTranslationButtons: React.FC<ShareTranslationButtonsProps> = ({
  originalText,
  translatedText,
  fromLanguage,
  toLanguage
}) => {
  const { shareTranslation, isShareKitReady } = useTikTokShare();
  
  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES[code] || code;
  };
  
  const handleTikTokShare = () => {
    shareTranslation(
      originalText,
      translatedText,
      getLanguageName(fromLanguage),
      getLanguageName(toLanguage)
    );
  };
  
  return (
    <div className="share-translation-buttons">
      <button
        className="share-button tiktok-share"
        onClick={handleTikTokShare}
        disabled={!isShareKitReady()}
      >
        <img src="/assets/tiktok-icon.svg" alt="TikTok" />
        Share on TikTok
      </button>
      
      {/* Other share buttons (Twitter, WhatsApp, etc.) */}
    </div>
  );
};

export default ShareTranslationButtons; 