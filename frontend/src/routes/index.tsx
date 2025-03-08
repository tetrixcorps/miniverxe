import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import ChatPage from '../pages/ChatPage';
import TranslationPage from '../pages/TranslationPage';
import CreatorStudioPage from '../pages/CreatorStudioPage';
import NotFoundPage from '../pages/NotFoundPage';

// TikTok Translation Pages
import TikTokTranslatorPage from '../pages/TikTokTranslatorPage';
import TranslatedVideoPlayerPage from '../pages/TranslatedVideoPlayerPage';
import TranslatedVideosListPage from '../pages/TranslatedVideosListPage';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="translation" element={
              <ProtectedRoute>
                <TranslationPage />
              </ProtectedRoute>
            } />
            <Route path="creator-studio" element={
              <ProtectedRoute>
                <CreatorStudioPage />
              </ProtectedRoute>
            } />
            
            {/* TikTok Translation Routes */}
            <Route path="tiktok-translator" element={
              <ProtectedRoute>
                <TikTokTranslatorPage />
              </ProtectedRoute>
            } />
            <Route path="translations" element={
              <ProtectedRoute>
                <TranslatedVideosListPage />
              </ProtectedRoute>
            } />
            <Route path="translations/:translationId" element={
              <ProtectedRoute>
                <TranslatedVideoPlayerPage />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes; 