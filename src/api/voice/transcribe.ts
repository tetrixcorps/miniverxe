// Deepgram STT Transcription API
// Handles speech-to-text processing with Deepgram

import { Request, Response } from 'express';
import { telnyxVoiceService } from '../../services/telnyxVoiceService';

// Process audio transcription with Deepgram
export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    const { audioUrl, sessionId, language = 'en-US' } = req.body;

    // Validate required fields
    if (!audioUrl) {
      return res.status(400).json({
        error: 'Audio URL is required'
      });
    }

    // Validate audio URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(audioUrl)) {
      return res.status(400).json({
        error: 'Invalid audio URL format'
      });
    }

    // Process transcription
    await telnyxVoiceService.processTranscription(audioUrl, sessionId);

    // Get updated session
    const session = telnyxVoiceService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      transcription: session.transcription,
      message: 'Transcription completed successfully'
    });

  } catch (error) {
    console.error('Transcription failed:', error);
    
    // Handle specific error types
    if (error.message.includes('API key not configured')) {
      return res.status(500).json({
        error: 'Transcription service not properly configured',
        message: 'Please check your Deepgram API configuration'
      });
    }
    
    if (error.message.includes('Deepgram API error')) {
      return res.status(502).json({
        error: 'External service error',
        message: 'Failed to connect to Deepgram API'
      });
    }

    res.status(500).json({
      error: 'Failed to process transcription',
      message: error.message
    });
  }
};

// Get transcription for a session
export const getTranscription = async (req: Request, res: Response) => {
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

    if (!session.transcription) {
      return res.status(404).json({
        error: 'No transcription available for this session'
      });
    }

    res.status(200).json({
      success: true,
      transcription: session.transcription
    });

  } catch (error) {
    console.error('Failed to get transcription:', error);
    res.status(500).json({
      error: 'Failed to get transcription',
      message: error.message
    });
  }
};

// Batch transcription processing
export const batchTranscribe = async (req: Request, res: Response) => {
  try {
    const { audioUrls, sessionIds, language = 'en-US' } = req.body;

    // Validate required fields
    if (!audioUrls || !Array.isArray(audioUrls) || audioUrls.length === 0) {
      return res.status(400).json({
        error: 'Audio URLs array is required'
      });
    }

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({
        error: 'Session IDs array is required'
      });
    }

    if (audioUrls.length !== sessionIds.length) {
      return res.status(400).json({
        error: 'Audio URLs and Session IDs arrays must have the same length'
      });
    }

    // Process transcriptions in parallel
    const transcriptionPromises = audioUrls.map((audioUrl, index) => 
      telnyxVoiceService.processTranscription(audioUrl, sessionIds[index])
    );

    await Promise.all(transcriptionPromises);

    // Get updated sessions
    const sessions = sessionIds.map(sessionId => 
      telnyxVoiceService.getSession(sessionId)
    ).filter(session => session !== undefined);

    res.status(200).json({
      success: true,
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        transcription: session.transcription
      })),
      message: 'Batch transcription completed successfully'
    });

  } catch (error) {
    console.error('Batch transcription failed:', error);
    res.status(500).json({
      error: 'Failed to process batch transcription',
      message: error.message
    });
  }
};

// Get transcription statistics
export const getTranscriptionStats = async (req: Request, res: Response) => {
  try {
    const sessions = telnyxVoiceService.getAllSessions();
    
    const stats = {
      totalSessions: sessions.length,
      sessionsWithTranscription: sessions.filter(s => s.transcription).length,
      averageConfidence: 0,
      languageDistribution: {} as Record<string, number>,
      totalTranscriptionTime: 0
    };

    let totalConfidence = 0;
    let transcriptionCount = 0;

    sessions.forEach(session => {
      if (session.transcription) {
        totalConfidence += session.transcription.confidence;
        transcriptionCount++;
        
        const lang = session.transcription.language;
        stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + 1;
        
        if (session.recording) {
          stats.totalTranscriptionTime += session.recording.duration;
        }
      }
    });

    if (transcriptionCount > 0) {
      stats.averageConfidence = totalConfidence / transcriptionCount;
    }

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Failed to get transcription stats:', error);
    res.status(500).json({
      error: 'Failed to get transcription statistics',
      message: error.message
    });
  }
};

// Health check for transcription service
export const transcriptionHealthCheck = async (req: Request, res: Response) => {
  try {
    // Test Deepgram API connectivity
    const testResponse = await fetch(`${process.env.DEEPGRAM_API_URL || 'https://api.deepgram.com/v1'}/listen`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com/test-audio.mp3',
        model: 'nova-2'
      })
    });

    const isHealthy = testResponse.status === 200 || testResponse.status === 400; // 400 is expected for invalid URL

    res.status(200).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'deepgram-stt',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transcription health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'deepgram-stt',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
