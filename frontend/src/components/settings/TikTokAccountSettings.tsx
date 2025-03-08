import React from 'react';
import { useTikTokIntegration } from '../../hooks/useTikTokIntegration';
import { Button, Avatar, Alert } from '../ui';

const TikTokAccountSettings: React.FC = () => {
  const {
    hasConnectedTikTok,
    isConnecting,
    connectionError,
    connectTikTok,
    disconnectTikTok,
    tiktokUsername,
    tikTokProfileImage
  } = useTikTokIntegration();
  
  return (
    <div className="tiktok-account-settings">
      <h3>TikTok Integration</h3>
      
      {connectionError && (
        <Alert type="error" message={connectionError} />
      )}
      
      {hasConnectedTikTok ? (
        <div className="connected-account">
          <div className="account-info">
            <Avatar src={tikTokProfileImage} alt={tiktokUsername} />
            <div className="account-details">
              <h4>Connected as @{tiktokUsername}</h4>
              <p>
                Your JoromiGPT account is connected to TikTok. 
                You can publish translations and broadcasts directly to TikTok.
              </p>
            </div>
          </div>
          <Button 
            variant="outline"
            color="secondary"
            onClick={disconnectTikTok}
          >
            Disconnect Account
          </Button>
        </div>
      ) : (
        <div className="connect-account">
          <p>
            Connect your TikTok account to share translations and broadcast 
            content directly to TikTok.
          </p>
          <Button
            onClick={connectTikTok}
            isLoading={isConnecting}
            loadingText="Connecting..."
            iconLeft={<img src="/assets/tiktok-logo.svg" alt="" width={20} height={20} />}
          >
            Connect TikTok Account
          </Button>
        </div>
      )}
      
      <div className="integration-permissions">
        <h4>What this integration can do:</h4>
        <ul>
          <li>Access your basic profile information</li>
          <li>Publish videos to your TikTok account</li>
          <li>Share translations as TikTok posts</li>
          <li>Check creator certification status</li>
        </ul>
        <p className="permission-note">
          You can revoke these permissions at any time by disconnecting your account.
        </p>
      </div>
    </div>
  );
};

export default TikTokAccountSettings; 