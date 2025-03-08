import React, { useState, useRef } from 'react';
import { useApi } from '../../services/api';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import LanguageSelector from '../LanguageSelector';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';

const TikTokTranslator: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [includeSubtitles, setIncludeSubtitles] = useState<boolean>(true);
  const [includeAudio, setIncludeAudio] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translationId, setTranslationId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const api = useApi();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a TikTok video URL');
      return;
    }
    
    if (!targetLanguage) {
      setError('Please select a target language');
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await api.post('/content/tiktok/translate', {
        video_url: videoUrl,
        target_language: targetLanguage,
        include_subtitles: includeSubtitles,
        include_audio_translation: includeAudio
      });
      
      setTranslationId(response.data.translated_video_id);
      
      // Clear form after successful processing
      setVideoUrl('');
      formRef.current?.reset();
    } catch (err) {
      console.error('Failed to translate TikTok video:', err);
      setError(err.response?.data?.detail || 'Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="tiktok-translator">
      <div className="translator-header">
        <h2>TikTok Video Translator</h2>
        <p className="translator-description">
          Translate TikTok videos from languages you don't understand into your preferred language.
          Simply paste the TikTok video URL below.
        </p>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {translationId ? (
        <div className="translation-success">
          <div className="success-icon">✓</div>
          <h3>Video Processing Complete!</h3>
          <p>Your video has been processed successfully.</p>
          <div className="success-actions">
            <button
              className="primary-button"
              onClick={() => window.location.href = `/translations/${translationId}`}
            >
              View Translation
            </button>
            <button
              className="secondary-button"
              onClick={() => setTranslationId(null)}
            >
              Translate Another Video
            </button>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="tiktok-translator-form">
          <div className="form-group">
            <label htmlFor="video-url">TikTok Video URL</label>
            <input
              type="url"
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@username/video/1234567890123456789"
              disabled={isProcessing}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="target-language">Translate to Language</label>
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onChange={(lang) => setTargetLanguage(lang)}
              showAfricanLanguagesFirst
              disabled={isProcessing}
            />
          </div>
          
          <div className="form-options">
            <div className="form-check">
              <input
                type="checkbox"
                id="include-subtitles"
                checked={includeSubtitles}
                onChange={(e) => setIncludeSubtitles(e.target.checked)}
                disabled={isProcessing}
              />
              <label htmlFor="include-subtitles">Include Subtitles</label>
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="include-audio"
                checked={includeAudio}
                onChange={(e) => setIncludeAudio(e.target.checked)}
                disabled={isProcessing}
              />
              <label htmlFor="include-audio">Include Audio Translation</label>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="small" />
                  Processing...
                </>
              ) : (
                'Translate Video'
              )}
            </button>
          </div>
        </form>
      )}
      
      <div className="educational-note">
        <h4>Educational Use Notice</h4>
        <p>
          This feature is designed for educational purposes only, to help users understand content
          in languages they don't speak. Please respect creators' rights and TikTok's terms of service.
        </p>
      </div>
    </div>
  );
};

export default TikTokTranslator; 