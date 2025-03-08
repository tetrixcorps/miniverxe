import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../services/api';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';

interface TranslatedVideo {
  id: string;
  original_title: string;
  original_author: string;
  original_language: string;
  target_language: string;
  cover_image_url: string;
  created_at: string;
}

const TranslatedVideosList: React.FC = () => {
  const [translations, setTranslations] = useState<TranslatedVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  
  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/content/tiktok/translations');
        setTranslations(response.data.translations);
      } catch (err) {
        console.error('Failed to fetch translations:', err);
        setError(err.response?.data?.detail || 'Failed to load translations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTranslations();
  }, [api]);
  
  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES[code] || code;
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading translations...</p>
      </div>
    );
  }
  
  if (error) {
    return <Alert type="error" message={error} />;
  }
  
  if (translations.length === 0) {
    return (
      <div className="empty-translations">
        <h3>No Translated Videos</h3>
        <p>
          You haven't translated any TikTok videos yet. 
          Try translating a video to see it here.
        </p>
        <Link to="/tiktok-translator" className="primary-button">
          Translate a Video
        </Link>
      </div>
    );
  }
  
  return (
    <div className="translated-videos-list">
      <div className="list-header">
        <h2>Your Translated TikTok Videos</h2>
        <Link to="/tiktok-translator" className="secondary-button">
          Translate New Video
        </Link>
      </div>
      
      <div className="translations-grid">
        {translations.map((translation) => (
          <Link 
            key={translation.id}
            to={`/translations/${translation.id}`}
            className="translation-card"
          >
            <div className="card-thumbnail">
              <img 
                src={translation.cover_image_url} 
                alt={translation.original_title}
              />
            </div>
            <div className="card-content">
              <h3 className="video-title">{translation.original_title}</h3>
              <div className="video-author">@{translation.original_author}</div>
              <div className="translation-details">
                {getLanguageName(translation.original_language)} → {getLanguageName(translation.target_language)}
              </div>
              <div className="translation-date">
                {formatDistanceToNow(new Date(translation.created_at), { addSuffix: true })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TranslatedVideosList; 