import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CodeAcademyAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Code Academy authentication...');

  useEffect(() => {
    const handleCodeAcademyAuth = async () => {
      try {
        // Get the tetrix_auth_token from URL parameter or localStorage
        const { token } = router.query;
        let tetrixToken = token as string || localStorage.getItem('tetrix_auth_token');
        
        if (!tetrixToken) {
          throw new Error('No TETRIX authentication token found');
        }

        // Get the redirect parameter to know where to go after auth
        const { redirect } = router.query;
        
        // Store the TETRIX token for Code Academy to use
        localStorage.setItem('tetrix_integration_token', tetrixToken);
        localStorage.setItem('tetrix_integration_status', 'connected');
        localStorage.setItem('tetrix_integration_timestamp', new Date().toISOString());

        // Notify parent window (Code Academy dashboard) that authentication was successful
        if (window.opener) {
          window.opener.postMessage({
            type: 'TETRIX_AUTH_SUCCESS',
            token: tetrixToken,
            timestamp: new Date().toISOString()
          }, 'https://poisonedreligion.ai');
        }

        setStatus('success');
        setMessage('TETRIX authentication successful! You can now close this window.');

        // Auto-close after 2 seconds
        setTimeout(() => {
          window.close();
        }, 2000);

        // If there's a redirect parameter, navigate there
        if (redirect && typeof redirect === 'string') {
          setTimeout(() => {
            window.location.href = `/${redirect}`;
          }, 1000);
        }

      } catch (error) {
        console.error('TETRIX authentication error:', error);
        setStatus('error');
        setMessage('TETRIX authentication failed. Please try again.');
        
        // Notify parent window of failure
        if (window.opener) {
          window.opener.postMessage({
            type: 'TETRIX_AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 'https://poisonedreligion.ai');
        }
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleCodeAcademyAuth();
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>TETRIX Authentication - Code Academy</title>
        <meta name="description" content="TETRIX authentication callback for Code Academy platform" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Status Icon */}
            <div className="w-16 h-16 mx-auto mb-6">
              {status === 'loading' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
              {status === 'loading' && 'Authenticating with TETRIX...'}
              {status === 'success' && 'Authentication Successful!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Action Buttons */}
            {status === 'success' && (
              <div className="space-y-3">
                <button
                  onClick={() => window.close()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Close Window
                </button>
                <button
                  onClick={() => window.location.href = '/code-academy/dashboard'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Go to Code Academy
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.close()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}

            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-sm text-gray-500">
                Please wait while we process your authentication...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
