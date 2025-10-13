// Voice Call Interface Component
// Provides UI for initiating and managing voice calls with Telnyx

import React, { useState, useEffect } from 'react';

interface VoiceCallInterfaceProps {
  onCallInitiated?: (sessionId: string) => void;
  onCallEnded?: (sessionId: string) => void;
}

interface CallSession {
  sessionId: string;
  phoneNumber: string;
  status: string;
  startTime: Date;
  transcription?: {
    text: string;
    confidence: number;
    language: string;
    timestamp: Date;
  };
  recording?: {
    url: string;
    duration: number;
    format: string;
  };
}

export const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({
  onCallInitiated,
  onCallEnded
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [activeSessions, setActiveSessions] = useState<CallSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CallSession | null>(null);
  const [callConfig, setCallConfig] = useState({
    recordCall: true,
    transcriptionEnabled: true,
    language: 'en-US',
    timeout: 30,
    maxDuration: 300
  });

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/voice/sessions');
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  // Initiate voice call
  const initiateCall = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setIsCalling(true);
    
    try {
      const response = await fetch('/api/voice/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: phoneNumber,
          from: process.env.NEXT_PUBLIC_TELNYX_PHONE_NUMBER || '+1234567890',
          webhookUrl: `${window.location.origin}/api/voice/webhook`,
          ...callConfig
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = data.sessionId;
        
        if (onCallInitiated) {
          onCallInitiated(sessionId);
        }
        
        // Refresh sessions
        await fetchActiveSessions();
        
        // Clear phone number
        setPhoneNumber('');
      } else {
        const error = await response.json();
        alert(`Failed to initiate call: ${error.message}`);
      }
    } catch (error) {
      console.error('Call initiation failed:', error);
      alert('Failed to initiate call. Please try again.');
    } finally {
      setIsCalling(false);
    }
  };

  // End call
  const endCall = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/voice/end/${sessionId}`, {
        method: 'POST'
      });

      if (response.ok) {
        if (onCallEnded) {
          onCallEnded(sessionId);
        }
        
        // Refresh sessions
        await fetchActiveSessions();
      }
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="voice-call-interface p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        &#127908; SHANGO Voice Assistant
      </h2>

      {/* Call Initiation */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number (e.g., +1234567890)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCalling}
          />
          <button
            onClick={initiateCall}
            disabled={isCalling || !phoneNumber.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCalling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Calling...
              </>
            ) : (
              <>
                &#128222; Call
              </>
            )}
          </button>
        </div>

        {/* Call Configuration */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={callConfig.recordCall}
              onChange={(e) => setCallConfig(prev => ({ ...prev, recordCall: e.target.checked }))}
              className="rounded"
            />
            Record Call
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={callConfig.transcriptionEnabled}
              onChange={(e) => setCallConfig(prev => ({ ...prev, transcriptionEnabled: e.target.checked }))}
              className="rounded"
            />
            Enable Transcription
          </label>
          <div>
            <label className="block text-gray-600 mb-1">Language:</label>
            <select
              value={callConfig.language}
              onChange={(e) => setCallConfig(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-1 border border-gray-300 rounded"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Timeout (seconds):</label>
            <input
              type="number"
              value={callConfig.timeout}
              onChange={(e) => setCallConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
              className="w-full px-3 py-1 border border-gray-300 rounded"
              min="10"
              max="60"
            />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Active Voice Sessions ({activeSessions.length})
        </h3>
        
        {activeSessions.length === 0 ? (
          <p className="text-gray-500 italic">No active voice sessions</p>
        ) : (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.sessionId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSession?.sessionId === session.sessionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">
                      {session.phoneNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: <span className={`font-medium ${
                        session.status === 'completed' ? 'text-green-600' :
                        session.status === 'failed' ? 'text-red-600' :
                        session.status === 'in_progress' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Started: {new Date(session.startTime).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {session.status === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          endCall(session.sessionId);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        End Call
                      </button>
                    )}
                  </div>
                </div>

                {/* Transcription */}
                {session.transcription && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Transcription:
                    </div>
                    <div className="text-sm text-gray-600">
                      "{session.transcription.text}"
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(session.transcription.confidence * 100)}% | 
                      Language: {session.transcription.language}
                    </div>
                  </div>
                )}

                {/* Recording */}
                {session.recording && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Recording:
                    </div>
                    <audio controls className="w-full">
                      <source src={session.recording.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="text-xs text-gray-500 mt-1">
                      Duration: {Math.round(session.recording.duration)}s | 
                      Format: {session.recording.format}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Details */}
      {selectedSession && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">
            Session Details: {selectedSession.sessionId}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Phone Number:</span>
              <div className="text-gray-800">{selectedSession.phoneNumber}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <div className="text-gray-800">{selectedSession.status}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Start Time:</span>
              <div className="text-gray-800">
                {new Date(selectedSession.startTime).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Duration:</span>
              <div className="text-gray-800">
                {Math.round((Date.now() - new Date(selectedSession.startTime).getTime()) / 1000)}s
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCallInterface;
