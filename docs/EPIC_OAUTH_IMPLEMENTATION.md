# TETRIX Epic OAuth 2.0 Implementation Guide

## Overview

This document outlines the implementation of Epic OAuth 2.0 authentication for the TETRIX healthcare platform, enabling secure access to Epic MyChart and FHIR APIs using SMART on FHIR standards.

## Epic OAuth 2.0 Implementation

### 1. OAuth 2.0 Flow Overview

The TETRIX platform implements Epic's OAuth 2.0 authentication using the SMART on FHIR profile, supporting:

- **EHR Launch**: Launch from within Epic's EHR system
- **Standalone Launch**: Direct patient/provider authentication
- **Backend Services**: Server-to-server authentication

### 2. Configuration

#### Environment Setup

```typescript
// src/config/epic-oauth.config.ts

export const EPIC_OAUTH_ENVIRONMENTS = {
  sandbox: {
    name: 'Epic Sandbox',
    baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth',
    audience: 'https://fhir.epic.com/interconnect-fhir-oauth',
    clientId: process.env.EPIC_SANDBOX_CLIENT_ID,
    redirectUri: 'https://dev.tetrixcorp.com/auth/epic/callback',
    scope: 'launch/patient patient/*.read openid fhirUser',
    jwksUri: 'https://dev.tetrixcorp.com/.well-known/jwks.json'
  },
  production: {
    name: 'Epic Production',
    baseUrl: 'https://fhir.epic.com',
    audience: 'https://fhir.epic.com',
    clientId: process.env.EPIC_PRODUCTION_CLIENT_ID,
    redirectUri: 'https://tetrixcorp.com/auth/epic/callback',
    scope: 'launch/patient patient/*.read openid fhirUser',
    jwksUri: 'https://tetrixcorp.com/.well-known/jwks.json'
  }
};
```

#### Required Environment Variables

```bash
# Epic OAuth Configuration
EPIC_ENVIRONMENT=sandbox
EPIC_SANDBOX_CLIENT_ID=your_sandbox_client_id
EPIC_PRODUCTION_CLIENT_ID=your_production_client_id
EPIC_SANDBOX_REDIRECT_URI=https://dev.tetrixcorp.com/auth/epic/callback
EPIC_PRODUCTION_REDIRECT_URI=https://tetrixcorp.com/auth/epic/callback
EPIC_SCOPE=launch/patient patient/*.read openid fhirUser
```

### 3. OAuth 2.0 Service Implementation

#### EpicOAuthService Class

```typescript
// src/services/integrations/EpicOAuthService.ts

export class EpicOAuthService {
  // Generate authorization URL
  generateAuthorizationUrl(state?: string): string
  
  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state?: string): Promise<EpicTokenResponse>
  
  // Refresh access token
  async refreshAccessToken(): Promise<EpicTokenResponse>
  
  // Get patient data from Epic FHIR API
  async getPatientData(patientId?: string): Promise<EpicPatientData>
  
  // Get encounter data
  async getEncounterData(patientId?: string): Promise<EpicEncounterData[]>
  
  // Get observation data (vital signs, lab results)
  async getObservationData(patientId: string, category?: string): Promise<any[]>
  
  // Get medication data
  async getMedicationData(patientId: string): Promise<any[]>
}
```

### 4. OAuth 2.0 Flow Implementation

#### Step 1: Authorization Request

```typescript
// Generate authorization URL
const authUrl = epicOAuth.generateAuthorizationUrl(state);

// Example authorization URL
https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?
  response_type=code&
  client_id=your_client_id&
  redirect_uri=https://tetrixcorp.com/auth/epic/callback&
  scope=launch/patient patient/*.read openid fhirUser&
  state=random_state_string&
  aud=https://fhir.epic.com/interconnect-fhir-oauth
```

#### Step 2: Token Exchange

```typescript
// Exchange authorization code for access token
const tokenResponse = await epicOAuth.exchangeCodeForToken(code, state);

// Example token response
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "launch/patient patient/*.read openid fhirUser",
  "patient": "12345",
  "encounter": "67890"
}
```

#### Step 3: FHIR API Access

```typescript
// Get patient data
const patientData = await epicOAuth.getPatientData();

// Get encounters
const encounters = await epicOAuth.getEncounterData(patientId);

// Get vital signs
const vitalSigns = await epicOAuth.getObservationData(patientId, 'vital-signs');

// Get medications
const medications = await epicOAuth.getMedicationData(patientId);
```

### 5. Epic FHIR API Endpoints

#### Patient Endpoints
- `GET /api/FHIR/R4/Patient` - Get patient list
- `GET /api/FHIR/R4/Patient/{id}` - Get specific patient

#### Encounter Endpoints
- `GET /api/FHIR/R4/Encounter` - Get encounter list
- `GET /api/FHIR/R4/Encounter?patient={id}` - Get patient encounters

#### Observation Endpoints
- `GET /api/FHIR/R4/Observation?patient={id}` - Get patient observations
- `GET /api/FHIR/R4/Observation?patient={id}&category=vital-signs` - Get vital signs
- `GET /api/FHIR/R4/Observation?patient={id}&category=laboratory` - Get lab results

#### Medication Endpoints
- `GET /api/FHIR/R4/MedicationRequest?patient={id}` - Get patient medications

### 6. Security Implementation

#### Required Security Features

1. **HTTPS Enforcement**: All OAuth flows must use HTTPS
2. **State Parameter**: Always include state parameter for CSRF protection
3. **Nonce Parameter**: Include nonce for additional security
4. **PKCE Support**: Use Proof Key for Code Exchange
5. **Token Validation**: Validate all tokens and claims

#### Security Headers

```typescript
const securityHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};
```

### 7. Epic OAuth Scopes

#### Patient Access Scopes
- `patient/*.read` - Read access to patient data
- `patient/*.write` - Write access to patient data
- `patient/*.*` - Full access to patient data

#### Launch Scopes
- `launch/patient` - Launch with patient context
- `launch/encounter` - Launch with encounter context
- `offline_access` - Offline access capability

#### System Scopes
- `system/*.read` - Read access to system data
- `system/*.write` - Write access to system data
- `system/*.*` - Full access to system data

#### User Scopes
- `openid` - OpenID Connect authentication
- `fhirUser` - FHIR user information
- `profile` - User profile information
- `email` - User email address

### 8. Error Handling

#### OAuth 2.0 Error Codes

```typescript
export const EPIC_OAUTH_ERRORS = {
  INVALID_REQUEST: 'invalid_request',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  ACCESS_DENIED: 'access_denied',
  UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
  INVALID_SCOPE: 'invalid_scope',
  SERVER_ERROR: 'server_error',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type'
};
```

#### Error Response Handling

```typescript
try {
  const tokenResponse = await epicOAuth.exchangeCodeForToken(code, state);
} catch (error) {
  if (error.error === 'invalid_grant') {
    // Handle invalid grant error
    console.error('Invalid authorization code');
  } else if (error.error === 'invalid_client') {
    // Handle invalid client error
    console.error('Invalid client credentials');
  } else {
    // Handle other errors
    console.error('OAuth error:', error.error_description);
  }
}
```

### 9. Token Management

#### Access Token Storage

```typescript
// Store tokens securely
localStorage.setItem('epic_access_token', tokenResponse.access_token);
localStorage.setItem('epic_refresh_token', tokenResponse.refresh_token);
localStorage.setItem('epic_token_expiry', tokenResponse.expires_in);

// Retrieve tokens
const accessToken = localStorage.getItem('epic_access_token');
const refreshToken = localStorage.getItem('epic_refresh_token');
const tokenExpiry = localStorage.getItem('epic_token_expiry');
```

#### Token Refresh

```typescript
// Check if token needs refresh
if (Date.now() >= tokenExpiry) {
  try {
    const newTokenResponse = await epicOAuth.refreshAccessToken();
    // Update stored tokens
  } catch (error) {
    // Handle refresh failure - redirect to login
    window.location.href = '/auth/epic/login';
  }
}
```

### 10. Epic MyChart Integration

#### Registration Requirements

1. **Client Registration**: Register your application with Epic
2. **JWKS URI**: Provide your JWKS endpoint URL
3. **Redirect URIs**: Configure allowed redirect URIs
4. **Scopes**: Request appropriate scopes for your use case

#### JWKS Configuration

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
    }
  ]
}
```

### 11. Testing and Validation

#### Sandbox Testing

```bash
# Test Epic OAuth flow
curl -X POST https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=your_code&redirect_uri=your_redirect_uri&client_id=your_client_id"

# Test FHIR API access
curl -X GET https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient \
  -H "Authorization: Bearer your_access_token" \
  -H "Accept: application/json"
```

#### Production Validation

1. **Certificate Validation**: Ensure SSL certificates are valid
2. **JWKS Endpoint**: Verify JWKS endpoint is accessible
3. **Redirect URIs**: Confirm redirect URIs are properly configured
4. **Scopes**: Validate requested scopes are appropriate
5. **Security**: Verify all security requirements are met

### 12. Compliance and Standards

#### HIPAA Compliance

- **Data Encryption**: All data encrypted in transit and at rest
- **Access Controls**: Role-based access control implementation
- **Audit Logging**: Comprehensive audit logging for all access
- **Data Minimization**: Only request necessary patient data

#### SMART on FHIR Standards

- **Launch Context**: Proper launch context handling
- **Scopes**: Appropriate scope usage
- **Token Management**: Secure token storage and refresh
- **Error Handling**: Proper error response handling

### 13. Monitoring and Maintenance

#### Health Checks

```typescript
// Check Epic OAuth service health
async function checkEpicHealth() {
  try {
    const response = await fetch('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize');
    return response.ok;
  } catch (error) {
    return false;
  }
}
```

#### Performance Monitoring

- **Response Times**: Monitor API response times
- **Error Rates**: Track authentication error rates
- **Token Refresh**: Monitor token refresh success rates
- **Data Access**: Track FHIR API access patterns

### 14. Troubleshooting

#### Common Issues

1. **Invalid Client ID**: Verify client ID is correct
2. **Invalid Redirect URI**: Check redirect URI configuration
3. **Invalid Scope**: Ensure requested scopes are supported
4. **Token Expired**: Implement proper token refresh
5. **Network Issues**: Check network connectivity and SSL certificates

#### Debug Commands

```bash
# Test OAuth authorization URL
curl -v "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&client_id=your_client_id&redirect_uri=your_redirect_uri&scope=launch/patient patient/*.read openid fhirUser"

# Test token exchange
curl -X POST https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=your_code&redirect_uri=your_redirect_uri&client_id=your_client_id"

# Test FHIR API access
curl -X GET https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient \
  -H "Authorization: Bearer your_access_token"
```

### 15. Future Enhancements

#### Planned Features

1. **Advanced Scopes**: Support for additional Epic scopes
2. **Bulk Data**: Support for Epic's bulk data export
3. **Real-time Updates**: WebSocket support for real-time data
4. **Analytics**: Advanced analytics and reporting
5. **Multi-tenant**: Support for multiple Epic instances

#### Integration Roadmap

1. **Phase 1**: Basic OAuth 2.0 authentication ✅
2. **Phase 2**: FHIR API integration ✅
3. **Phase 3**: Advanced patient data access
4. **Phase 4**: Real-time data synchronization
5. **Phase 5**: Advanced analytics and reporting

---

*This document is maintained by the TETRIX development team and updated regularly to reflect current Epic OAuth 2.0 implementation and best practices.*
