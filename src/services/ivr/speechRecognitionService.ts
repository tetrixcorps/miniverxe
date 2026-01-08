// Speech Recognition Service
// Provides ASR (Automatic Speech Recognition) and NLU (Natural Language Understanding) capabilities

import type { IVRCallSession } from './ivrService';

export interface SpeechRecognitionConfig {
  language: string;
  model?: 'default' | 'enhanced' | 'phone';
  enablePunctuation?: boolean;
  enableSpeakerDiarization?: boolean;
  profanityFilter?: boolean;
}

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  alternatives?: string[];
  intent?: Intent;
  entities?: Entity[];
  isFinal: boolean;
}

export interface Intent {
  name: string;
  confidence: number;
  parameters?: Record<string, any>;
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

export interface NLUConfig {
  intents: IntentDefinition[];
  entities: EntityDefinition[];
  language: string;
}

export interface IntentDefinition {
  name: string;
  examples: string[];
  parameters?: ParameterDefinition[];
}

export interface ParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'time' | 'boolean';
  required: boolean;
}

export interface EntityDefinition {
  type: string;
  patterns?: string[];
  synonyms?: Record<string, string[]>;
}

class SpeechRecognitionService {
  private webhookBaseUrl: string;
  private telnyxApiKey: string;
  private nluConfig: Map<string, NLUConfig> = new Map();

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.telnyxApiKey = process.env.TELNYX_API_KEY || '';
    this.initializeNLUConfigs();
  }

  /**
   * Initialize NLU configurations for each industry
   */
  private initializeNLUConfigs() {
    // Healthcare NLU Config
    this.nluConfig.set('healthcare', {
      language: 'en-US',
      intents: [
        {
          name: 'schedule_appointment',
          examples: [
            'I need to schedule an appointment',
            'Can I book an appointment',
            'I want to make an appointment',
            'Schedule me for next week'
          ],
          parameters: [
            { name: 'department', type: 'string', required: false },
            { name: 'date', type: 'date', required: false }
          ]
        },
        {
          name: 'prescription_refill',
          examples: [
            'I need a prescription refill',
            'Refill my prescription',
            'Can I get my prescription refilled'
          ],
          parameters: [
            { name: 'prescription_number', type: 'string', required: false }
          ]
        },
        {
          name: 'lab_results',
          examples: [
            'I want my lab results',
            'Check my lab results',
            'Get my test results'
          ]
        },
        {
          name: 'billing_inquiry',
          examples: [
            'What is my balance',
            'Check my bill',
            'I have a billing question'
          ]
        }
      ],
      entities: [
        {
          type: 'department',
          synonyms: {
            'cardiology': ['heart', 'cardiac', 'cardiologist'],
            'pediatrics': ['pediatric', 'children', 'kids'],
            'emergency': ['er', 'emergency room', 'urgent']
          }
        }
      ]
    });

    // Insurance NLU Config
    this.nluConfig.set('insurance', {
      language: 'en-US',
      intents: [
        {
          name: 'report_claim',
          examples: [
            'I need to report a claim',
            'File a claim',
            'I had an accident'
          ]
        },
        {
          name: 'check_claim_status',
          examples: [
            'What is my claim status',
            'Check my claim',
            'Status of my claim'
          ],
          parameters: [
            { name: 'claim_number', type: 'string', required: false }
          ]
        },
        {
          name: 'policy_info',
          examples: [
            'Tell me about my policy',
            'What is my coverage',
            'Policy information'
          ]
        },
        {
          name: 'make_payment',
          examples: [
            'I want to make a payment',
            'Pay my bill',
            'Make a payment'
          ]
        }
      ],
      entities: []
    });

    // Retail NLU Config
    this.nluConfig.set('retail', {
      language: 'en-US',
      intents: [
        {
          name: 'check_order_status',
          examples: [
            'Where is my order',
            'Order status',
            'Track my order',
            'When will my order arrive'
          ],
          parameters: [
            { name: 'order_number', type: 'string', required: false }
          ]
        },
        {
          name: 'return_item',
          examples: [
            'I want to return something',
            'Return an item',
            'I need to make a return'
          ]
        },
        {
          name: 'product_info',
          examples: [
            'Tell me about a product',
            'Product information',
            'What is this product'
          ],
          parameters: [
            { name: 'product_name', type: 'string', required: false }
          ]
        },
        {
          name: 'store_location',
          examples: [
            'Where is your store',
            'Find a store',
            'Store locations'
          ]
        }
      ],
      entities: []
    });
  }

  /**
   * Process speech input using Telnyx ASR
   */
  async recognizeSpeech(
    audioUrl: string,
    config: SpeechRecognitionConfig,
    session: IVRCallSession
  ): Promise<SpeechRecognitionResult> {
    try {
      // Use Telnyx transcription API or Deepgram/Google Speech-to-Text
      // For now, we'll use a mock implementation that can be replaced with actual API calls
      
      // In production, this would call Telnyx's transcription API or integrate with:
      // - Telnyx Media Streams with ASR
      // - Deepgram
      // - Google Cloud Speech-to-Text
      // - AWS Transcribe

      const response = await this.callASRService(audioUrl, config);
      
      // Process with NLU
      const nluResult = await this.processNLU(response.text, session.industry);
      
      return {
        text: response.text,
        confidence: response.confidence,
        alternatives: response.alternatives,
        intent: nluResult.intent,
        entities: nluResult.entities,
        isFinal: response.isFinal
      };
    } catch (error) {
      console.error('Speech recognition error:', error);
      throw error;
    }
  }

  /**
   * Call ASR service (Telnyx, Deepgram, etc.)
   */
  private async callASRService(
    audioUrl: string,
    config: SpeechRecognitionConfig
  ): Promise<{ text: string; confidence: number; alternatives?: string[]; isFinal: boolean }> {
    // Mock implementation - replace with actual ASR API call
    // Example with Telnyx:
    /*
    const response = await fetch('https://api.telnyx.com/v2/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language: config.language,
        model: config.model || 'default'
      })
    });
    
    const data = await response.json();
    return {
      text: data.text,
      confidence: data.confidence,
      alternatives: data.alternatives,
      isFinal: true
    };
    */

    // For now, return mock data
    return {
      text: '',
      confidence: 0,
      isFinal: true
    };
  }

  /**
   * Process Natural Language Understanding
   */
  async processNLU(
    text: string,
    industry: string
  ): Promise<{ intent?: Intent; entities?: Entity[] }> {
    const config = this.nluConfig.get(industry);
    if (!config) {
      return {};
    }

    const normalizedText = text.toLowerCase().trim();
    
    // Simple pattern matching for intents
    let matchedIntent: Intent | undefined;
    let highestConfidence = 0;

    for (const intentDef of config.intents) {
      for (const example of intentDef.examples) {
        const similarity = this.calculateSimilarity(normalizedText, example.toLowerCase());
        if (similarity > highestConfidence && similarity > 0.6) {
          highestConfidence = similarity;
          matchedIntent = {
            name: intentDef.name,
            confidence: similarity,
            parameters: this.extractParameters(normalizedText, intentDef)
          };
        }
      }
    }

    // Extract entities
    const entities = this.extractEntities(normalizedText, config.entities);

    return {
      intent: matchedIntent,
      entities: entities.length > 0 ? entities : undefined
    };
  }

  /**
   * Calculate text similarity (simple implementation)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Extract parameters from text
   */
  private extractParameters(
    text: string,
    intentDef: IntentDefinition
  ): Record<string, any> | undefined {
    if (!intentDef.parameters) return undefined;

    const parameters: Record<string, any> = {};

    for (const param of intentDef.parameters) {
      // Simple extraction - in production, use more sophisticated NLP
      if (param.type === 'date') {
        const dateMatch = text.match(/\b(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
        if (dateMatch) {
          parameters[param.name] = dateMatch[0];
        }
      } else if (param.type === 'string') {
        // Extract department names, etc.
        const entityMatch = text.match(/\b(cardiology|pediatrics|emergency|billing|scheduling)\b/i);
        if (entityMatch) {
          parameters[param.name] = entityMatch[0];
        }
      }
    }

    return Object.keys(parameters).length > 0 ? parameters : undefined;
  }

  /**
   * Extract entities from text
   */
  private extractEntities(
    text: string,
    entityDefs: EntityDefinition[]
  ): Entity[] {
    const entities: Entity[] = [];

    for (const entityDef of entityDefs) {
      if (entityDef.synonyms) {
        for (const [canonical, synonyms] of Object.entries(entityDef.synonyms)) {
          const allTerms = [canonical, ...synonyms];
          for (const term of allTerms) {
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            const match = text.match(regex);
            if (match && match.index !== undefined) {
              entities.push({
                type: entityDef.type,
                value: canonical,
                confidence: 0.8,
                startIndex: match.index,
                endIndex: match.index + term.length
              });
              break;
            }
          }
        }
      }
    }

    return entities;
  }

  /**
   * Generate TeXML with speech recognition enabled
   */
  generateSpeechRecognitionTeXML(
    session: IVRCallSession,
    prompt: string,
    actionUrl: string
  ): string {
    const language = session.metadata.language as string || 'en-US';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${language}">${this.escapeXML(prompt)}</Say>
  <Gather 
    action="${actionUrl}" 
    method="POST" 
    input="speech dtmf" 
    speechTimeout="auto"
    speechModel="default"
    language="${language}"
    timeout="10"
    numDigits="1">
    <Say voice="alice" language="${language}">Please speak or press a number.</Say>
  </Gather>
  <Say voice="alice">We didn't receive any input. Please try again.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Process speech input from webhook
   */
  async processSpeechInput(
    sessionId: string,
    speechResult: string,
    confidence: number,
    session: IVRCallSession
  ): Promise<{ intent?: string; action?: string; nextStep?: string }> {
    // Process with NLU
    const nluResult = await this.processNLU(speechResult, session.industry);

    if (nluResult.intent) {
      // Map intent to IVR action
      const action = this.mapIntentToAction(nluResult.intent.name, session.industry);
      return {
        intent: nluResult.intent.name,
        action,
        nextStep: action
      };
    }

    // Fallback to DTMF if speech not recognized
    return {};
  }

  /**
   * Map intent to IVR action/step
   */
  private mapIntentToAction(intentName: string, industry: string): string {
    const mappings: Record<string, Record<string, string>> = {
      healthcare: {
        'schedule_appointment': 'appointment_menu',
        'prescription_refill': 'prescription_menu',
        'lab_results': 'lab_results',
        'billing_inquiry': 'billing_menu'
      },
      insurance: {
        'report_claim': 'fnol_menu',
        'check_claim_status': 'claim_status',
        'policy_info': 'policy_info',
        'make_payment': 'payment_menu'
      },
      retail: {
        'check_order_status': 'order_status',
        'return_item': 'returns_menu',
        'product_info': 'product_info',
        'store_location': 'store_info'
      }
    };

    return mappings[industry]?.[intentName] || 'main_menu';
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

  /**
   * Update NLU configuration for an industry
   */
  updateNLUConfig(industry: string, config: NLUConfig): void {
    this.nluConfig.set(industry, config);
  }

  /**
   * Get NLU configuration for an industry
   */
  getNLUConfig(industry: string): NLUConfig | undefined {
    return this.nluConfig.get(industry);
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
