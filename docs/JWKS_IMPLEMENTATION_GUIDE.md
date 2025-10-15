# TETRIX JWKS Implementation Guide

## Overview

This document outlines the implementation of JSON Web Key Set (JWKS) endpoints for the TETRIX platform, enabling secure OAuth 2.0 and OpenID Connect authentication flows with Epic MyChart and other healthcare providers using SMART on FHIR.

## JWKS Endpoints

### Production Environment
- **URL**: `https://tetrixcorp.com/.well-known/jwks.json`
- **Purpose**: Production OAuth 2.0 and OpenID Connect authentication
- **Usage**: Epic MyChart, SMART on FHIR, and other production integrations

### Non-Production Environments
- **Development**: `https://dev.tetrixcorp.com/.well-known/jwks.json`
- **Staging**: `https://staging.tetrixcorp.com/.well-known/jwks.json`
- **Purpose**: Development and testing of OAuth integrations

## Implementation Details

### 1. JWKS Endpoint Structure

The JWKS endpoint is implemented as an Astro page at `src/pages/.well-known/jwks.json.astro`:

```astro
---
// TETRIX JWKS (JSON Web Key Set) Endpoint
// Serves public keys for JWT token verification in OAuth 2.0 and OpenID Connect flows
// Accessible at: https://tetrixcorp.com/.well-known/jwks.json

import { generateJWKS } from '../../services/auth/jwksService';

// Generate JWKS for the current environment
const jwks = await generateJWKS();

// Set proper headers for JWKS endpoint
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

// Set response headers
Object.entries(headers).forEach(([key, value]) => {
  Astro.response.headers.set(key, value);
});

// Return JWKS as JSON
return new Response(JSON.stringify(jwks, null, 2), {
  status: 200,
  headers: Astro.response.headers
});
---
```

### 2. JWKS Service Implementation

The `JWKSService` class manages RSA key pairs and generates JWKS:

```typescript
// src/services/auth/jwksService.ts

export interface JWK {
  kty: string;        // Key type (RSA)
  kid: string;        // Key ID
  use: string;        // Key use (sig for signature)
  alg: string;        // Algorithm (RS256)
  n: string;          // RSA modulus
  e: string;          // RSA exponent
}

export interface JWKS {
  keys: JWK[];
}
```

### 3. Key Management Features

#### Key Generation
- **Algorithm**: RSA-PSS with 2048-bit modulus
- **Hash**: SHA-256
- **Key Pairs**: Primary and backup keys for rotation
- **Expiration**: 1-year key lifecycle

#### Key Rotation
- Automatic key rotation capability
- Backup key management
- Zero-downtime key updates
- Expiration monitoring

#### Security Features
- Private keys never exposed
- Public keys only in JWKS endpoint
- Proper CORS headers
- Security headers (X-Frame-Options, X-XSS-Protection)
- Cache control for performance

## Example JWKS Response

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "tetrix-primary-1703123456789",
      "use": "sig",
      "alg": "RS256",
      "n": "your-public-key-modulus-base64",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "kid": "tetrix-backup-1703123456788",
      "use": "sig",
      "alg": "RS256",
      "n": "your-backup-public-key-modulus-base64",
      "e": "AQAB"
    }
  ]
}
```

## Epic MyChart Integration

### Registration Requirements

When registering with Epic MyChart, provide these JWKS URLs:

1. **Non-Production**: `https://dev.tetrixcorp.com/.well-known/jwks.json`
2. **Production**: `https://tetrixcorp.com/.well-known/jwks.json`

### SMART on FHIR Configuration

```json
{
  "client_id": "your-tetrix-client-id",
  "redirect_uris": [
    "https://tetrixcorp.com/auth/epic/callback"
  ],
  "jwks_uri": "https://tetrixcorp.com/.well-known/jwks.json",
  "scope": "launch/patient patient/*.read openid fhirUser",
  "grant_types": ["authorization_code"],
  "response_types": ["code"]
}
```

## Security Considerations

### 1. Key Security
- Private keys stored securely (never in JWKS endpoint)
- Different key pairs for production and non-production
- Regular key rotation (recommended: every 6-12 months)
- Key expiration monitoring

### 2. Endpoint Security
- HTTPS required for all environments
- Proper CORS configuration
- Security headers implementation
- Rate limiting (if needed)

### 3. Compliance
- HIPAA compliance for healthcare integrations
- SOC 2 Type 2 compliance
- Regular security audits
- Penetration testing

## Deployment Configuration

### DNS Setup
Ensure proper DNS configuration for all environments:

```
tetrixcorp.com          → Production server
dev.tetrixcorp.com      → Development server
staging.tetrixcorp.com  → Staging server
```

### SSL Certificates
- Valid SSL certificates for all domains
- Certificate auto-renewal
- HSTS headers for security

### Environment Variables
```bash
# Production
SALESFORCE_API_KEY=your_production_salesforce_key
SALESFORCE_ACCESS_TOKEN=your_production_access_token
SALESFORCE_BASE_URL=https://your-instance.salesforce.com

# Development
SALESFORCE_API_KEY=your_dev_salesforce_key
SALESFORCE_ACCESS_TOKEN=your_dev_access_token
SALESFORCE_BASE_URL=https://your-dev-instance.salesforce.com
```

## Testing

### 1. JWKS Endpoint Testing
```bash
# Test JWKS endpoint
curl -H "Accept: application/json" https://tetrixcorp.com/.well-known/jwks.json

# Verify response format
jq '.keys[0] | {kty, kid, use, alg}' https://tetrixcorp.com/.well-known/jwks.json
```

### 2. OAuth Flow Testing
- Test authorization code flow
- Verify JWT token validation
- Test token refresh
- Validate scope permissions

### 3. Integration Testing
- Epic MyChart integration
- Salesforce OAuth
- HubSpot OAuth
- Cross-platform authentication

## Monitoring and Maintenance

### 1. Key Monitoring
- Key expiration alerts
- Key rotation status
- Usage metrics
- Error monitoring

### 2. Performance Monitoring
- JWKS endpoint response times
- Cache hit rates
- Error rates
- Uptime monitoring

### 3. Security Monitoring
- Failed authentication attempts
- Suspicious key usage
- Unauthorized access attempts
- Compliance violations

## Troubleshooting

### Common Issues

1. **JWKS Endpoint Not Accessible**
   - Check DNS configuration
   - Verify SSL certificates
   - Check server configuration

2. **Invalid Key Format**
   - Verify key generation
   - Check base64 encoding
   - Validate JWK structure

3. **OAuth Integration Failures**
   - Verify client registration
   - Check redirect URIs
   - Validate scopes

### Debug Commands
```bash
# Check JWKS endpoint
curl -v https://tetrixcorp.com/.well-known/jwks.json

# Validate JWT token
jwt decode your-jwt-token

# Test OAuth flow
curl -X POST https://oauth.provider.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=your-code&client_id=your-client-id"
```

## Future Enhancements

1. **Key Rotation Automation**
   - Automated key rotation
   - Zero-downtime updates
   - Rollback capabilities

2. **Advanced Security**
   - Hardware Security Modules (HSM)
   - Key escrow
   - Audit logging

3. **Performance Optimization**
   - CDN integration
   - Advanced caching
   - Load balancing

4. **Compliance Enhancements**
   - FedRAMP compliance
   - FISMA compliance
   - Additional healthcare standards

## Support and Documentation

- **Technical Support**: support@tetrixcorp.com
- **Security Issues**: security@tetrixcorp.com
- **Documentation**: https://docs.tetrixcorp.com
- **API Reference**: https://api.tetrixcorp.com/docs

---

*This document is maintained by the TETRIX development team and updated regularly to reflect current implementation and best practices.*
