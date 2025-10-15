// TETRIX Epic OAuth 2.0 Configuration
// Configuration for Epic MyChart OAuth 2.0 integration

export interface EpicOAuthEnvironment {
  name: string;
  baseUrl: string;
  audience: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  jwksUri: string;
}

export const EPIC_OAUTH_ENVIRONMENTS: Record<string, EpicOAuthEnvironment> = {
  sandbox: {
    name: 'Epic Sandbox',
    baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth',
    audience: 'https://fhir.epic.com/interconnect-fhir-oauth',
    clientId: process.env.EPIC_SANDBOX_CLIENT_ID || '',
    redirectUri: process.env.EPIC_SANDBOX_REDIRECT_URI || 'https://dev.tetrixcorp.com/auth/epic/callback',
    scope: 'launch/patient patient/*.read openid fhirUser',
    jwksUri: 'https://dev.tetrixcorp.com/.well-known/jwks.json'
  },
  production: {
    name: 'Epic Production',
    baseUrl: 'https://fhir.epic.com',
    audience: 'https://fhir.epic.com',
    clientId: process.env.EPIC_PRODUCTION_CLIENT_ID || '',
    redirectUri: process.env.EPIC_PRODUCTION_REDIRECT_URI || 'https://tetrixcorp.com/auth/epic/callback',
    scope: 'launch/patient patient/*.read openid fhirUser',
    jwksUri: 'https://tetrixcorp.com/.well-known/jwks.json'
  }
};

export const EPIC_OAUTH_SCOPES = {
  // Patient access scopes
  PATIENT_READ: 'patient/*.read',
  PATIENT_WRITE: 'patient/*.write',
  PATIENT_ALL: 'patient/*.*',
  
  // Launch scopes
  LAUNCH_PATIENT: 'launch/patient',
  LAUNCH_ENCOUNTER: 'launch/encounter',
  LAUNCH_OFFLINE: 'offline_access',
  
  // System scopes
  SYSTEM_READ: 'system/*.read',
  SYSTEM_WRITE: 'system/*.write',
  SYSTEM_ALL: 'system/*.*',
  
  // User scopes
  OPENID: 'openid',
  FHIR_USER: 'fhirUser',
  PROFILE: 'profile',
  EMAIL: 'email'
};

export const EPIC_OAUTH_LAUNCH_TYPES = {
  EHR_LAUNCH: 'ehr_launch',
  STANDALONE_LAUNCH: 'standalone_launch',
  BACKEND_SERVICES: 'backend_services'
};

export const EPIC_OAUTH_GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  CLIENT_CREDENTIALS: 'client_credentials',
  REFRESH_TOKEN: 'refresh_token'
};

export const EPIC_OAUTH_RESPONSE_TYPES = {
  CODE: 'code',
  ID_TOKEN: 'id_token',
  TOKEN: 'token'
};

// Default Epic OAuth configuration
export const DEFAULT_EPIC_OAUTH_CONFIG = {
  environment: process.env.EPIC_ENVIRONMENT || 'sandbox',
  launchType: process.env.EPIC_LAUNCH_TYPE || 'ehr_launch',
  grantType: process.env.EPIC_GRANT_TYPE || 'authorization_code',
  responseType: process.env.EPIC_RESPONSE_TYPE || 'code',
  scope: process.env.EPIC_SCOPE || 'launch/patient patient/*.read openid fhirUser',
  state: true, // Always use state parameter for security
  nonce: true, // Always use nonce parameter for security
  pkce: true, // Always use PKCE for security
  maxAge: 3600, // Token max age in seconds
  prompt: 'consent' // Always prompt for consent
};

// Epic FHIR API endpoints
export const EPIC_FHIR_ENDPOINTS = {
  // Patient endpoints
  PATIENT: '/api/FHIR/R4/Patient',
  PATIENT_BY_ID: (id: string) => `/api/FHIR/R4/Patient/${id}`,
  
  // Encounter endpoints
  ENCOUNTER: '/api/FHIR/R4/Encounter',
  ENCOUNTER_BY_ID: (id: string) => `/api/FHIR/R4/Encounter/${id}`,
  ENCOUNTER_BY_PATIENT: (patientId: string) => `/api/FHIR/R4/Encounter?patient=${patientId}`,
  
  // Observation endpoints
  OBSERVATION: '/api/FHIR/R4/Observation',
  OBSERVATION_BY_PATIENT: (patientId: string) => `/api/FHIR/R4/Observation?patient=${patientId}`,
  VITAL_SIGNS: (patientId: string) => `/api/FHIR/R4/Observation?patient=${patientId}&category=vital-signs`,
  LAB_RESULTS: (patientId: string) => `/api/FHIR/R4/Observation?patient=${patientId}&category=laboratory`,
  
  // Medication endpoints
  MEDICATION_REQUEST: '/api/FHIR/R4/MedicationRequest',
  MEDICATION_REQUEST_BY_PATIENT: (patientId: string) => `/api/FHIR/R4/MedicationRequest?patient=${patientId}`,
  
  // Diagnostic endpoints
  DIAGNOSTIC_REPORT: '/api/FHIR/R4/DiagnosticReport',
  DIAGNOSTIC_REPORT_BY_PATIENT: (patientId: string) => `/api/FHIR/R4/DiagnosticReport?patient=${patientId}`,
  
  // Procedure endpoints
  PROCEDURE: '/api/FHIR/R4/Procedure',
  PROCEDURE_BY_PATIENT: (patientId: string) => `/api/FHIR/R4/Procedure?patient=${patientId}`,
  
  // Appointment endpoints
  APPOINTMENT: '/api/FHIR/R4/Appointment',
  APPOINTMENT_BY_PATIENT: (patientId: string) => `/api/FHIR/R4/Appointment?patient=${patientId}`,
  
  // Practitioner endpoints
  PRACTITIONER: '/api/FHIR/R4/Practitioner',
  PRACTITIONER_BY_ID: (id: string) => `/api/FHIR/R4/Practitioner/${id}`,
  
  // Organization endpoints
  ORGANIZATION: '/api/FHIR/R4/Organization',
  ORGANIZATION_BY_ID: (id: string) => `/api/FHIR/R4/Organization/${id}`,
  
  // Location endpoints
  LOCATION: '/api/FHIR/R4/Location',
  LOCATION_BY_ID: (id: string) => `/api/FHIR/R4/Location/${id}`
};

// Epic OAuth error codes
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

// Epic OAuth security requirements
export const EPIC_OAUTH_SECURITY = {
  // Required security features
  REQUIRE_HTTPS: true,
  REQUIRE_STATE: true,
  REQUIRE_NONCE: true,
  REQUIRE_PKCE: true,
  
  // Token security
  TOKEN_MAX_AGE: 3600, // 1 hour
  REFRESH_TOKEN_MAX_AGE: 86400, // 24 hours
  
  // PKCE requirements
  PKCE_CODE_CHALLENGE_METHOD: 'S256',
  PKCE_CODE_VERIFIER_LENGTH: 128,
  
  // State parameter requirements
  STATE_LENGTH: 32,
  STATE_CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  
  // Nonce parameter requirements
  NONCE_LENGTH: 32,
  NONCE_CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
};

// Epic OAuth validation rules
export const EPIC_OAUTH_VALIDATION = {
  // Client ID validation
  CLIENT_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  CLIENT_ID_MIN_LENGTH: 1,
  CLIENT_ID_MAX_LENGTH: 100,
  
  // Redirect URI validation
  REDIRECT_URI_PATTERN: /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/,
  REDIRECT_URI_REQUIRE_HTTPS: true,
  
  // Scope validation
  SCOPE_PATTERN: /^[a-zA-Z0-9._\-\/\*]+$/,
  SCOPE_MAX_LENGTH: 1000,
  
  // State validation
  STATE_PATTERN: /^[a-zA-Z0-9_-]+$/,
  STATE_MIN_LENGTH: 8,
  STATE_MAX_LENGTH: 128,
  
  // Nonce validation
  NONCE_PATTERN: /^[a-zA-Z0-9_-]+$/,
  NONCE_MIN_LENGTH: 8,
  NONCE_MAX_LENGTH: 128
};

export default {
  environments: EPIC_OAUTH_ENVIRONMENTS,
  scopes: EPIC_OAUTH_SCOPES,
  launchTypes: EPIC_OAUTH_LAUNCH_TYPES,
  grantTypes: EPIC_OAUTH_GRANT_TYPES,
  responseTypes: EPIC_OAUTH_RESPONSE_TYPES,
  defaultConfig: DEFAULT_EPIC_OAUTH_CONFIG,
  endpoints: EPIC_FHIR_ENDPOINTS,
  errors: EPIC_OAUTH_ERRORS,
  security: EPIC_OAUTH_SECURITY,
  validation: EPIC_OAUTH_VALIDATION
};
