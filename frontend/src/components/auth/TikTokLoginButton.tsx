import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tiktokAuth } from '../../services/auth/tikTokAuth';
import './TikTokLoginButton.css';

interface TikTokLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const TikTokLoginButton: React.FC<TikTokLoginButtonProps> = ({ 
  onSuccess, 
  onError 
}) => {
  const { login } = useAuth();
  
  const handleTikTokLogin = async () => {
    try {
      const authResponse = await tiktokAuth.login();
      await login(authResponse.access_token);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('TikTok login failed:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };
  
  return (
    <button 
      className="tiktok-login-button" 
      onClick={handleTikTokLogin}
    >
      <img 
        src="/assets/tiktok-logo.svg" 
        alt="TikTok Logo" 
        className="tiktok-logo" 
      />
      Continue with TikTok
    </button>
  );
};

export default TikTokLoginButton; 