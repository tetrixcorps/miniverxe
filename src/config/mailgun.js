"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailgunConfig = void 0;
exports.validateMailgunConfig = validateMailgunConfig;
exports.getMailgunAuthHeader = getMailgunAuthHeader;
// Mailgun Configuration - Production Ready
exports.mailgunConfig = {
    domain: import.meta.env.MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com',
    apiKey: import.meta.env.MAILGUN_API_KEY || process.env.MAILGUN_API_KEY,
    webhookSigningKey: import.meta.env.MAILGUN_WEBHOOK || import.meta.env.MAILGUN_WEBHOOK_SIGNING_KEY || process.env.MAILGUN_WEBHOOK || process.env.MAILGUN_WEBHOOK_SIGNING_KEY,
    contactEmail: 'support@tetrixcorp.com',
    fromEmail: 'noreply@tetrixcorp.com',
};
// Validate configuration
function validateMailgunConfig() {
    const missing = [];
    if (!exports.mailgunConfig.apiKey) {
        missing.push('MAILGUN_API_KEY');
    }
    if (!exports.mailgunConfig.webhookSigningKey) {
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
function getMailgunAuthHeader() {
    if (!exports.mailgunConfig.apiKey) {
        throw new Error('MAILGUN_API_KEY not configured');
    }
    return `Basic ${Buffer.from(`api:${exports.mailgunConfig.apiKey}`).toString('base64')}`;
}
//# sourceMappingURL=mailgun.js.map