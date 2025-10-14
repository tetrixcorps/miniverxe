// SinchChatLive Configuration
// Centralized configuration for Sinch environment variables

export interface SinchConfig {
  projectId: string;
  appId: string;
  clientId: string;
  clientSecret: string;
  virtualNumber: string;
  environment: 'development' | 'production';
}

// Get Sinch configuration from environment variables
export function getSinchConfig(): SinchConfig {
  // Try multiple environment variable names for compatibility
  const projectId = process.env.SINCH_PROJECT_ID || 
                   process.env.SINCH_SERVICE_PLAN_ID || 
                   '01K1GYEHZAXEZVGDA34V3873KM';
  
  const appId = process.env.SINCH_APP_ID || 
               process.env.SINCH_CONVERSATION_PROJECT_ID || 
               '01K1GYEHZAXEZVGDA34V3873KM';
  
  const clientId = process.env.SINCH_CLIENT_ID || 
                  process.env.SINCH_API_TOKEN || 
                  '544cdba462974e05adc5140211c0311c';
  
  const clientSecret = process.env.SINCH_CLIENT_SECRET || 
                      process.env.SINCH_SERVICE_PLAN_ID || 
                      '01K1GYEHZAXEZVGDA34V3873KM';
  
  const virtualNumber = process.env.SINCH_VIRTUAL_NUMBER || '+16465799770';
  const environment = (process.env.NODE_ENV as 'development' | 'production') || 'development';

  console.log('SinchConfig: Environment variables loaded:', {
    projectId: projectId ? '***' : 'undefined',
    appId: appId ? '***' : 'undefined',
    clientId: clientId ? '***' : 'undefined',
    clientSecret: clientSecret ? '***' : 'undefined',
    virtualNumber,
    environment
  });

  return {
    projectId,
    appId,
    clientId,
    clientSecret,
    virtualNumber,
    environment
  };
}

// Export the configuration
export const sinchConfig = getSinchConfig();

