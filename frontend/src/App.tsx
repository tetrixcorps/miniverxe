import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Loading from './components/common/Loading';

// Lazily load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TranscriptionEditor = lazy(() => import('./pages/TranscriptionEditor'));
const ImageAnalysis = lazy(() => import('./pages/ImageAnalysis'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Media Processing components
const MediaProcessing = lazy(() => import('./pages/media/MediaProcessing'));
const MediaUpload = lazy(() => import('./pages/media/MediaUpload'));
const MediaEnhancement = lazy(() => import('./pages/media/MediaEnhancement'));
const MediaLibrary = lazy(() => import('./pages/media/MediaLibrary'));
const MediaTranscript = lazy(() => import('./pages/media/MediaTranscript'));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transcription" element={<TranscriptionEditor />} />
            <Route path="/image-analysis" element={<ImageAnalysis />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Media Processing Routes */}
            <Route path="/media" element={<MediaLibrary />} />
            <Route path="/media/upload" element={<MediaUpload />} />
            <Route path="/media/process/:taskId" element={<MediaProcessing />} />
            <Route path="/media/enhance/:mediaId" element={<MediaEnhancement />} />
            <Route path="/media/transcript/:taskId" element={<MediaTranscript />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 