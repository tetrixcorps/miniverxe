import React, { useState, useRef, useEffect } from 'react';
import { IVSBroadcastClient } from 'amazon-ivs-web-broadcast';
import { useApi } from '../services/api';
import TikTokPublishModal from './TikTokPublishModal';
import { useAuth } from '../contexts/AuthContext';
import { useTikTokIntegration } from '../hooks/useTikTokIntegration';

const CreatorStudio: React.FC = () => {
  const [broadcastState, setBroadcastState] = useState<'idle'|'preparing'|'live'|'ended'>('idle');
  const [audienceCount, setAudienceCount] = useState(0);
  const [isPremiumBroadcast, setIsPremiumBroadcast] = useState(false);
  const broadcastClient = useRef<IVSBroadcastClient | null>(null);
  const api = useApi();
  
  // New state for TikTok integration
  const [showTikTokPublish, setShowTikTokPublish] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDescription, setBroadcastDescription] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);
  
  const { user } = useAuth();
  const { hasConnectedTikTok, connectTikTok } = useTikTokIntegration();
  
  // Record broadcast for later publishing to TikTok
  useEffect(() => {
    if (broadcastState === 'live' && hasConnectedTikTok) {
      startRecording();
    } else if (broadcastState !== 'live' && mediaRecorder.current?.state === 'recording') {
      stopRecording();
    }
  }, [broadcastState, hasConnectedTikTok]);
  
  const startRecording = () => {
    if (!broadcastClient.current) return;
    
    const stream = broadcastClient.current.getOutputVideoStream();
    if (!stream) return;
    
    mediaRecorder.current = new MediaRecorder(stream);
    recordedChunks.current = [];
    
    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.current.push(e.data);
      }
    };
    
    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(recordedChunks.current, { type: 'video/mp4' });
      setRecordedVideo(videoBlob);
    };
    
    mediaRecorder.current.start(1000); // Collect 1 second chunks
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }
  };
  
  // End broadcast and offer TikTok publish option
  const endBroadcast = async () => {
    // Stop existing broadcast logic
    if (broadcastClient.current) {
      await broadcastClient.current.stopBroadcast();
    }
    
    setBroadcastState('ended');
    stopRecording();
    
    // If user has TikTok connected, show publish option
    if (hasConnectedTikTok && recordedVideo) {
      setShowTikTokPublish(true);
    }
  };
  
  // Set up broadcast
  const startBroadcast = async () => {
    setBroadcastState('preparing');
    
    try {
      // Get stream key from backend
      const { streamKey, channelArn } = await api.createBroadcast({
        title: broadcastTitle,
        description: broadcastDescription,
        isPremium: isPremiumBroadcast,
        scheduledStartTime: scheduledTime || new Date(),
        primaryLanguage: primaryLanguage,
        supportedLanguages: selectedLanguages,
      });
      
      // Initialize IVS client
      broadcastClient.current = IVSBroadcastClient.create({
        streamConfig: {
          maxResolution: resolution,
          maxFramerate: 30,
          maxBitrate: 1500000,
        },
      });
      
      // Set up devices
      const devices = await broadcastClient.current.getDevices();
      await broadcastClient.current.setVideoDevice(selectedVideoDevice);
      await broadcastClient.current.setAudioDevice(selectedAudioDevice);
      
      // Start broadcast
      await broadcastClient.current.startBroadcast(streamKey);
      setBroadcastState('live');
      
      // Start audience monitoring
      startAudienceTracking(channelArn);
    } catch (error) {
      console.error('Failed to start broadcast:', error);
      setBroadcastState('idle');
    }
  };
  
  return (
    <div className="creator-studio">
      {/* Studio UI components */}
      
      {/* TikTok connection status */}
      <div className="tiktok-integration-status">
        {hasConnectedTikTok ? (
          <div className="tiktok-connected">
            <span className="tiktok-badge">TikTok Connected</span>
            <p>Your broadcast can be shared directly to TikTok</p>
          </div>
        ) : (
          <button 
            className="connect-tiktok-button" 
            onClick={connectTikTok}
          >
            Connect TikTok Account
          </button>
        )}
      </div>
      
      {/* TikTok Publish Modal */}
      {showTikTokPublish && recordedVideo && (
        <TikTokPublishModal
          videoBlob={recordedVideo}
          title={broadcastTitle}
          description={broadcastDescription}
          onClose={() => setShowTikTokPublish(false)}
        />
      )}
    </div>
  );
};

export default CreatorStudio; 