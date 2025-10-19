// Voice API Demo Endpoints
// Provides demonstration and testing capabilities

import type { Request, Response } from 'express';
import { telnyxVoiceService } from '../../services/telnyxVoiceService';

// Demo: Initiate a test call
export const demoCall = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required for demo call'
      });
    }

    // Create demo call configuration
    const callConfig = {
      from: process.env.TELNYX_PHONE_NUMBER || '+1234567890',
      to: phoneNumber,
      webhookUrl: `${process.env.WEBHOOK_BASE_URL}/api/voice/webhook`,
      recordCall: true,
      transcriptionEnabled: true,
      language: 'en-US',
      timeout: 30,
      maxDuration: 300
    };

    // Initiate the demo call
    const session = await telnyxVoiceService.initiateCall(callConfig);

    res.status(200).json({
      success: true,
      message: 'Demo call initiated successfully',
      session: {
        sessionId: session.sessionId,
        callId: session.callId,
        phoneNumber: session.phoneNumber,
        status: session.status,
        startTime: session.startTime
      },
      instructions: [
        'Answer the call when it rings',
        'Listen to the SHANGO AI greeting',
        'Speak your request or press a key',
        'Experience real-time transcription',
        'Hear AI-generated responses'
      ]
    });

  } catch (error) {
    console.error('Demo call failed:', error);
    res.status(500).json({
      error: 'Failed to initiate demo call',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Demo: Test TeXML response
export const demoTexml = async (req: Request, res: Response) => {
  try {
    const { message = 'Hello! This is a demo TeXML response.' } = req.body;

    // Create demo TeXML response
    const texmlResponse = {
      Response: {
        Say: {
          voice: 'female',
          language: 'en-US',
          text: message
        },
        Gather: {
          input: ['speech', 'dtmf'],
          numDigits: 1,
          timeout: 10,
          action: `${process.env.WEBHOOK_BASE_URL}/api/voice/texml`,
          method: 'POST'
        },
        Record: {
          timeout: 30,
          maxLength: 300,
          playBeep: true,
          action: `${process.env.WEBHOOK_BASE_URL}/api/voice/record`,
          method: 'POST'
        }
      }
    };

    // Format as XML
    const xmlResponse = telnyxVoiceService.formatTeXML(texmlResponse);

    res.set('Content-Type', 'text/xml');
    res.send(xmlResponse);

  } catch (error) {
    console.error('Demo TeXML failed:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>');
  }
};

// Demo: Test transcription
export const demoTranscription = async (req: Request, res: Response) => {
  try {
    const { audioUrl, sessionId } = req.body;

    if (!audioUrl) {
      return res.status(400).json({
        error: 'Audio URL is required for demo transcription'
      });
    }

    // Create a demo session if not provided
    const demoSessionId = sessionId || `demo_${Date.now()}`;
    
    // Process transcription
    await telnyxVoiceService.processTranscription(audioUrl, demoSessionId);

    // Get the session
    const session = telnyxVoiceService.getSession(demoSessionId);

    res.status(200).json({
      success: true,
      message: 'Demo transcription completed',
      session: {
        sessionId: demoSessionId,
        transcription: session?.transcription
      }
    });

  } catch (error) {
    console.error('Demo transcription failed:', error);
    res.status(500).json({
      error: 'Failed to process demo transcription',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Demo: Generate AI response
export const demoAIResponse = async (req: Request, res: Response) => {
  try {
    const { transcription, sessionId } = req.body;

    if (!transcription) {
      return res.status(400).json({
        error: 'Transcription text is required for AI response'
      });
    }

    // Generate AI response
    const aiResponse = await telnyxVoiceService.generateAIResponse(transcription, sessionId || 'demo');

    res.status(200).json({
      success: true,
      message: 'AI response generated successfully',
      data: {
        input: transcription,
        response: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Demo AI response failed:', error);
    res.status(500).json({
      error: 'Failed to generate AI response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Demo: Full voice flow simulation
export const demoVoiceFlow = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required for voice flow demo'
      });
    }

    // Simulate a complete voice flow
    const flowSteps = [
      {
        step: 1,
        action: 'initiate_call',
        description: 'Initiating voice call to ' + phoneNumber,
        status: 'pending'
      },
      {
        step: 2,
        action: 'call_answered',
        description: 'Call answered, playing greeting',
        status: 'pending'
      },
      {
        step: 3,
        action: 'gather_input',
        description: 'Listening for user input',
        status: 'pending'
      },
      {
        step: 4,
        action: 'process_transcription',
        description: 'Processing speech with Deepgram STT',
        status: 'pending'
      },
      {
        step: 5,
        action: 'generate_ai_response',
        description: 'Generating AI response with SHANGO',
        status: 'pending'
      },
      {
        step: 6,
        action: 'play_response',
        description: 'Playing AI response to user',
        status: 'pending'
      },
      {
        step: 7,
        action: 'record_call',
        description: 'Recording call for analysis',
        status: 'pending'
      },
      {
        step: 8,
        action: 'end_call',
        description: 'Ending call and saving session',
        status: 'pending'
      }
    ];

    res.status(200).json({
      success: true,
      message: 'Voice flow demo initiated',
      flow: flowSteps,
      instructions: [
        'This demonstrates the complete voice flow process',
        'Each step represents a real-time event in the call',
        'Monitor the flow status as the call progresses',
        'Check session details for transcription and recording data'
      ]
    });

  } catch (error) {
    console.error('Demo voice flow failed:', error);
    res.status(500).json({
      error: 'Failed to initiate voice flow demo',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Demo: Get capabilities
export const getCapabilities = async (req: Request, res: Response) => {
  try {
    const capabilities = {
      voice: {
        providers: ['Telnyx'],
        features: [
          'Outbound calling',
          'Call recording',
          'Real-time monitoring',
          'Multi-language support',
          'Call quality metrics'
        ]
      },
      transcription: {
        providers: ['Deepgram'],
        features: [
          'Real-time STT',
          'Speaker diarization',
          'Language detection',
          'Confidence scoring',
          'PII redaction',
          'Profanity filtering'
        ]
      },
      texml: {
        features: [
          'Dynamic voice responses',
          'Input gathering',
          'Call recording control',
          'Call transfer',
          'Conference management',
          'Custom call flows'
        ]
      },
      ai: {
        providers: ['SHANGO'],
        features: [
          'Natural language processing',
          'Context awareness',
          'Response generation',
          'Intent recognition',
          'Sentiment analysis'
        ]
      },
      integration: {
        features: [
          'Webhook event handling',
          'Session management',
          'Database integration',
          'Analytics and reporting',
          'Real-time monitoring'
        ]
      }
    };

    res.status(200).json({
      success: true,
      capabilities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to get capabilities:', error);
    res.status(500).json({
      error: 'Failed to get capabilities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};