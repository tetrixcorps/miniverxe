// TETRIX Epic OAuth 2.0 Service
// Implements Epic's SMART on FHIR OAuth 2.0 authentication
// Based on Epic's official OAuth 2.0 documentation

export interface EpicOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

export interface EpicTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  patient?: string;
  encounter?: string;
  refresh_token?: string;
}

export interface EpicPatientData {
  id: string;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  birthDate: string;
  gender: string;
  address?: Array<{
    use: string;
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  telecom?: Array<{
    system: string;
    value: string;
    use: string;
  }>;
}

export interface EpicEncounterData {
  id: string;
  status: string;
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  period: {
    start: string;
    end?: string;
  };
  location?: Array<{
    location: {
      reference: string;
      display: string;
    };
  }>;
}

/**
 * Epic OAuth 2.0 Service for SMART on FHIR authentication
 */
export class EpicOAuthService {
  private config: EpicOAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: EpicOAuthConfig) {
    this.config = config;
    console.log(`EpicOAuthService initialized for ${config.environment} environment`);
  }

  /**
   * Generate authorization URL for Epic OAuth 2.0
   */
  generateAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state: state || this.generateState(),
      aud: this.getAudienceUrl()
    });

    const authUrl = `${this.getBaseUrl()}/oauth2/authorize?${params.toString()}`;
    console.log(`Generated Epic authorization URL: ${authUrl}`);
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<EpicTokenResponse> {
    try {
      const tokenUrl = `${this.getBaseUrl()}/oauth2/token`;
      
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: EpicTokenResponse = await response.json();
      
      // Store tokens
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token || null;
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000));

      console.log('✅ Epic OAuth token exchange successful');
      return tokenData;
    } catch (error) {
      console.error('❌ Epic OAuth token exchange failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<EpicTokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const tokenUrl = `${this.getBaseUrl()}/oauth2/token`;
      
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.config.clientId
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: EpicTokenResponse = await response.json();
      
      // Update stored tokens
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token || this.refreshToken;
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000));

      console.log('✅ Epic OAuth token refreshed successfully');
      return tokenData;
    } catch (error) {
      console.error('❌ Epic OAuth token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get patient data from Epic FHIR API
   */
  async getPatientData(patientId?: string): Promise<EpicPatientData> {
    await this.ensureValidToken();

    try {
      const patientUrl = patientId 
        ? `${this.getBaseUrl()}/api/FHIR/R4/Patient/${patientId}`
        : `${this.getBaseUrl()}/api/FHIR/R4/Patient`;

      const response = await fetch(patientUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Patient data request failed: ${response.status} ${response.statusText}`);
      }

      const patientData = await response.json();
      console.log('✅ Epic patient data retrieved successfully');
      return patientData;
    } catch (error) {
      console.error('❌ Failed to retrieve Epic patient data:', error);
      throw error;
    }
  }

  /**
   * Get encounter data from Epic FHIR API
   */
  async getEncounterData(patientId?: string): Promise<EpicEncounterData[]> {
    await this.ensureValidToken();

    try {
      let encounterUrl = `${this.getBaseUrl()}/api/FHIR/R4/Encounter`;
      
      if (patientId) {
        encounterUrl += `?patient=${patientId}`;
      }

      const response = await fetch(encounterUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Encounter data request failed: ${response.status} ${response.statusText}`);
      }

      const encounterData = await response.json();
      console.log('✅ Epic encounter data retrieved successfully');
      return encounterData.entry || [];
    } catch (error) {
      console.error('❌ Failed to retrieve Epic encounter data:', error);
      throw error;
    }
  }

  /**
   * Get observation data (vital signs, lab results) from Epic FHIR API
   */
  async getObservationData(patientId: string, category?: string): Promise<any[]> {
    await this.ensureValidToken();

    try {
      let observationUrl = `${this.getBaseUrl()}/api/FHIR/R4/Observation?patient=${patientId}`;
      
      if (category) {
        observationUrl += `&category=${category}`;
      }

      const response = await fetch(observationUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Observation data request failed: ${response.status} ${response.statusText}`);
      }

      const observationData = await response.json();
      console.log('✅ Epic observation data retrieved successfully');
      return observationData.entry || [];
    } catch (error) {
      console.error('❌ Failed to retrieve Epic observation data:', error);
      throw error;
    }
  }

  /**
   * Get medication data from Epic FHIR API
   */
  async getMedicationData(patientId: string): Promise<any[]> {
    await this.ensureValidToken();

    try {
      const medicationUrl = `${this.getBaseUrl()}/api/FHIR/R4/MedicationRequest?patient=${patientId}`;

      const response = await fetch(medicationUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Medication data request failed: ${response.status} ${response.statusText}`);
      }

      const medicationData = await response.json();
      console.log('✅ Epic medication data retrieved successfully');
      return medicationData.entry || [];
    } catch (error) {
      console.error('❌ Failed to retrieve Epic medication data:', error);
      throw error;
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        throw new Error('Access token expired and no refresh token available');
      }
    }
  }

  /**
   * Get base URL for Epic environment
   */
  private getBaseUrl(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }

    return this.config.environment === 'production' 
      ? 'https://fhir.epic.com'
      : 'https://fhir.epic.com/interconnect-fhir-oauth';
  }

  /**
   * Get audience URL for Epic environment
   */
  private getAudienceUrl(): string {
    return this.config.environment === 'production'
      ? 'https://fhir.epic.com'
      : 'https://fhir.epic.com/interconnect-fhir-oauth';
  }

  /**
   * Generate random state parameter for OAuth security
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    console.log('✅ Epic OAuth logout completed');
  }

  /**
   * Get token expiry information
   */
  getTokenInfo(): {
    isAuthenticated: boolean;
    expiresAt: Date | null;
    isExpired: boolean;
    timeUntilExpiry: number | null;
  } {
    const isAuthenticated = this.isAuthenticated();
    const expiresAt = this.tokenExpiry;
    const isExpired = expiresAt ? new Date() >= expiresAt : true;
    const timeUntilExpiry = expiresAt ? Math.max(0, expiresAt.getTime() - Date.now()) : null;

    return {
      isAuthenticated,
      expiresAt,
      isExpired,
      timeUntilExpiry
    };
  }
}

/**
 * Create Epic OAuth service instance
 */
export function createEpicOAuthService(config: EpicOAuthConfig): EpicOAuthService {
  return new EpicOAuthService(config);
}

/**
 * Default Epic OAuth configuration
 */
export const DEFAULT_EPIC_CONFIG: EpicOAuthConfig = {
  clientId: process.env.EPIC_CLIENT_ID || '',
  redirectUri: process.env.EPIC_REDIRECT_URI || 'https://tetrixcorp.com/auth/epic/callback',
  scope: 'launch/patient patient/*.read openid fhirUser',
  baseUrl: process.env.EPIC_BASE_URL || '',
  environment: (process.env.EPIC_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
};
