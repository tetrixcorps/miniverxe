// Environment variables - use process.env in production
export const env = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
  },
  sinch: {
    apiKey: process.env.NEXT_PUBLIC_SINCH_API_KEY || '',
    widgetId: process.env.NEXT_PUBLIC_SINCH_WIDGET_ID || '',
    servicePlanId: process.env.SINCH_SERVICE_PLAN_ID || '',
    conversationProjectId: process.env.SINCH_CONVERSATION_PROJECT_ID || '',
    virtualNumber: process.env.SINCH_VIRTUAL_NUMBER || '',
    backupNumber1: process.env.SINCH_BACKUP_NUMBER_1 || '',
    backupNumber2: process.env.SINCH_BACKUP_NUMBER_2 || '',
    backupNumber3: process.env.SINCH_BACKUP_NUMBER_3 || '',
    apiToken: process.env.SINCH_API_TOKEN || ''
  },
  shango: {
    defaultAgent: process.env.SHANGO_DEFAULT_AGENT || 'shango-general',
    maxMessages: process.env.SHANGO_MAX_MESSAGES || '100',
    sessionTimeout: process.env.SHANGO_SESSION_TIMEOUT || '3600'
  },
  crossPlatform: {
    sessionSecret: process.env.CROSS_PLATFORM_SESSION_SECRET || ''
  },
  domains: {
    tetrix: process.env.TETRIX_DOMAIN || '',
    joromi: process.env.JOROMI_DOMAIN || ''
  }
};
