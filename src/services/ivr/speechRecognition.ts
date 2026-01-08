// Speech Recognition Service for IVR
// Handles Automatic Speech Recognition (ASR) and Natural Language Understanding (NLU)

import { telnyxVoiceService } from '../telnyxVoiceService';

export interface SpeechRecognitionConfig {
  language: string;
  model?: string;
  enablePunctuation?: boolean;
  enableProfanityFilter?: boolean;
  enableDiarization?: boolean;
  confidenceThreshold?: number;
}

export interface SpeechResult {
  text: string;
  confidence: number;
  language: string;
  alternatives?: string[];
  intent?: string;
  entities?: Record<string, any>;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  slots?: Record<string, any>;
}

class SpeechRecognitionService {
  private deepgramApiKey: string;
  private deepgramApiUrl: string;
  private webhookBaseUrl: string;

  constructor() {
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
    this.deepgramApiUrl = process.env.DEEPGRAM_API_URL || 'https://api.deepgram.com/v1';
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
  }

  /**
   * Process speech input using Deepgram ASR
   */
  async processSpeech(audioUrl: string, config: SpeechRecognitionConfig): Promise<SpeechResult> {
    try {
      const response = await fetch(`${this.deepgramApiUrl}/listen`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: audioUrl,
          model: config.model || 'nova-2',
          language: config.language,
          punctuate: config.enablePunctuation ?? true,
          profanity_filter: config.enableProfanityFilter ?? false,
          diarize: config.enableDiarization ?? false,
          alternatives: 3,
          interim_results: false
        })
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }

      const data = await response.json();
      const transcript = data.results?.channels?.[0]?.alternatives?.[0];

      if (!transcript) {
        throw new Error('No transcript found in response');
      }

      // Process with NLU for intent recognition
      const intentResult = await this.processIntent(transcript.transcript, config.language);

      return {
        text: transcript.transcript,
        confidence: transcript.confidence || 0.8,
        language: config.language,
        alternatives: transcript.alternatives?.map((alt: any) => alt.transcript),
        intent: intentResult.intent,
        entities: intentResult.entities
      };

    } catch (error) {
      console.error('Speech recognition error:', error);
      throw error;
    }
  }

  /**
   * Process intent from speech text using NLU
   */
  async processIntent(text: string, language: string = 'en-US'): Promise<IntentResult> {
    try {
      // Simple intent recognition based on keywords
      // In production, this would use a proper NLU service (Dialogflow, Rasa, etc.)
      
      const lowerText = text.toLowerCase();
      
      // Healthcare intents
      if (lowerText.includes('appointment') || lowerText.includes('schedule')) {
        return {
          intent: 'schedule_appointment',
          confidence: 0.9,
          entities: { department: extractDepartment(text) },
          slots: {}
        };
      }

      if (lowerText.includes('prescription') || lowerText.includes('refill')) {
        return {
          intent: 'prescription_refill',
          confidence: 0.9,
          entities: {},
          slots: {}
        };
      }

      if (lowerText.includes('lab') || lowerText.includes('result')) {
        return {
          intent: 'lab_results',
          confidence: 0.9,
          entities: {},
          slots: {}
        };
      }

      // Insurance intents
      if (lowerText.includes('claim') || lowerText.includes('report')) {
        return {
          intent: 'report_claim',
          confidence: 0.9,
          entities: {},
          slots: {}
        };
      }

      if (lowerText.includes('status') && lowerText.includes('claim')) {
        return {
          intent: 'check_claim_status',
          confidence: 0.9,
          entities: {},
          slots: {}
        };
      }

      // Retail intents
      if (lowerText.includes('order') || lowerText.includes('tracking')) {
        return {
          intent: 'check_order_status',
          confidence: 0.9,
          entities: {},
          slots: {}
        };
      }

      if (lowerText.includes('return') || lowerText.includes('exchange')) {
        return {
          intent: 'process_return',
          confidence: 0.9,
          entities: {},
          slots: {}
        };
      }

      // Default intent
      return {
        intent: 'general_inquiry',
        confidence: 0.5,
        entities: {},
        slots: {}
      };

    } catch (error) {
      console.error('Intent processing error:', error);
      return {
        intent: 'general_inquiry',
        confidence: 0.5,
        entities: {},
        slots: {}
      };
    }
  }

  /**
   * Generate TeXML with speech recognition enabled
   */
  generateSpeechGatherTeXML(sessionId: string, message: string, language: string = 'en-US'): string {
    const actionUrl = `${this.webhookBaseUrl}/api/ivr/${sessionId}/speech`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${language}">${this.escapeXML(message)}</Say>
  <Gather 
    input="speech" 
    action="${actionUrl}" 
    method="POST" 
    timeout="10" 
    speechTimeout="auto"
    language="${language}"
    hints="appointment, prescription, lab results, billing, claim, order, return, product">
    <Say voice="alice" language="${language}">Please speak your selection.</Say>
  </Gather>
  <Say voice="alice" language="${language}">We didn't receive any input. Please try again.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Generate TeXML with both DTMF and speech recognition
   */
  generateDualInputGatherTeXML(sessionId: string, message: string, language: string = 'en-US'): string {
    const actionUrl = `${this.webhookBaseUrl}/api/ivr/${sessionId}/gather`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${language}">${this.escapeXML(message)}</Say>
  <Gather 
    input="speech dtmf" 
    action="${actionUrl}" 
    method="POST" 
    timeout="10" 
    numDigits="1"
    speechTimeout="auto"
    language="${language}"
    hints="appointment, prescription, lab results, billing, claim, order, return, product">
    <Say voice="alice" language="${language}">Please say your selection or press a number on your keypad.</Say>
  </Gather>
  <Say voice="alice" language="${language}">We didn't receive any input. Please try again.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Extract department from speech text
   */
  private extractDepartment(text: string): string | undefined {
    const lowerText = text.toLowerCase();
    
    const departments = [
      'cardiology', 'pediatrics', 'emergency', 'general practice',
      'orthopedics', 'dermatology', 'neurology', 'oncology'
    ];

    for (const dept of departments) {
      if (lowerText.includes(dept)) {
        return dept;
      }
    }

    return undefined;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Helper function for department extraction
function extractDepartment(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  const departments = [
    'cardiology', 'pediatrics', 'emergency', 'general practice',
    'orthopedics', 'dermatology', 'neurology', 'oncology'
  ];

  for (const dept of departments) {
    if (lowerText.includes(dept)) {
      return dept;
    }
  }

  return undefined;
}

export const speechRecognitionService = new SpeechRecognitionService();








