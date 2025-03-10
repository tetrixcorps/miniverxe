import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import './RingLightRoom.css';

interface RingLightRoomProps {
  roomId: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: number;
}

interface RoomParticipant {
  user_id: string;
  name: string;
  joined_at: number;
  [key: string]: any;
}

interface RoomState {
  room_id: string;
  name: string;
  owner_id: string;
  participants: RoomParticipant[];
  active_stream: string | null;
  is_moderator: boolean;
  chat_messages: ChatMessage[];
}

const RingLightRoom: React.FC<RingLightRoomProps> = ({ roomId, onClose }) => {
  const { user } = useAuth();
  const wsUrl = `ws://${window.location.host}/api/ringlight/rooms/${roomId}/ws`;
  const { sendMessage, isConnected } = useWebSocket(wsUrl);
  
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModerating, setIsModerating] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleWSMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'room_state':
          setRoomState(data);
          setMessages(data.chat_messages || []);
          break;
        case 'chat_message':
          setMessages(prev => [...prev, data]);
          break;
        case 'stream_started':
          // Connect to stream
          if (videoRef.current) {
            // In a real implementation, this would connect to the video stream
            // For now, we'll just update the UI
            console.log(`Stream started: ${data.stream_id}`);
          }
          break;
        case 'stream_ended':
          // Disconnect from stream
          if (videoRef.current) {
            videoRef.current.src = '';
          }
          break;
        case 'stream_paused':
          // Pause stream
          if (videoRef.current) {
            videoRef.current.pause();
          }
          break;
        case 'kicked':
          alert(data.message || 'You have been kicked from the room');
          onClose();
          break;
        default:
          console.log('Unhandled WebSocket message:', data);
      }
    };
    
    window.addEventListener('message', handleWSMessage);
    return () => window.removeEventListener('message', handleWSMessage);
  }, [onClose]);
  
  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Send heartbeat every 30 seconds to keep connection alive
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (isConnected) {
        sendMessage({ type: 'heartbeat' });
      }
    }, 30000);
    
    return () => clearInterval(heartbeatInterval);
  }, [isConnected, sendMessage]);
  
  // Join room on component mount
  useEffect(() => {
    if (isConnected && user) {
      sendMessage({
        type: 'join_room',
        user_data: {
          name: user.name || 'Anonymous',
          avatar: user.avatar
        }
      });
    }
    
    // Leave room on component unmount
    return () => {
      if (isConnected) {
        sendMessage({ type: 'leave_room' });
      }
    };
  }, [isConnected, user, sendMessage]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && isConnected) {
      sendMessage({
        type: 'chat_message',
        content: message.trim()
      });
      setMessage('');
    }
  };
  
  const handleModeratorAction = (action: string) => {
    if (!selectedParticipant || !isConnected || !roomState?.is_moderator) {
      return;
    }
    
    sendMessage({
      type: 'moderator_action',
      action,
      target_data: {
        target_id: selectedParticipant,
        message: `You have been ${action === 'kick' ? 'kicked' : action === 'mute' ? 'muted' : 'banned'} by a moderator`
      }
    });
    
    setSelectedParticipant(null);
  };
  
  const handleStartStream = () => {
    if (!isConnected || !user) return;
    
    sendMessage({
      type: 'start_stream',
      stream_config: {
        title: `${user.name}'s Stream`,
        record: true,
        sample_rate: 2
      }
    });
  };
  
  const handleStopStream = () => {
    if (!isConnected || !roomState?.active_stream) return;
    
    sendMessage({
      type: 'stop_stream',
      stream_id: roomState.active_stream
    });
  };
  
  // Handle SIP moderation call
  const handleSIPModeration = () => {
    if (!isConnected || !roomState?.is_moderator) return;
    
    sendMessage({
      type: 'sip_moderation',
      action: 'start_call'
    });
    
    // In a real implementation, this would connect to the SIP call
    setIsModerating(true);
  };
  
  const handleEndSIPModeration = () => {
    if (!isConnected) return;
    
    sendMessage({
      type: 'sip_moderation',
      action: 'end_call'
    });
    
    setIsModerating(false);
  };
  
  if (!roomState) {
    return (
      <div className="ring-light-loading">
        <div className="spinner"></div>
        <p>Joining room...</p>
      </div>
    );
  }
  
  return (
    <div className="ring-light-room">
      <div className="room-header">
        <h2>{roomState.name}</h2>
        <div className="room-controls">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      
      <div className="room-content">
        <div className="stream-container">
          {roomState.active_stream ? (
            <div className="active-stream">
              <video ref={videoRef} autoPlay />
              
              {roomState.is_moderator && (
                <div className="stream-controls">
                  <button 
                    className="stream-control-button"
                    onClick={handleSIPModeration}
                    disabled={isModerating}
                  >
                    SIP Moderation
                  </button>
                  
                  {isModerating && (
                    <button 
                      className="stream-control-button end-moderation"
                      onClick={handleEndSIPModeration}
                    >
                      End Moderation
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-stream">
              <p>No active stream</p>
              {roomState.is_moderator && (
                <button 
                  className="start-stream-button"
                  onClick={handleStartStream}
                >
                  Start Streaming
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="chat-sidebar">
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`chat-message ${msg.sender_id === user?.id ? 'own-message' : ''}`}
              >
                <div className="message-header">
                  <span className="sender-name">{msg.sender_name}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
          </div>
          
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !message.trim()}>
              Send
            </button>
          </form>
        </div>
        
        {roomState.is_moderator && (
          <div className="participants-sidebar">
            <h3>Participants</h3>
            <ul className="participant-list">
              {roomState.participants.map(participant => (
                <li 
                  key={participant.user_id}
                  className={`participant ${selectedParticipant === participant.user_id ? 'selected' : ''}`}
                  onClick={() => setSelectedParticipant(
                    selectedParticipant === participant.user_id ? null : participant.user_id
                  )}
                >
                  <div className="participant-name">{participant.name}</div>
                  {participant.user_id === roomState.owner_id && (
                    <span className="owner-badge">Owner</span>
                  )}
                </li>
              ))}
            </ul>
            
            {selectedParticipant && (
              <div className="moderation-actions">
                <button onClick={() => handleModeratorAction('kick')}>
                  Kick User
                </button>
                <button onClick={() => handleModeratorAction('mute')}>
                  Mute User
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RingLightRoom; 