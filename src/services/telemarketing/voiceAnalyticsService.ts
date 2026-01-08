// Voice Analytics Service
// Speech-to-text transcription, sentiment analysis, and quality monitoring

import { auditEvidenceService } from '../compliance/auditEvidenceService';

export interface TranscriptionResult {
  transcript: string;
  confidence: number; // 0-1
  segments?: Array<{
    text: string;
    startTime: number; // seconds
    endTime: number; // seconds
    speaker?: string; // 'agent' | 'customer'
  }>;
  language?: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  emotions?: {
    joy?: number;
    sadness?: number;
    anger?: number;
    fear?: number;
    surprise?: number;
  };
  keywords?: string[];
  topics?: string[];
}

export interface CallQualityScore {
  callId: string;
  overallScore: number; // 0-100
  agentScore: number; // 0-100
  customerScore: number; // 0-100
  metrics: {
    talkTime: number; // seconds
    silenceTime: number; // seconds
    interruptionCount: number;
    averageResponseTime: number; // seconds
    sentimentScore: number; // -1 to 1
  };
  flags: Array<{
    type: 'negative_sentiment' | 'complaint' | 'long_silence' | 'interruption' | 'keyword_detected';
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp?: number; // seconds into call
  }>;
}

export interface VoiceAnalyticsConfig {
  transcriptionProvider: 'assemblyai' | 'google' | 'aws' | 'telnyx';
  transcriptionApiKey?: string;
  sentimentProvider: 'assemblyai' | 'google' | 'custom';
  enableRealTimeMonitoring: boolean;
  qualityThreshold: number; // 0-100, below which to flag
  keywordDetection: string[]; // Keywords to flag
}

class VoiceAnalyticsService {
  private config: VoiceAnalyticsConfig;

  constructor(config?: Partial<VoiceAnalyticsConfig>) {
    this.config = {
      transcriptionProvider: 'assemblyai',
      sentimentProvider: 'assemblyai',
      enableRealTimeMonitoring: true,
      qualityThreshold: 60,
      keywordDetection: ['complaint', 'unhappy', 'cancel', 'refund', 'lawsuit'],
      ...config
    };
  }

  /**
   * Transcribe call recording
   */
  async transcribeCall(
    tenantId: string,
    callId: string,
    recordingUrl: string
  ): Promise<TranscriptionResult> {
    try {
      switch (this.config.transcriptionProvider) {
        case 'assemblyai':
          return await this.transcribeWithAssemblyAI(recordingUrl);
        case 'google':
          return await this.transcribeWithGoogle(recordingUrl);
        case 'aws':
          return await this.transcribeWithAWS(recordingUrl);
        case 'telnyx':
          return await this.transcribeWithTelnyx(recordingUrl);
        default:
          throw new Error(`Unsupported transcription provider: ${this.config.transcriptionProvider}`);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment from transcript
   */
  async analyzeSentiment(
    tenantId: string,
    callId: string,
    transcript: string
  ): Promise<SentimentAnalysis> {
    try {
      switch (this.config.sentimentProvider) {
        case 'assemblyai':
          return await this.analyzeSentimentWithAssemblyAI(transcript);
        case 'google':
          return await this.analyzeSentimentWithGoogle(transcript);
        case 'custom':
          return await this.analyzeSentimentCustom(transcript);
        default:
          return await this.analyzeSentimentCustom(transcript);
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Return neutral sentiment on error
      return {
        overall: 'neutral',
        score: 0
      };
    }
  }

  /**
   * Score call quality
   */
  async scoreCallQuality(
    tenantId: string,
    callId: string,
    transcript: string,
    sentiment: SentimentAnalysis,
    callDuration: number,
    metadata?: Record<string, any>
  ): Promise<CallQualityScore> {
    const flags: CallQualityScore['flags'] = [];
    let overallScore = 100;

    // Check sentiment
    if (sentiment.score < -0.5) {
      flags.push({
        type: 'negative_sentiment',
        severity: 'high',
        description: 'Strongly negative sentiment detected',
        timestamp: 0
      });
      overallScore -= 30;
    } else if (sentiment.score < -0.2) {
      flags.push({
        type: 'negative_sentiment',
        severity: 'medium',
        description: 'Negative sentiment detected',
        timestamp: 0
      });
      overallScore -= 15;
    }

    // Check for complaint keywords
    const lowerTranscript = transcript.toLowerCase();
    for (const keyword of this.config.keywordDetection) {
      if (lowerTranscript.includes(keyword.toLowerCase())) {
        flags.push({
          type: 'keyword_detected',
          severity: 'medium',
          description: `Keyword detected: ${keyword}`,
          timestamp: 0
        });
        overallScore -= 10;
      }
    }

    // Check for complaints
    if (lowerTranscript.includes('complaint') || lowerTranscript.includes('unhappy')) {
      flags.push({
        type: 'complaint',
        severity: 'high',
        description: 'Complaint detected in conversation',
        timestamp: 0
      });
      overallScore -= 25;
    }

    // Calculate agent and customer scores (simplified)
    const agentScore = Math.max(0, overallScore - 10);
    const customerScore = Math.max(0, overallScore - 5);

    const qualityScore: CallQualityScore = {
      callId,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      agentScore: Math.max(0, Math.min(100, agentScore)),
      customerScore: Math.max(0, Math.min(100, customerScore)),
      metrics: {
        talkTime: callDuration,
        silenceTime: 0, // Would calculate from transcript segments
        interruptionCount: 0, // Would detect from transcript
        averageResponseTime: 0, // Would calculate from segments
        sentimentScore: sentiment.score
      },
      flags
    };

    // Flag for QA if below threshold
    if (qualityScore.overallScore < this.config.qualityThreshold) {
      await auditEvidenceService.logEvent({
        tenantId,
        callId,
        eventType: 'data.access',
        eventData: {
          action: 'call_flagged_for_qa',
          callId,
          qualityScore: qualityScore.overallScore,
          flags: flags.length
        },
        metadata: {
          service: 'voice_analytics',
          priority: 'high'
        }
      });
    }

    return qualityScore;
  }

  /**
   * Transcribe with AssemblyAI
   */
  private async transcribeWithAssemblyAI(recordingUrl: string): Promise<TranscriptionResult> {
    if (!this.config.transcriptionApiKey) {
      throw new Error('AssemblyAI API key not configured');
    }

    // Submit transcription job
    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': this.config.transcriptionApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: recordingUrl,
        speaker_labels: true,
        sentiment_analysis: true
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`AssemblyAI submission failed: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const transcriptId = submitData.id;

    // Poll for completion
    let transcriptData;
    let attempts = 0;
    while (attempts < 60) { // Max 5 minutes
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': this.config.transcriptionApiKey
        }
      });

      transcriptData = await statusResponse.json();

      if (transcriptData.status === 'completed') {
        break;
      }

      if (transcriptData.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptData.error}`);
      }

      attempts++;
    }

    if (transcriptData.status !== 'completed') {
      throw new Error('Transcription timeout');
    }

    return {
      transcript: transcriptData.text,
      confidence: transcriptData.confidence || 0.9,
      segments: transcriptData.utterances?.map((u: any) => ({
        text: u.text,
        startTime: u.start / 1000,
        endTime: u.end / 1000,
        speaker: u.speaker
      })),
      language: transcriptData.language_code
    };
  }

  /**
   * Transcribe with Google Cloud Speech-to-Text
   */
  private async transcribeWithGoogle(recordingUrl: string): Promise<TranscriptionResult> {
    // Implementation would use Google Cloud Speech-to-Text API
    // For now, return mock structure
    return {
      transcript: '[Google transcription would go here]',
      confidence: 0.9,
      language: 'en-US'
    };
  }

  /**
   * Transcribe with AWS Transcribe
   */
  private async transcribeWithAWS(recordingUrl: string): Promise<TranscriptionResult> {
    // Implementation would use AWS Transcribe
    return {
      transcript: '[AWS transcription would go here]',
      confidence: 0.9,
      language: 'en-US'
    };
  }

  /**
   * Transcribe with Telnyx
   */
  private async transcribeWithTelnyx(recordingUrl: string): Promise<TranscriptionResult> {
    // Telnyx may provide transcription via their API
    return {
      transcript: '[Telnyx transcription would go here]',
      confidence: 0.9,
      language: 'en-US'
    };
  }

  /**
   * Analyze sentiment with AssemblyAI
   */
  private async analyzeSentimentWithAssemblyAI(transcript: string): Promise<SentimentAnalysis> {
    // AssemblyAI provides sentiment analysis as part of transcription
    // For now, use custom analysis
    return this.analyzeSentimentCustom(transcript);
  }

  /**
   * Analyze sentiment with Google
   */
  private async analyzeSentimentWithGoogle(transcript: string): Promise<SentimentAnalysis> {
    // Would use Google Cloud Natural Language API
    return this.analyzeSentimentCustom(transcript);
  }

  /**
   * Custom sentiment analysis (simplified)
   */
  private async analyzeSentimentCustom(transcript: string): Promise<SentimentAnalysis> {
    const lowerTranscript = transcript.toLowerCase();

    // Simple keyword-based sentiment
    const positiveWords = ['great', 'excellent', 'happy', 'satisfied', 'thank', 'love', 'perfect', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'angry', 'complaint'];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (lowerTranscript.includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (lowerTranscript.includes(word)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    let score = 0;
    let overall: 'positive' | 'neutral' | 'negative' = 'neutral';

    if (total > 0) {
      score = (positiveCount - negativeCount) / total;
    }

    if (score > 0.2) {
      overall = 'positive';
    } else if (score < -0.2) {
      overall = 'negative';
    }

    return {
      overall,
      score,
      keywords: [...positiveWords.filter(w => lowerTranscript.includes(w)), ...negativeWords.filter(w => lowerTranscript.includes(w))]
    };
  }
}

export const voiceAnalyticsService = new VoiceAnalyticsService();
