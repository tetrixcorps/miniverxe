import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/api';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';

interface TranslatedVideo {
  id: string;
  tiktok_video_id: string;
  original_title: string;
  original_author: string;
  original_language: string;
  target_language: string;
  original_text: string;
  translated_text: string;
  cover_image_url: string;
  share_url: string;
  subtitle_path: string;
  audio_translation_path: string;
  created_at: string;
}

const TranslatedVideoPlayer: React.FC = () => {
  const { translationId } = useParams<{ translationId: string }>();
  const [translation, setTranslation] = useState<TranslatedVideo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginalText, setShowOriginalText] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<'original' | 'translated'>('original');
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  
  const api = useApi();
  
  useEffect(() => {
    const fetchTranslation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/content/tiktok/translations/${translationId}`);
        setTranslation(response.data.translation);
      } catch (err) {
        console.error('Failed to fetch translation:', err);
        setError(err.response?.data?.detail || 'Failed to load translation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (translationId) {
      fetchTranslation();
    }
  }, [translationId, api]);
  
  const handleAudioChange = (mode: 'original' | 'translated') => {
    setAudioMode(mode);
    
    // If we're switching to translated audio, pause the video and play the audio
    if (mode === 'translated' && videoRef.current) {
      videoRef.current.pause();
      // In a real implementation, this would play the translated audio
    }
  };
  
  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES[code] || code;
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading translation...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <Alert type="error" message={error} />
        <button
          className="secondary-button"
          onClick={() => navigate('/tiktok-translator')}
        >
          Back to Translator
        </button>
      </div>
    );
  }
  
  if (!translation) {
    return (
      <div className="not-found-container">
        <h2>Translation Not Found</h2>
        <p>The requested translation could not be found.</p>
        <button
          className="secondary-button"
          onClick={() => navigate('/tiktok-translator')}
        >
          Back to Translator
        </button>
      </div>
    );
  }
  
  return (
    <div className="translated-video-player">
      <div className="video-player-header">
        <h2>{translation.original_title}</h2>
        <div className="video-author">
          <span>By @{translation.original_author}</span>
        </div>
        <div className="translation-info">
          <span>Translated from {getLanguageName(translation.original_language)} to {getLanguageName(translation.target_language)}</span>
        </div>
      </div>
      
      <div className="video-player-container">
        <div className="video-container">
          {/* In a real implementation, this would use the actual video URL */}
          <video
            ref={videoRef}
            controls
            poster={translation.cover_image_url}
            src={`/api/proxy/video/${translation.tiktok_video_id}`}
          >
            {translation.subtitle_path && (
              <track
                kind="subtitles"
                src={`/api/translations/subtitles/${translation.id}`}
                srcLang={translation.target_language}
                label={getLanguageName(translation.target_language)}
                default
              />
            )}
          </video>
          
          <div className="video-controls">
            <div className="audio-selector">
              <label>Audio:</label>
              <div className="toggle-buttons">
                <button
                  className={audioMode === 'original' ? 'active' : ''}
                  onClick={() => handleAudioChange('original')}
                >
                  Original
                </button>
                <button
                  className={audioMode === 'translated' ? 'active' : ''}
                  onClick={() => handleAudioChange('translated')}
                  disabled={!translation.audio_translation_path}
                >
                  Translated
                </button>
              </div>
            </div>
            
            <a
              href={translation.share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="view-original-button"
            >
              View Original on TikTok
            </a>
          </div>
        </div>
        
        <div className="translation-text-container">
          <div className="text-controls">
            <button
              className={showOriginalText ? '' : 'active'}
              onClick={() => setShowOriginalText(false)}
            >
              Translated Text
            </button>
            <button
              className={showOriginalText ? 'active' : ''}
              onClick={() => setShowOriginalText(true)}
            >
              Original Text
            </button>
          </div>
          
          <div className="text-content">
            {showOriginalText ? (
              <div className="original-text">
                <h4>Original ({getLanguageName(translation.original_language)})</h4>
                <p>{translation.original_text}</p>
              </div>
            ) : (
              <div className="translated-text">
                <h4>Translated ({getLanguageName(translation.target_language)})</h4>
                <p>{translation.translated_text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="educational-note">
        <p>
          <strong>Educational Use Notice:</strong> This translated content is provided for educational
          purposes only to help users understand content in languages they don't speak.
        </p>
      </div>
    </div>
  );
};

export default TranslatedVideoPlayer; 