// OAuth Provider Configurations
// Pre-configured OAuth settings for various industry providers

import type { OAuthConfig } from './industryAuthService';

export interface ProviderConfigMap {
  [key: string]: OAuthConfig;
}

/**
 * Get OAuth configuration for a provider
 * In production, these should be stored in database and retrieved dynamically
 */
export function getProviderConfig(provider: string, customConfig?: Partial<OAuthConfig>): OAuthConfig {
  const baseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3001';
  
  const configs: ProviderConfigMap = {
    // Salesforce
    salesforce: {
      provider: 'salesforce',
      clientId: process.env.SALESFORCE_CLIENT_ID || '',
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
      authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      redirectUri: `${baseUrl}/api/oauth/callback`,
      scopes: ['api', 'refresh_token', 'full'],
      grantType: 'authorization_code',
    },

    // HubSpot
    hubspot: {
      provider: 'hubspot',
      clientId: process.env.HUBSPOT_CLIENT_ID || '',
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
      authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      redirectUri: `${baseUrl}/api/oauth/callback`,
      scopes: ['contacts', 'content', 'crm.objects.contacts.read', 'crm.objects.contacts.write'],
      grantType: 'authorization_code',
    },

    // Epic (SMART on FHIR)
    epic: {
      provider: 'epic',
      clientId: process.env.EPIC_CLIENT_ID || '',
      clientSecret: process.env.EPIC_CLIENT_SECRET || '',
      authorizationUrl: process.env.EPIC_AUTH_URL || '',
      tokenUrl: process.env.EPIC_TOKEN_URL || '',
      redirectUri: `${baseUrl}/api/oauth/callback`,
      scopes: [
        'patient/Patient.read',
        'patient/Appointment.read',
        'patient/Appointment.write',
        'patient/MedicationRequest.read',
        'patient/MedicationRequest.write',
      ],
      grantType: 'authorization_code',
      pkceEnabled: true, // SMART on FHIR requires PKCE
    },

    // Cerner (SMART on FHIR)
    cerner: {
      provider: 'cerner',
      clientId: process.env.CERNER_CLIENT_ID || '',
      clientSecret: process.env.CERNER_CLIENT_SECRET || '',
      authorizationUrl: process.env.CERNER_AUTH_URL || '',
      tokenUrl: process.env.CERNER_TOKEN_URL || '',
      redirectUri: `${baseUrl}/api/oauth/callback`,
      scopes: [
        'patient/Patient.read',
        'patient/Appointment.read',
        'patient/MedicationRequest.read',
      ],
      grantType: 'authorization_code',
      pkceEnabled: true,
    },

    // Shopify
    shopify: {
      provider: 'shopify',
      clientId: process.env.SHOPIFY_CLIENT_ID || '',
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET || '',
      authorizationUrl: process.env.SHOPIFY_AUTH_URL || '',
      tokenUrl: process.env.SHOPIFY_TOKEN_URL || '',
      redirectUri: `${baseUrl}/api/oauth/callback`,
      scopes: ['read_orders', 'write_orders', 'read_products', 'read_customers'],
      grantType: 'authorization_code',
    },

    // Clio (Legal)
    clio: {
      provider: 'clio',
      clientId: process.env.CLIO_CLIENT_ID || '',
      clientSecret: process.env.CLIO_CLIENT_SECRET || '',
      authorizationUrl: 'https://app.clio.com/oauth/authorize',
      tokenUrl: 'https://app.clio.com/oauth/token',
      redirectUri: `${baseUrl}/api/oauth/callback`,
      scopes: ['read', 'write', 'user:read', 'matters:read', 'matters:write', 'contacts:read', 'contacts:write'],
      grantType: 'authorization_code',
    },
  };

  const config = configs[provider.toLowerCase()];
  if (!config) {
    throw new Error(`Provider ${provider} not configured`);
  }

  // Merge with custom config if provided
  return customConfig ? { ...config, ...customConfig } : config;
}

/**
 * Get all supported providers
 */
export function getSupportedProviders(): string[] {
  return [
    'salesforce',
    'hubspot',
    'epic',
    'cerner',
    'shopify',
    'clio',
  ];
}
