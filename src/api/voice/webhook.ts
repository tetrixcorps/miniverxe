// Voice Webhook Handler
// Handles Telnyx webhook events and TeXML responses

import { Request, Response } from 'express';
import { telnyxVoiceService } from '../../services/telnyxVoiceService';

// Main webhook handler for Telnyx events
export const handleVoiceWebhook = async (req: Request, res: Response) => {
  try {
    const { event_type, data } = req.body;
    
    console.log('Voice webhook received:', {
      event_type,
      call_control_id: data?.call_control_id,
      timestamp: new Date().toISOString()
    });

    // Handle different event types
    switch (event_type) {
      case 'call.answered':
        await handleCallAnswered(data);
        break;
        
      case 'call.hangup':
        await handleCallHangup(data);
        break;
        
      case 'call.recording.saved':
        await handleCallRecording(data);
        break;
        
      case 'call.speak.started':
        await handleCallSpeakStarted(data);
        break;
        
      case 'call.speak.ended':
        await handleCallSpeakEnded(data);
        break;
        
      case 'call.gather.ended':
        await handleCallGatherEnded(data);
        break;
        
      case 'call.recording.saved':
        await handleCallRecording(data);
        break;
        
      default:
        console.log('Unhandled voice event:', event_type);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Voice webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle call answered event
const handleCallAnswered = async (data: any) => {
  try {
    const { call_control_id, from, to } = data;
    
    console.log('Call answered:', {
      call_control_id,
      from,
      to
    });

    // Update session status
    await telnyxVoiceService.handleCallEvent({
      data: {
        call_control_id,
        event_type: 'call.answered'
      }
    });

  } catch (error) {
    console.error('Failed to handle call answered:', error);
  }
};

// Handle call hangup event
const handleCallHangup = async (data: any) => {
  try {
    const { call_control_id, from, to, call_duration } = data;
    
    console.log('Call ended:', {
      call_control_id,
      from,
      to,
      call_duration
    });

    // Update session status
    await telnyxVoiceService.handleCallEvent({
      data: {
        call_control_id,
        event_type: 'call.hangup',
        call_duration
      }
    });

  } catch (error) {
    console.error('Failed to handle call hangup:', error);
  }
};

// Handle call recording event
const handleCallRecording = async (data: any) => {
  try {
    const { call_control_id, recording_url, recording_duration } = data;
    
    console.log('Call recording saved:', {
      call_control_id,
      recording_url,
      recording_duration
    });

    // Update session with recording info
    await telnyxVoiceService.handleCallEvent({
      data: {
        call_control_id,
        event_type: 'call.recording.saved',
        recording_url,
        recording_duration
      }
    });

  } catch (error) {
    console.error('Failed to handle call recording:', error);
  }
};

// Handle call speak started event
const handleCallSpeakStarted = async (data: any) => {
  try {
    const { call_control_id } = data;
    
    console.log('Call speak started:', call_control_id);

    await telnyxVoiceService.handleCallEvent({
      data: {
        call_control_id,
        event_type: 'call.speak.started'
      }
    });

  } catch (error) {
    console.error('Failed to handle call speak started:', error);
  }
};

// Handle call speak ended event
const handleCallSpeakEnded = async (data: any) => {
  try {
    const { call_control_id } = data;
    
    console.log('Call speak ended:', call_control_id);

    await telnyxVoiceService.handleCallEvent({
      data: {
        call_control_id,
        event_type: 'call.speak.ended'
      }
    });

  } catch (error) {
    console.error('Failed to handle call speak ended:', error);
  }
};

// Handle call gather ended event
const handleCallGatherEnded = async (data: any) => {
  try {
    const { call_control_id, digits, speech_result } = data;
    
    console.log('Call gather ended:', {
      call_control_id,
      digits,
      speech_result
    });

    await telnyxVoiceService.handleCallEvent({
      data: {
        call_control_id,
        event_type: 'call.gather.ended',
        digits,
        speech_result
      }
    });

  } catch (error) {
    console.error('Failed to handle call gather ended:', error);
  }
};

// TeXML response handler
export const handleTeXMLResponse = async (req: Request, res: Response) => {
  try {
    const { CallSid, From, To, CallStatus, Digits, SpeechResult } = req.body;
    
    console.log('TeXML webhook received:', {
      CallSid,
      From,
      To,
      CallStatus,
      Digits,
      SpeechResult
    });

    // Generate appropriate TeXML response based on call state
    let texmlResponse;

    if (CallStatus === 'in-progress') {
      if (Digits || SpeechResult) {
        // User provided input, generate AI response
        const userInput = SpeechResult || Digits;
        const aiResponse = await telnyxVoiceService.generateAIResponse(userInput, CallSid);
        
        texmlResponse = telnyxVoiceService.createFollowUpResponse(aiResponse);
      } else {
        // No input yet, ask for input
        texmlResponse = {
          Response: {
            Say: {
              voice: 'female',
              language: 'en-US',
              text: 'Please tell me how I can help you today, or press any key to continue.'
            },
            Gather: {
              input: ['speech', 'dtmf'],
              numDigits: 1,
              timeout: 10,
              action: `${process.env.WEBHOOK_BASE_URL}/api/voice/texml`,
              method: 'POST'
            }
          }
        };
      }
    } else {
      // Call ended or other status
      texmlResponse = {
        Response: {
          Hangup: {}
        }
      };
    }

    // Return TeXML response
    res.set('Content-Type', 'text/xml');
    res.send(telnyxVoiceService.formatTeXML(texmlResponse));

  } catch (error) {
    console.error('TeXML response error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>');
  }
};

// Health check endpoint
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const activeSessions = telnyxVoiceService.getAllSessions();
    
    res.status(200).json({
      status: 'healthy',
      activeSessions: activeSessions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
