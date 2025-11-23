import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Clock, 
  Video, 
  Copy, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { telnyxVideoService, RoomSettings, VideoRoom, Participant } from '../services/telnyxVideoService';

interface VideoCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (room: VideoRoom) => void;
  onRoomJoined?: (roomId: string) => void;
}

interface InvitationForm {
  emails: string;
  message: string;
}

const VideoCollaborationModal: React.FC<VideoCollaborationModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
  onRoomJoined
}) => {
  const [step, setStep] = useState<'create' | 'invite' | 'success'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    max_participants: 10,
    duration_minutes: 60,
    recording_enabled: false,
    room_name: '',
    description: ''
  });
  const [createdRoom, setCreatedRoom] = useState<VideoRoom | null>(null);
  const [invitationForm, setInvitationForm] = useState<InvitationForm>({
    emails: '',
    message: 'Join me for a study session on Code Academy!'
  });
  const [invitationResult, setInvitationResult] = useState<{
    success: boolean;
    participants: Participant[];
    failed_invitations: string[];
  } | null>(null);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);

    try {
      const room = await telnyxVideoService.createRoom(roomSettings);
      setCreatedRoom(room);
      setStep('invite');
      onRoomCreated?.(room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteParticipants = async () => {
    if (!createdRoom) return;

    setLoading(true);
    setError(null);

    try {
      // Parse email addresses
      const emails = invitationForm.emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        setError('Please enter at least one email address');
        return;
      }

      // Create participant objects
      const participants: Omit<Participant, 'join_token'>[] = emails.map((email, index) => ({
        id: `participant_${Date.now()}_${index}`,
        email,
        name: email.split('@')[0], // Use email prefix as name
        role: 'participant' as const
      }));

      const result = await telnyxVideoService.inviteParticipants(createdRoom.id, participants);
      setInvitationResult(result);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoomLink = async () => {
    if (!createdRoom) return;

    const roomLink = telnyxVideoService.generateRoomLink(createdRoom.id);
    
    try {
      await navigator.clipboard.writeText(roomLink);
      // You could show a toast notification here
      console.log('Room link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy room link:', err);
    }
  };

  const handleJoinRoom = () => {
    if (createdRoom) {
      onRoomJoined?.(createdRoom.id);
      onClose();
    }
  };

  const resetModal = () => {
    setStep('create');
    setError(null);
    setCreatedRoom(null);
    setInvitationResult(null);
    setRoomSettings({
      max_participants: 10,
      duration_minutes: 60,
      recording_enabled: false,
      room_name: '',
      description: ''
    });
    setInvitationForm({
      emails: '',
      message: 'Join me for a study session on Code Academy!'
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Video className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {step === 'create' && 'Create Study Session'}
                      {step === 'invite' && 'Invite Participants'}
                      {step === 'success' && 'Room Created Successfully'}
                    </h2>
                    <p className="text-blue-100">
                      {step === 'create' && 'Set up your video collaboration room'}
                      {step === 'invite' && 'Send invitations to your study group'}
                      {step === 'success' && 'Your study session is ready to go!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Step 1: Create Room */}
              {step === 'create' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomSettings.room_name}
                      onChange={(e) => setRoomSettings({
                        ...roomSettings,
                        room_name: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., React Study Group"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={roomSettings.description}
                      onChange={(e) => setRoomSettings({
                        ...roomSettings,
                        description: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Describe what you'll be studying..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants
                      </label>
                      <select
                        value={roomSettings.max_participants}
                        onChange={(e) => setRoomSettings({
                          ...roomSettings,
                          max_participants: parseInt(e.target.value)
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Duration
                      </label>
                      <select
                        value={roomSettings.duration_minutes}
                        onChange={(e) => setRoomSettings({
                          ...roomSettings,
                          duration_minutes: parseInt(e.target.value)
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recording"
                      checked={roomSettings.recording_enabled}
                      onChange={(e) => setRoomSettings({
                        ...roomSettings,
                        recording_enabled: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="recording" className="ml-2 text-sm text-gray-700">
                      Enable session recording (for review)
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Invite Participants */}
              {step === 'invite' && createdRoom && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-green-800 font-medium">Room Created Successfully!</p>
                        <p className="text-green-700 text-sm">
                          Room ID: {createdRoom.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Participants
                    </label>
                    <textarea
                      value={invitationForm.emails}
                      onChange={(e) => setInvitationForm({
                        ...invitationForm,
                        emails: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Enter email addresses separated by commas&#10;e.g., john@example.com, jane@example.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate multiple email addresses with commas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invitation Message
                    </label>
                    <textarea
                      value={invitationForm.message}
                      onChange={(e) => setInvitationForm({
                        ...invitationForm,
                        message: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-medium">Room Link</p>
                        <p className="text-blue-700 text-sm font-mono">
                          {telnyxVideoService.generateRoomLink(createdRoom.id)}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyRoomLink}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && invitationResult && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Study Session Ready!
                    </h3>
                    <p className="text-green-700">
                      Your video room has been created and invitations have been sent.
                    </p>
                  </div>

                  {invitationResult.participants.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Invitations Sent Successfully</h4>
                      <div className="space-y-2">
                        {invitationResult.participants.map((participant, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-700">{participant.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {invitationResult.failed_invitations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Failed Invitations</h4>
                      <div className="space-y-2">
                        {invitationResult.failed_invitations.map((email, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-gray-700">{email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>

              <div className="flex space-x-3">
                {step === 'create' && (
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading || !roomSettings.room_name}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading && <Loader className="h-4 w-4 animate-spin" />}
                    <span>Create Room</span>
                  </button>
                )}

                {step === 'invite' && (
                  <>
                    <button
                      onClick={() => setStep('create')}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleInviteParticipants}
                      disabled={loading || !invitationForm.emails}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {loading && <Loader className="h-4 w-4 animate-spin" />}
                      <Send className="h-4 w-4" />
                      <span>Send Invitations</span>
                    </button>
                  </>
                )}

                {step === 'success' && (
                  <button
                    onClick={handleJoinRoom}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Video className="h-4 w-4" />
                    <span>Join Room Now</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VideoCollaborationModal;
