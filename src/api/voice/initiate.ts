// Voice Call Initiation API Endpoint
// Handles voice call initiation with Telnyx and Deepgram STT

import type { Request, Response } from 'express';
import { telnyxVoiceService } from '../../services/telnyxVoiceService';

export const initiateVoiceCall = async (req: Request, res: Response) => {
  try {
    const {
      to,
      from,
      webhookUrl,
      recordCall = true,
      transcriptionEnabled = true,
      language = 'en-US',
      timeout = 30,
      maxDuration = 300
    } = req.body;

    // Validate required fields
    if (!to || !from) {
      return res.status(400).json({
        error: 'Missing required fields: to, from'
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to) || !phoneRegex.test(from)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
      });
    }

    // Create call configuration
    const callConfig = {
      from,
      to,
      webhookUrl: webhookUrl || `${process.env.WEBHOOK_BASE_URL}/api/voice/webhook`,
      recordCall,
      transcriptionEnabled,
      language,
      timeout,
      maxDuration
    };

    // Initiate the call
    const session = await telnyxVoiceService.initiateCall(callConfig);

    // Return session information
    res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      callId: session.callId,
      phoneNumber: session.phoneNumber,
      status: session.status,
      startTime: session.startTime,
      message: 'Voice call initiated successfully'
    });

  } catch (error) {
    console.error('Voice call initiation failed:', error);
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes('API key not configured')) {
      return res.status(500).json({
        error: 'Voice service not properly configured',
        message: 'Please check your Telnyx API configuration'
      });
    }
    
    if (error instanceof Error && error.message.includes('Telnyx API error')) {
      return res.status(502).json({
        error: 'External service error',
        message: 'Failed to connect to Telnyx API'
      });
    }

    res.status(500).json({
      error: 'Failed to initiate voice call',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCallStatus = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    const session = telnyxVoiceService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Failed to get call status:', error);
    res.status(500).json({
      error: 'Failed to get call status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const endCall = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    const session = telnyxVoiceService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Update session status
    session.status = 'completed';
    
    // Note: In a real implementation, you would call Telnyx API to hang up the call
    // For now, we just update the local session status
    
    res.status(200).json({
      success: true,
      message: 'Call ended successfully',
      session
    });

  } catch (error) {
    console.error('Failed to end call:', error);
    res.status(500).json({
      error: 'Failed to end call',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = telnyxVoiceService.getAllSessions();
    
    res.status(200).json({
      success: true,
      sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('Failed to get active sessions:', error);
    res.status(500).json({
      error: 'Failed to get active sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cleanupSessions = async (req: Request, res: Response) => {
  try {
    telnyxVoiceService.cleanupSessions();
    
    res.status(200).json({
      success: true,
      message: 'Sessions cleaned up successfully'
    });

  } catch (error) {
    console.error('Failed to cleanup sessions:', error);
    res.status(500).json({
      error: 'Failed to cleanup sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
