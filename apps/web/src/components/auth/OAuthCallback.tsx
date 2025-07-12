import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/api';

interface OAuthCallbackProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for OAuth errors
      if (error) {
        const errorMessage = errorDescription || 'OAuth authorization failed';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        const errorMessage = 'Missing required OAuth parameters';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);
        return;
      }

      // Verify state parameter
      const storedState = localStorage.getItem('oauth_state');
      const storedProvider = localStorage.getItem('oauth_provider');
      
      if (!storedState || !storedProvider) {
        const errorMessage = 'OAuth state not found. Please try logging in again.';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);
        return;
      }

      if (state !== storedState) {
        const errorMessage = 'OAuth state mismatch. Please try logging in again.';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);
        return;
      }

      // Exchange code for tokens
      const redirectUri = `${window.location.origin}/auth/callback`;
      const result = await apiService.handleOAuthCallback({
        code,
        state,
        provider: storedProvider,
        redirect_uri: redirectUri,
      });

      if (result.error) {
        const errorMessage = result.error || 'OAuth callback failed';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);
        return;
      }

      const data = result.data;

      // Authenticate with Firebase using the custom token
      if (data?.firebase_token) {
        try {
          await signInWithCustomToken(auth, data.firebase_token);
          
          // Clear OAuth state
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_provider');
          
          setStatus('success');
          onSuccess?.(data.user_record);
          
          // Redirect to dashboard or intended page
          const redirectTo = localStorage.getItem('redirect_after_login') || '/dashboard';
          localStorage.removeItem('redirect_after_login');
          navigate(redirectTo, { replace: true });
        } catch (loginError) {
          const errorMessage = 'Failed to authenticate with Firebase';
          setError(errorMessage);
          setStatus('error');
          onError?.(errorMessage);
        }
      } else {
        const errorMessage = 'No authentication token received';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Network error occurred during OAuth callback';
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Completing Login
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we complete your authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Login Successful
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback; 