import React, { useState } from 'react';
import { useApi } from '../services/api';
import LanguageSelector from './LanguageSelector';

interface TikTokPublishModalProps {
  videoBlob: Blob;
  title: string;
  description: string;
  onClose: () => void;
}

const TikTokPublishModal: React.FC<TikTokPublishModalProps> = ({
  videoBlob,
  title: initialTitle,
  description: initialDescription,
  onClose
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isPublishing, setIsPublishing] = useState(false);
  const [translateCaptions, setTranslateCaptions] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC'|'FRIENDS'|'PRIVATE'>('PUBLIC');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();
  
  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, 'broadcast.mp4');
      formData.append('title', title);
      formData.append('description', description);
      formData.append('privacy_level', privacyLevel);
      formData.append('translate_captions', String(translateCaptions));
      
      if (translateCaptions && selectedLanguages.length > 0) {
        selectedLanguages.forEach(lang => {
          formData.append('caption_languages', lang);
        });
      }
      
      const response = await api.post('/content/tiktok/publish', formData);
      
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to publish to TikTok. Please try again.');
      console.error('TikTok publish error:', err);
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="modal tiktok-publish-modal">
      <div className="modal-content">
        <h2>Publish to TikTok</h2>
        
        {isSuccess ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Successfully Published!</h3>
            <p>Your content is now available on TikTok</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="video-preview">
              <video src={URL.createObjectURL(videoBlob)} controls />
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2200}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="privacy">Privacy</label>
              <select 
                id="privacy"
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value as any)}
              >
                <option value="PUBLIC">Public</option>
                <option value="FRIENDS">Friends Only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="translate"
                checked={translateCaptions}
                onChange={(e) => setTranslateCaptions(e.target.checked)}
              />
              <label htmlFor="translate">
                Translate captions to multiple languages
              </label>
            </div>
            
            {translateCaptions && (
              <div className="language-selection">
                <LanguageSelector
                  selectedLanguages={selectedLanguages}
                  onChange={setSelectedLanguages}
                  multiple
                  showAfricanLanguagesFirst
                />
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={onClose}
                disabled={isPublishing}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish to TikTok'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TikTokPublishModal; 