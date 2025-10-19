// Mailgun Configuration for Campaign System
export const mailgunConfig = {
  domain: process.env['MAILGUN_DOMAIN'] || 'mg.tetrixcorp.com',
  apiKey: process.env['MAILGUN_API_KEY'] || '',
  webhookSigningKey: process.env['MAILGUN_WEBHOOK'] || process.env['MAILGUN_WEBHOOK_SIGNING_KEY'] || '',
  contactEmail: 'support@tetrixcorp.com',
  fromEmail: 'noreply@tetrixcorp.com',
};

// Validate configuration
export function validateMailgunConfig() {
  const missing = [];
  
  if (!mailgunConfig.apiKey) {
    missing.push('MAILGUN_API_KEY');
  }
  
  if (!mailgunConfig.webhookSigningKey) {
    missing.push('MAILGUN_WEBHOOK or MAILGUN_WEBHOOK_SIGNING_KEY');
  }
  
  if (missing.length > 0) {
    console.warn(`Missing Mailgun environment variables: ${missing.join(', ')}`);
    console.warn('Please set these in your .env file or environment variables');
    return false;
  }
  
  return true;
}

// Get base64 encoded API key for Mailgun authentication
export function getMailgunAuthHeader() {
  if (!mailgunConfig.apiKey) {
    throw new Error('MAILGUN_API_KEY not configured');
  }
  
  return `Basic ${Buffer.from(`api:${mailgunConfig.apiKey}`).toString('base64')}`;
}
