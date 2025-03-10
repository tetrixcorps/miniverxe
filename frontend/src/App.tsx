import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';

// API and state
import { ApiClient } from './api/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { useOfflineHandler } from './hooks/useOfflineHandler';

// Themes
import { lightTheme, darkTheme, GlobalStyles } from './theme';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CreatorProtectedRoute from './components/auth/CreatorProtectedRoute';
import OfflineIndicator from './components/common/OfflineIndicator';
import SyncStatus from './components/common/SyncStatus';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import NotFound from './pages/NotFound';

// Existing pages
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

// Creator platform pages
import CreatorDashboard from './pages/creator/Dashboard';
import ContentManager from './pages/creator/ContentManager';
import CreateContent from './pages/creator/CreateContent';
import EditContent from './pages/creator/EditContent';
import AnalyticsDashboard from './pages/creator/AnalyticsDashboard';
import TranslationManager from './pages/creator/TranslationManager';
import StreamManager from './pages/creator/StreamManager';
import EarningsManager from './pages/creator/EarningsManager';

// Fan pages
import DiscoverCreators from './pages/fan/DiscoverCreators';
import CreatorProfile from './pages/fan/CreatorProfile';
import ContentView from './pages/fan/ContentView';
import LiveStreams from './pages/fan/LiveStreams';
import SubscriptionManager from './pages/fan/SubscriptionManager';

// Initialize API client
const apiClient = new ApiClient();

const App = () => {
  const [theme, setTheme] = React.useState('light');
  const [loading, setLoading] = React.useState(true);
  const { i18n } = useTranslation();
  const { isAuthenticated, user, initialize } = useAuth();
  const { isOffline, pendingRequests, queueRequest, retryFailedTasks } = useOfflineHandler(apiClient);
  
  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Initialize app
  React.useEffect(() => {
    const initApp = async () => {
      // Get stored theme
      const storedTheme = localStorage.getItem('theme') || 'light';
      setTheme(storedTheme);
      
      // Get stored language
      const storedLanguage = localStorage.getItem('language') || 'en';
      await i18n.changeLanguage(storedLanguage);
      
      // Initialize auth
      await initialize();
      
      setLoading(false);
    };
    
    initApp();
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <OfflineProvider value={{ isOffline, pendingRequests, queueRequest, retryFailedTasks }}>
          <NotificationProvider>
            <Router>
              <div className="app">
                <Header 
                  toggleTheme={toggleTheme} 
                  isDarkTheme={theme === 'dark'} 
                />
                
                {isOffline && <OfflineIndicator />}
                {pendingRequests.length > 0 && <SyncStatus />}
                
                <div className="content-wrapper">
                  {isAuthenticated && <Sidebar />}
                  
                  <main className="main-content">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                      
                      {/* Protected routes for all authenticated users */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/messages" 
                        element={
                          <ProtectedRoute>
                            <Messages />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/notifications" 
                        element={
                          <ProtectedRoute>
                            <Notifications />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Fan-specific routes */}
                      <Route 
                        path="/discover" 
                        element={
                          <ProtectedRoute>
                            <DiscoverCreators />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creators/:id" 
                        element={
                          <ProtectedRoute>
                            <CreatorProfile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/content/:id" 
                        element={
                          <ProtectedRoute>
                            <ContentView />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/livestreams" 
                        element={
                          <ProtectedRoute>
                            <LiveStreams />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/subscriptions" 
                        element={
                          <ProtectedRoute>
                            <SubscriptionManager />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Creator-specific routes */}
                      <Route 
                        path="/creator/dashboard" 
                        element={
                          <CreatorProtectedRoute>
                            <CreatorDashboard />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/content" 
                        element={
                          <CreatorProtectedRoute>
                            <ContentManager />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/content/new" 
                        element={
                          <CreatorProtectedRoute>
                            <CreateContent />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/content/:id/edit" 
                        element={
                          <CreatorProtectedRoute>
                            <EditContent />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/translations" 
                        element={
                          <CreatorProtectedRoute>
                            <TranslationManager />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/streams" 
                        element={
                          <CreatorProtectedRoute>
                            <StreamManager />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/analytics" 
                        element={
                          <CreatorProtectedRoute>
                            <AnalyticsDashboard />
                          </CreatorProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/creator/earnings" 
                        element={
                          <CreatorProtectedRoute>
                            <EarningsManager />
                          </CreatorProtectedRoute>
                        } 
                      />
                      
                      {/* Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
                
                <Footer />
              </div>
            </Router>
          </NotificationProvider>
        </OfflineProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

const AppWithProviders = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithProviders; 