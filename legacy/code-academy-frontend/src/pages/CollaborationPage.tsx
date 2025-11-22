import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, 
  Users, 
  MessageCircle, 
  Share2, 
  Settings, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff,
  Phone,
  PhoneOff,
  MoreVertical,
  UserPlus,
  Crown,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ScreenShare,
  StopScreenShare,
  Chat,
  Send,
  Smile,
  Paperclip,
  Download,
  Bookmark,
  Flag,
  MoreHorizontal
} from 'lucide-react';

// Types
interface VideoRoom {
  id: string;
  name: string;
  description: string;
  host: Participant;
  participants: Participant[];
  maxParticipants: number;
  isRecording: boolean;
  isScreenSharing: boolean;
  createdAt: Date;
  status: 'active' | 'ended' | 'scheduled';
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'host' | 'co-host' | 'participant';
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  joinedAt: Date;
}

interface Message {
  id: string;
  author: Participant;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file';
  isEdited?: boolean;
  reactions: Reaction[];
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ChatMessage {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system';
}

const CollaborationPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<VideoRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadRoom(roomId);
    }
  }, [roomId]);

  const loadRoom = async (id: string) => {
    setLoading(true);
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockRoom: VideoRoom = {
        id: id,
        name: 'React Study Group',
        description: 'Advanced React patterns discussion',
        host: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '/avatars/john.jpg',
          role: 'host',
          isMuted: false,
          isVideoOn: true,
          isSpeaking: false,
          joinedAt: new Date()
        },
        participants: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/avatars/john.jpg',
            role: 'host',
            isMuted: false,
            isVideoOn: true,
            isSpeaking: false,
            joinedAt: new Date()
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: '/avatars/jane.jpg',
            role: 'participant',
            isMuted: true,
            isVideoOn: true,
            isSpeaking: true,
            joinedAt: new Date(Date.now() - 5 * 60 * 1000)
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            avatar: '/avatars/mike.jpg',
            role: 'participant',
            isMuted: false,
            isVideoOn: false,
            isSpeaking: false,
            joinedAt: new Date(Date.now() - 10 * 60 * 1000)
          }
        ],
        maxParticipants: 10,
        isRecording: false,
        isScreenSharing: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        status: 'active'
      };

      setRoom(mockRoom);
      setIsJoined(true);
      setLoading(false);
    }, 1000);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLeaveRoom = () => {
    navigate('/dashboard');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        author: 'You',
        content: chatMessage,
        timestamp: new Date(),
        type: 'message'
      };
      setMessages([...messages, newMessage]);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Joining room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold">{room.name}</h1>
              <p className="text-sm text-gray-400">{room.participants.length} of {room.maxParticipants} participants</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Recording</span>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleLeaveRoom}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Leave
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {room.participants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-gray-800 rounded-lg overflow-hidden ${
                    participant.isSpeaking ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {participant.isVideoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{participant.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{participant.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Participant Controls */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {participant.isMuted && (
                        <div className="bg-red-600 text-white p-1 rounded">
                          <MicOff className="h-3 w-3" />
                        </div>
                      )}
                      {participant.role === 'host' && (
                        <div className="bg-yellow-600 text-white p-1 rounded">
                          <Crown className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleMuteToggle}
                className={`p-3 rounded-full transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              
              <button
                onClick={handleVideoToggle}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isVideoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
              
              <button
                onClick={handleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {isScreenSharing ? <StopScreenShare className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-colors ${
                  showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                <Chat className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`p-3 rounded-full transition-colors ${
                  showParticipants ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                <Users className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleFullscreen}
                className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Chat */}
          {showChat && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(message => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {message.author[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{message.author}</span>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Participants */}
          {showParticipants && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Participants ({room.participants.length})</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {room.participants.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{participant.name}</span>
                        {participant.role === 'host' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        {participant.isMuted && <MicOff className="h-3 w-3" />}
                        {!participant.isVideoOn && <VideoOff className="h-3 w-3" />}
                        <span>Joined {participant.joinedAt.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite People</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationPage;
