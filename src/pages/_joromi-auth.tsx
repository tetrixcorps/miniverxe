import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function JoRoMiAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing JoRoMi authentication...');

  useEffect(() => {
    const handleJoRoMiAuth = async () => {
      try {
        // Check if user is authenticated in TETRIX
        const tetrixToken = localStorage.getItem('tetrix_auth_token');
        
        if (!tetrixToken) {
          // Redirect to TETRIX login if not authenticated
          window.location.href = '/?auth=joromi';
          return;
        }

        // Get the redirect parameter
        const { redirect } = router.query;
        
        // Store the authentication status for JoRoMi
        localStorage.setItem('joromi_auth_ready', 'true');
        localStorage.setItem('joromi_auth_timestamp', new Date().toISOString());

        setStatus('success');
        setMessage('TETRIX authentication verified! Redirecting to JoRoMi...');

        // Redirect to JoRoMi with authentication token
        setTimeout(() => {
          const joromiUrl = `http://localhost:3000/tetrix-auth?redirect=${redirect || 'joromi-dashboard'}&token=${tetrixToken}`;
          window.location.href = joromiUrl;
        }, 1500);

      } catch (error) {
        console.error('JoRoMi authentication error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleJoRoMiAuth();
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>JoRoMi Authentication - TETRIX Platform</title>
        <meta name="description" content="JoRoMi authentication handler for TETRIX platform" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Status Icon */}
            <div className="w-16 h-16 mx-auto mb-6">
              {status === 'loading' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Status Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'loading' && 'Verifying TETRIX Authentication...'}
              {status === 'success' && 'Authentication Verified!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Action Buttons */}
            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/?auth=joromi'}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Go to TETRIX Home
                </button>
              </div>
            )}

            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-sm text-gray-500">
                Please wait while we verify your authentication...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
