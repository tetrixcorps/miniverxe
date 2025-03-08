import { API_BASE_URL } from '../config';

interface TikTokAuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const tiktokAuth = {
  // Get TikTok OAuth URL
  getAuthUrl: async (redirectPath?: string): Promise<string> => {
    const state = redirectPath ? btoa(redirectPath) : '';
    const response = await fetch(`${API_BASE_URL}/auth/tiktok/url?state=${state}`);
    const data = await response.json();
    return data.url;
  },
  
  // Initiate TikTok login in a popup window
  login: (): Promise<TikTokAuthResponse> => {
    return new Promise((resolve, reject) => {
      const popupWidth = 800;
      const popupHeight = 600;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      
      const popup = window.open(
        '/auth/tiktok-redirect',
        'tiktok-login',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      );
      
      // Check if popup was blocked
      if (!popup || popup.closed) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }
      
      // Function to handle message from popup
      const handleMessage = (event: MessageEvent) => {
        // Verify origin
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'tiktok-auth-success') {
          window.removeEventListener('message', handleMessage);
          resolve(event.data.authResponse);
        } else if (event.data.type === 'tiktok-auth-error') {
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error));
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Monitor popup closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Authentication canceled'));
        }
      }, 1000);
    });
  }
}; 