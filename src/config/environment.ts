// Environment Configuration
// Centralized configuration for different environments

export interface EnvironmentConfig {
  joromiUrl: string;
  codeAcademyUrl: string;
  tetrixApiUrl: string;
  webhookBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  callCenter?: {
    callCenterNumber: string;
    outboundProfileId: string;
    maxDialAttempts: number;
    dialTimeout: number;
    voicemailEnabled: boolean;
    recordingEnabled: boolean;
  };
}

// Get environment-specific configuration
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return {
        joromiUrl: process.env.JOROMI_URL || 'https://joromi.ai',
        codeAcademyUrl: process.env.CODE_ACADEMY_URL || 'https://poisonedreligion.ai',
        tetrixApiUrl: process.env.TETRIX_API_URL || 'https://tetrixcorp.com',
        webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com',
        environment: 'production',
        callCenter: {
          callCenterNumber: process.env.CALL_CENTER_NUMBER || '',
          outboundProfileId: process.env.TELNYX_OUTBOUND_PROFILE_ID || '',
          maxDialAttempts: parseInt(process.env.CALL_CENTER_MAX_DIAL_ATTEMPTS || '2', 10),
          dialTimeout: parseInt(process.env.CALL_CENTER_DIAL_TIMEOUT || '30', 10),
          voicemailEnabled: process.env.CALL_CENTER_VOICEMAIL_ENABLED !== 'false',
          recordingEnabled: process.env.CALL_CENTER_RECORDING_ENABLED !== 'false'
        }
      };
    
    case 'staging':
      return {
        joromiUrl: process.env.JOROMI_URL || 'https://staging-joromi.tetrixcorp.com',
        codeAcademyUrl: process.env.CODE_ACADEMY_URL || 'https://staging.poisonedreligion.ai',
        tetrixApiUrl: process.env.TETRIX_API_URL || 'https://staging.tetrixcorp.com',
        webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'https://staging.tetrixcorp.com',
        environment: 'staging',
        callCenter: {
          callCenterNumber: process.env.CALL_CENTER_NUMBER || '',
          outboundProfileId: process.env.TELNYX_OUTBOUND_PROFILE_ID || '',
          maxDialAttempts: parseInt(process.env.CALL_CENTER_MAX_DIAL_ATTEMPTS || '2', 10),
          dialTimeout: parseInt(process.env.CALL_CENTER_DIAL_TIMEOUT || '30', 10),
          voicemailEnabled: process.env.CALL_CENTER_VOICEMAIL_ENABLED !== 'false',
          recordingEnabled: process.env.CALL_CENTER_RECORDING_ENABLED !== 'false'
        }
      };
    
    default: // development
      return {
        joromiUrl: process.env.JOROMI_URL || 'http://localhost:3000',
        codeAcademyUrl: process.env.CODE_ACADEMY_URL || 'http://localhost:3001',
        tetrixApiUrl: process.env.TETRIX_API_URL || 'http://localhost:4321',
        webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:4321',
        environment: 'development',
        callCenter: {
          callCenterNumber: process.env.CALL_CENTER_NUMBER || '',
          outboundProfileId: process.env.TELNYX_OUTBOUND_PROFILE_ID || '',
          maxDialAttempts: parseInt(process.env.CALL_CENTER_MAX_DIAL_ATTEMPTS || '2', 10),
          dialTimeout: parseInt(process.env.CALL_CENTER_DIAL_TIMEOUT || '30', 10),
          voicemailEnabled: process.env.CALL_CENTER_VOICEMAIL_ENABLED !== 'false',
          recordingEnabled: process.env.CALL_CENTER_RECORDING_ENABLED !== 'false'
        }
      };
  }
}

// Client-side configuration (for browser)
export function getClientEnvironmentConfig(): EnvironmentConfig {
  // In browser, we need to determine environment differently
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (hostname.includes('tetrixcorp.com')) {
    return {
      joromiUrl: 'https://joromi.ai',
      codeAcademyUrl: 'https://poisonedreligion.ai',
      tetrixApiUrl: 'https://tetrixcorp.com',
      webhookBaseUrl: 'https://tetrixcorp.com',
      environment: 'production'
    };
  } else if (hostname.includes('staging')) {
    return {
      joromiUrl: 'https://staging-joromi.tetrixcorp.com',
      codeAcademyUrl: 'https://staging.poisonedreligion.ai',
      tetrixApiUrl: 'https://staging.tetrixcorp.com',
      webhookBaseUrl: 'https://staging.tetrixcorp.com',
      environment: 'staging'
    };
  } else {
    return {
      joromiUrl: 'http://localhost:3000',
      codeAcademyUrl: 'http://localhost:3001',
      tetrixApiUrl: 'http://localhost:4321',
      webhookBaseUrl: 'http://localhost:4321',
      environment: 'development'
    };
  }
}

// Export default config
export const config = getEnvironmentConfig();
export const clientConfig = getClientEnvironmentConfig();
