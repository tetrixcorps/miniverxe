import React from 'react';
import TranslatedVideoPlayer from '../components/tiktok/TranslatedVideoPlayer';
import '../styles/tiktok-translation.css';

const TranslatedVideoPlayerPage: React.FC = () => {
  return (
    <div className="page-container">
      <TranslatedVideoPlayer />
    </div>
  );
};

export default TranslatedVideoPlayerPage; 