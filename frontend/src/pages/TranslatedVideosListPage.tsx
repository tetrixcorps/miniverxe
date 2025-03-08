import React from 'react';
import TranslatedVideosList from '../components/tiktok/TranslatedVideosList';
import '../styles/tiktok-translation.css';

const TranslatedVideosListPage: React.FC = () => {
  return (
    <div className="page-container">
      <TranslatedVideosList />
    </div>
  );
};

export default TranslatedVideosListPage; 