// Telnyx Video API Service
// Based on Telnyx Video API documentation for room creation and participant management

export interface RoomSettings {
  max_participants: number;
  duration_minutes: number;
  recording_enabled: boolean;
  room_name?: string;
  description?: string;
}

export interface VideoRoom {
  id: string;
  name: string;
  max_participants: number;
  duration_minutes: number;
  recording_enabled: boolean;
  status: 'active' | 'inactive' | 'ended';
  created_at: string;
  expires_at: string;
  join_url: string;
}

export interface JoinToken {
  token: string;
  expires_at: string;
  room_id: string;
  user_id: string;
}

export interface Participant {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'participant';
  join_token?: string;
}

export interface InvitationResult {
  success: boolean;
  participants: Participant[];
  failed_invitations: string[];
}

export class TelnyxVideoService {
  private apiKey: string;
  private baseUrl: string = 'https://api.telnyx.com/v2/rooms';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a new video room
   * Based on Telnyx Video API documentation
   */
  async createRoom(settings: RoomSettings): Promise<VideoRoom> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_participants: settings.max_participants,
          duration_minutes: settings.duration_minutes,
          recording_enabled: settings.recording_enabled,
          room_name: settings.room_name || `Study Group ${Date.now()}`,
          description: settings.description || 'Code Academy study session'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.data.id,
        name: data.data.room_name,
        max_participants: data.data.max_participants,
        duration_minutes: data.data.duration_minutes,
        recording_enabled: data.data.recording_enabled,
        status: data.data.status,
        created_at: data.data.created_at,
        expires_at: data.data.expires_at,
        join_url: data.data.join_url
      };
    } catch (error) {
      console.error('Error creating video room:', error);
      throw new Error('Failed to create video room. Please try again.');
    }
  }

  /**
   * Generate a join token for a participant
   * Based on Telnyx Video API documentation for Client Join Tokens
   */
  async generateJoinToken(roomId: string, userId: string, userName?: string): Promise<JoinToken> {
    try {
      const response = await fetch(`${this.baseUrl}/${roomId}/join_tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          user_name: userName || `User ${userId}`,
          expires_in: 3600 // 1 hour
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate join token: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        token: data.data.token,
        expires_at: data.data.expires_at,
        room_id: roomId,
        user_id: userId
      };
    } catch (error) {
      console.error('Error generating join token:', error);
      throw new Error('Failed to generate join token. Please try again.');
    }
  }

  /**
   * Invite participants to a video room
   * Generates join tokens and sends invitations
   */
  async inviteParticipants(
    roomId: string, 
    participants: Omit<Participant, 'join_token'>[]
  ): Promise<InvitationResult> {
    const results: Participant[] = [];
    const failed_invitations: string[] = [];

    for (const participant of participants) {
      try {
        // Generate join token for each participant
        const joinToken = await this.generateJoinToken(roomId, participant.id, participant.name);
        
        // Send invitation (this would integrate with your notification service)
        await this.sendInvitation(participant.email, {
          roomId,
          joinToken: joinToken.token,
          roomName: participant.name,
          expiresAt: joinToken.expires_at
        });

        results.push({
          ...participant,
          join_token: joinToken.token
        });
      } catch (error) {
        console.error(`Failed to invite ${participant.email}:`, error);
        failed_invitations.push(participant.email);
      }
    }

    return {
      success: failed_invitations.length === 0,
      participants: results,
      failed_invitations
    };
  }

  /**
   * Get room details
   */
  async getRoom(roomId: string): Promise<VideoRoom> {
    try {
      const response = await fetch(`${this.baseUrl}/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get room: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.data.id,
        name: data.data.room_name,
        max_participants: data.data.max_participants,
        duration_minutes: data.data.duration_minutes,
        recording_enabled: data.data.recording_enabled,
        status: data.data.status,
        created_at: data.data.created_at,
        expires_at: data.data.expires_at,
        join_url: data.data.join_url
      };
    } catch (error) {
      console.error('Error getting room:', error);
      throw new Error('Failed to get room details. Please try again.');
    }
  }

  /**
   * End a video room
   */
  async endRoom(roomId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error ending room:', error);
      return false;
    }
  }

  /**
   * Start recording a room
   */
  async startRecording(roomId: string): Promise<{ recording_id: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${roomId}/recordings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to start recording: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        recording_id: data.data.id,
        status: data.data.status
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please try again.');
    }
  }

  /**
   * Stop recording a room
   */
  async stopRecording(recordingId: string): Promise<{ status: string; download_url?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/recordings/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to stop recording: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        status: data.data.status,
        download_url: data.data.download_url
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw new Error('Failed to stop recording. Please try again.');
    }
  }

  /**
   * Send invitation email/SMS
   * This would integrate with your notification service (Mailgun, etc.)
   */
  private async sendInvitation(
    email: string, 
    invitationData: {
      roomId: string;
      joinToken: string;
      roomName: string;
      expiresAt: string;
    }
  ): Promise<void> {
    // TODO: Integrate with your notification service
    // This is a placeholder implementation
    
    const invitationUrl = `${window.location.origin}/collaboration/${invitationData.roomId}?token=${invitationData.joinToken}`;
    
    const emailData = {
      to: email,
      subject: `Invitation to join ${invitationData.roomName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're invited to join a study session!</h2>
          <p>You've been invited to join <strong>${invitationData.roomName}</strong> on Code Academy.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Room ID:</strong> ${invitationData.roomId}</p>
            <p><strong>Expires:</strong> ${new Date(invitationData.expiresAt).toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Study Session
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${invitationUrl}">${invitationUrl}</a>
          </p>
        </div>
      `
    };

    // TODO: Replace with actual email service call
    console.log('Sending invitation email:', emailData);
    
    // For now, we'll just log the invitation
    // In production, this would call your email service
    try {
      // Example: await mailgunService.sendEmail(emailData);
      console.log(`Invitation sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send invitation to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Generate a shareable room link
   */
  generateRoomLink(roomId: string, joinToken?: string): string {
    const baseUrl = `${window.location.origin}/collaboration/${roomId}`;
    return joinToken ? `${baseUrl}?token=${joinToken}` : baseUrl;
  }

  /**
   * Validate a join token
   */
  async validateJoinToken(roomId: string, token: string): Promise<boolean> {
    try {
      // In a real implementation, you would validate the token with Telnyx
      // For now, we'll do a simple validation
      const response = await fetch(`${this.baseUrl}/${roomId}/validate_token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating join token:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const telnyxVideoService = new TelnyxVideoService(
  process.env.REACT_APP_TELNYX_API_KEY || ''
);
