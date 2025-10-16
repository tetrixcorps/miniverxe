import React, { useState, useEffect } from 'react';
import { voiceAPIService, CallParams, CallResponse, industryVoiceFunctions } from '../../services/voiceapi';

interface VoiceCallerProps {
  industry: string;
  contactInfo?: {
    name: string;
    phoneNumber: string;
    id?: string;
  };
  onCallInitiated?: (call: CallResponse) => void;
  onCallCompleted?: (call: CallResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

const VoiceCaller: React.FC<VoiceCallerProps> = ({
  industry,
  contactInfo,
  onCallInitiated,
  onCallCompleted,
  onError,
  className = ''
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [activeCall, setActiveCall] = useState<CallResponse | null>(null);
  const [callHistory, setCallHistory] = useState<CallResponse[]>([]);
  const [provider, setProvider] = useState<'vonage' | 'telnyx' | 'twilio'>('vonage');
  const [callSettings, setCallSettings] = useState({
    recordCall: true,
    transcriptionEnabled: true,
    language: 'en-US',
    timeout: 30,
    maxDuration: 300
  });

  useEffect(() => {
    // Set provider based on industry preferences
    const industryProviders = {
      healthcare: 'vonage',
      legal: 'telnyx',
      retail: 'twilio',
      construction: 'vonage',
      education: 'telnyx',
      government: 'telnyx',
      hospitality: 'twilio',
      logistics: 'vonage',
      wellness: 'telnyx',
      beauty: 'twilio'
    };
    
    const preferredProvider = industryProviders[industry as keyof typeof industryProviders] || 'vonage';
    setProvider(preferredProvider);
    voiceAPIService.setProvider(preferredProvider);
  }, [industry]);

  const initiateCall = async (phoneNumber: string, context?: any) => {
    if (isCalling) return;

    setIsCalling(true);
    setActiveCall(null);

    try {
      const callParams: CallParams = {
        to: phoneNumber,
        from: getIndustryPhoneNumber(industry),
        industry,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          provider
        },
        recordCall: callSettings.recordCall,
        transcriptionEnabled: callSettings.transcriptionEnabled,
        language: callSettings.language,
        timeout: callSettings.timeout,
        maxDuration: callSettings.maxDuration
      };

      const call = await voiceAPIService.initiateCall(callParams);
      setActiveCall(call);
      setCallHistory(prev => [call, ...prev]);
      onCallInitiated?.(call);

      // Simulate call completion after timeout (in real implementation, this would be handled by webhooks)
      setTimeout(() => {
        if (activeCall) {
          const completedCall = { ...activeCall, status: 'completed' as const };
          setActiveCall(null);
          setIsCalling(false);
          onCallCompleted?.(completedCall);
        }
      }, callSettings.timeout * 1000);

    } catch (error) {
      console.error('Error initiating call:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to initiate call');
      setIsCalling(false);
    }
  };

  const getIndustryPhoneNumber = (industry: string): string => {
    const industryNumbers = {
      healthcare: '+1-800-HEALTH',
      legal: '+1-800-LEGAL',
      retail: '+1-800-SUPPORT',
      construction: '+1-800-CONSTRUCTION',
      education: '+1-800-EDUCATION',
      government: '+1-800-GOVERNMENT',
      hospitality: '+1-800-HOSPITALITY',
      logistics: '+1-800-LOGISTICS',
      wellness: '+1-800-WELLNESS',
      beauty: '+1-800-BEAUTY'
    };
    return industryNumbers[industry as keyof typeof industryNumbers] || '+1-800-SUPPORT';
  };

  const getIndustryIcon = () => {
    const icons = {
      healthcare: '🏥',
      legal: '⚖️',
      retail: '🛒',
      construction: '🏗️',
      education: '🎓',
      government: '🏛️',
      hospitality: '🏨',
      logistics: '🚚',
      wellness: '🏥',
      beauty: '🎨'
    };
    return icons[industry as keyof typeof icons] || '📞';
  };

  const getProviderColor = () => {
    const colors = {
      vonage: 'purple',
      telnyx: 'blue',
      twilio: 'green'
    };
    return colors[provider] || 'gray';
  };

  const handleQuickCall = (type: string) => {
    if (!contactInfo?.phoneNumber) {
      onError?.('No contact phone number available');
      return;
    }

    const context = {
      type,
      contact: contactInfo,
      industry
    };

    initiateCall(contactInfo.phoneNumber, context);
  };

  return (
    <div className={`voice-caller ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getIndustryIcon()}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Voice Communication - {industry.charAt(0).toUpperCase() + industry.slice(1)}
              </h3>
              <p className="text-sm text-gray-500">
                Provider: {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isCalling ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isCalling ? 'Calling...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {contactInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">{contactInfo.name}</h4>
              <p className="text-blue-700">{contactInfo.phoneNumber}</p>
            </div>
            <button
              onClick={() => initiateCall(contactInfo.phoneNumber)}
              disabled={isCalling}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isCalling
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isCalling ? 'Calling...' : 'Call Now'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleQuickCall('appointment_reminder')}
            disabled={isCalling || !contactInfo}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📅 Appointment
          </button>
          <button
            onClick={() => handleQuickCall('follow_up')}
            disabled={isCalling || !contactInfo}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Follow Up
          </button>
          <button
            onClick={() => handleQuickCall('emergency')}
            disabled={isCalling || !contactInfo}
            className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚨 Emergency
          </button>
          <button
            onClick={() => handleQuickCall('general')}
            disabled={isCalling || !contactInfo}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💬 General
          </button>
        </div>
      </div>

      {/* Call Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Call Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recordCall"
              checked={callSettings.recordCall}
              onChange={(e) => setCallSettings(prev => ({ ...prev, recordCall: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="recordCall" className="text-sm text-gray-700">
              Record Call
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="transcriptionEnabled"
              checked={callSettings.transcriptionEnabled}
              onChange={(e) => setCallSettings(prev => ({ ...prev, transcriptionEnabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="transcriptionEnabled" className="text-sm text-gray-700">
              Enable Transcription
            </label>
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              value={callSettings.language}
              onChange={(e) => setCallSettings(prev => ({ ...prev, language: e.target.value }))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
              Timeout (seconds)
            </label>
            <input
              type="number"
              id="timeout"
              value={callSettings.timeout}
              onChange={(e) => setCallSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10"
              max="120"
            />
          </div>
        </div>
      </div>

      {/* Active Call */}
      {activeCall && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">Active Call</h4>
              <p className="text-green-700">
                {activeCall.from} → {activeCall.to}
              </p>
              <p className="text-sm text-green-600">
                Status: {activeCall.status} | Started: {activeCall.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">In Progress</span>
            </div>
          </div>
        </div>
      )}

      {/* Call History */}
      {callHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Recent Calls</h4>
          <div className="space-y-2">
            {callHistory.slice(0, 5).map((call) => (
              <div key={call.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    call.status === 'completed' ? 'bg-green-400' :
                    call.status === 'failed' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {call.from} → {call.to}
                    </p>
                    <p className="text-xs text-gray-500">
                      {call.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    call.status === 'completed' ? 'bg-green-100 text-green-800' :
                    call.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {call.status}
                  </span>
                  {call.recordingUrl && (
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      📹 Recording
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCaller;
