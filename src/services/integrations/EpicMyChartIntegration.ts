// TETRIX Epic MyChart Integration Service
// SMART on FHIR OAuth 2.0 integration for healthcare providers

export interface EpicConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  fhirBaseUrl: string;
  authUrl: string;
  tokenUrl: string;
  scope: string[];
  audience: string;
}

export interface EpicAuthResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  patientId?: string;
  encounterId?: string;
  launchContext?: any;
}

export interface EpicPatient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  address?: EpicAddress[];
  telecom?: EpicTelecom[];
  identifier?: EpicIdentifier[];
}

export interface EpicAddress {
  use: string;
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EpicTelecom {
  system: string;
  value: string;
  use: string;
}

export interface EpicIdentifier {
  use: string;
  type: EpicIdentifierType;
  system: string;
  value: string;
}

export interface EpicIdentifierType {
  coding: Array<{
    system: string;
    code: string;
    display: string;
  }>;
}

export interface EpicObservation {
  id: string;
  status: string;
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface EpicAppointment {
  id: string;
  status: string;
  serviceType: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  start: string;
  end: string;
  participant: Array<{
    actor: {
      reference: string;
      display: string;
    };
    status: string;
  }>;
}

export interface EpicMedication {
  id: string;
  status: string;
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  dosageInstruction?: Array<{
    text: string;
    timing: {
      repeat: {
        frequency: number;
        period: number;
        periodUnit: string;
      };
    };
    doseAndRate?: Array<{
      doseQuantity: {
        value: number;
        unit: string;
      };
    }>;
  }>;
}

export interface EpicCondition {
  id: string;
  clinicalStatus: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  verificationStatus: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  onsetDateTime?: string;
  recordedDate: string;
}

export interface EpicDiagnosticReport {
  id: string;
  status: string;
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueString?: string;
  conclusion?: string;
  conclusionCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

export interface EpicVitalSigns {
  id: string;
  status: string;
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  component: Array<{
    code: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    valueQuantity: {
      value: number;
      unit: string;
      system: string;
      code: string;
    };
  }>;
}

export class TETRIXEpicMyChartIntegration {
  private config: EpicConfig;
  private accessToken?: string;
  private refreshToken?: string;
  private patientId?: string;
  private encounterId?: string;

  constructor(config: EpicConfig) {
    this.config = config;
  }

  /**
   * Initialize Epic MyChart OAuth flow
   */
  async initiateOAuthFlow(state: string): Promise<string> {
    try {
      const authUrl = new URL(this.config.authUrl);
      authUrl.searchParams.set('client_id', this.config.clientId);
      authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', this.config.scope.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('aud', this.config.audience);
      authUrl.searchParams.set('launch', 'patient'); // For patient context

      console.log('🔗 Initiating Epic MyChart OAuth flow...');
      return authUrl.toString();
    } catch (error) {
      console.error('❌ Failed to initiate Epic OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<EpicAuthResponse> {
    try {
      const tokenRequest = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret || ''
      };

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenRequest)
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.patientId = tokenData.patient;
      this.encounterId = tokenData.encounter;

      console.log('✅ Epic OAuth token exchange successful');
      
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        patientId: tokenData.patient,
        encounterId: tokenData.encounter,
        launchContext: tokenData.launch_context
      };
    } catch (error) {
      console.error('❌ Failed to exchange code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<EpicAuthResponse> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshRequest = {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret || ''
      };

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(refreshRequest)
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      if (tokenData.refresh_token) {
        this.refreshToken = tokenData.refresh_token;
      }

      console.log('✅ Epic access token refreshed');
      
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope
      };
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error);
      throw error;
    }
  }

  /**
   * Get patient information
   */
  async getPatient(patientId?: string): Promise<EpicPatient> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      const response = await this.makeFHIRRequest(`/Patient/${targetPatientId}`);
      const patient = await response.json();

      console.log(`✅ Retrieved patient information for ${targetPatientId}`);
      return patient;
    } catch (error) {
      console.error('❌ Failed to get patient information:', error);
      throw error;
    }
  }

  /**
   * Get patient observations (vital signs, lab results, etc.)
   */
  async getPatientObservations(patientId?: string, category?: string): Promise<EpicObservation[]> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      let url = `/Observation?patient=${targetPatientId}`;
      if (category) {
        url += `&category=${category}`;
      }

      const response = await this.makeFHIRRequest(url);
      const bundle = await response.json();

      console.log(`✅ Retrieved ${bundle.entry?.length || 0} observations for patient ${targetPatientId}`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to get patient observations:', error);
      throw error;
    }
  }

  /**
   * Get patient appointments
   */
  async getPatientAppointments(patientId?: string, startDate?: string, endDate?: string): Promise<EpicAppointment[]> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      let url = `/Appointment?patient=${targetPatientId}`;
      if (startDate) {
        url += `&date=ge${startDate}`;
      }
      if (endDate) {
        url += `&date=le${endDate}`;
      }

      const response = await this.makeFHIRRequest(url);
      const bundle = await response.json();

      console.log(`✅ Retrieved ${bundle.entry?.length || 0} appointments for patient ${targetPatientId}`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to get patient appointments:', error);
      throw error;
    }
  }

  /**
   * Get patient medications
   */
  async getPatientMedications(patientId?: string): Promise<EpicMedication[]> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      const response = await this.makeFHIRRequest(`/MedicationRequest?patient=${targetPatientId}`);
      const bundle = await response.json();

      console.log(`✅ Retrieved ${bundle.entry?.length || 0} medications for patient ${targetPatientId}`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to get patient medications:', error);
      throw error;
    }
  }

  /**
   * Get patient conditions (diagnoses)
   */
  async getPatientConditions(patientId?: string): Promise<EpicCondition[]> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      const response = await this.makeFHIRRequest(`/Condition?patient=${targetPatientId}`);
      const bundle = await response.json();

      console.log(`✅ Retrieved ${bundle.entry?.length || 0} conditions for patient ${targetPatientId}`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to get patient conditions:', error);
      throw error;
    }
  }

  /**
   * Get patient diagnostic reports
   */
  async getPatientDiagnosticReports(patientId?: string, category?: string): Promise<EpicDiagnosticReport[]> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      let url = `/DiagnosticReport?patient=${targetPatientId}`;
      if (category) {
        url += `&category=${category}`;
      }

      const response = await this.makeFHIRRequest(url);
      const bundle = await response.json();

      console.log(`✅ Retrieved ${bundle.entry?.length || 0} diagnostic reports for patient ${targetPatientId}`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to get patient diagnostic reports:', error);
      throw error;
    }
  }

  /**
   * Get patient vital signs
   */
  async getPatientVitalSigns(patientId?: string): Promise<EpicVitalSigns[]> {
    try {
      const targetPatientId = patientId || this.patientId;
      if (!targetPatientId) {
        throw new Error('No patient ID available');
      }

      const response = await this.makeFHIRRequest(`/Observation?patient=${targetPatientId}&category=vital-signs`);
      const bundle = await response.json();

      console.log(`✅ Retrieved ${bundle.entry?.length || 0} vital signs for patient ${targetPatientId}`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to get patient vital signs:', error);
      throw error;
    }
  }

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData: Partial<EpicAppointment>): Promise<EpicAppointment> {
    try {
      const response = await this.makeFHIRRequest('/Appointment', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });

      const appointment = await response.json();
      console.log('✅ Created new appointment');
      return appointment;
    } catch (error) {
      console.error('❌ Failed to create appointment:', error);
      throw error;
    }
  }

  /**
   * Update existing appointment
   */
  async updateAppointment(appointmentId: string, appointmentData: Partial<EpicAppointment>): Promise<EpicAppointment> {
    try {
      const response = await this.makeFHIRRequest(`/Appointment/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });

      const appointment = await response.json();
      console.log(`✅ Updated appointment ${appointmentId}`);
      return appointment;
    } catch (error) {
      console.error('❌ Failed to update appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<EpicAppointment> {
    try {
      const appointmentData = {
        id: appointmentId,
        status: 'cancelled',
        cancellationReason: reason ? {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/appointment-cancellation-reason',
            code: 'patient-request',
            display: reason
          }]
        } : undefined
      };

      const response = await this.makeFHIRRequest(`/Appointment/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });

      const appointment = await response.json();
      console.log(`✅ Cancelled appointment ${appointmentId}`);
      return appointment;
    } catch (error) {
      console.error('❌ Failed to cancel appointment:', error);
      throw error;
    }
  }

  /**
   * Search for patients by name or identifier
   */
  async searchPatients(name?: string, identifier?: string): Promise<EpicPatient[]> {
    try {
      let url = '/Patient';
      const params = new URLSearchParams();
      
      if (name) {
        params.append('name', name);
      }
      if (identifier) {
        params.append('identifier', identifier);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await this.makeFHIRRequest(url);
      const bundle = await response.json();

      console.log(`✅ Found ${bundle.entry?.length || 0} patients`);
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('❌ Failed to search patients:', error);
      throw error;
    }
  }

  /**
   * Get Epic SMART configuration
   */
  async getSMARTConfiguration(): Promise<any> {
    try {
      const response = await fetch(`${this.config.fhirBaseUrl}/.well-known/smart-configuration`);
      const config = await response.json();
      
      console.log('✅ Retrieved Epic SMART configuration');
      return config;
    } catch (error) {
      console.error('❌ Failed to get SMART configuration:', error);
      throw error;
    }
  }

  /**
   * Validate access token
   */
  async validateToken(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        return false;
      }

      const response = await this.makeFHIRRequest('/Patient');
      return response.ok;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  }

  /**
   * Make authenticated FHIR API request
   */
  private async makeFHIRRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.config.fhirBaseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          return this.makeFHIRRequest(endpoint, options);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          throw new Error('Authentication failed');
        }
      }
      throw new Error(`FHIR API request failed: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  /**
   * Get current patient ID
   */
  getPatientId(): string | undefined {
    return this.patientId;
  }

  /**
   * Get current encounter ID
   */
  getEncounterId(): string | undefined {
    return this.encounterId;
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.patientId = undefined;
    this.encounterId = undefined;
  }
}

/**
 * Epic MyChart Integration Factory
 */
export class EpicMyChartIntegrationFactory {
  /**
   * Create Epic MyChart integration for healthcare organization
   */
  static createHealthcareIntegration(orgId: string, settings: any): TETRIXEpicMyChartIntegration {
    const config: EpicConfig = {
      clientId: settings.clientId,
      clientSecret: settings.clientSecret,
      redirectUri: settings.redirectUri,
      fhirBaseUrl: settings.fhirBaseUrl,
      authUrl: settings.authUrl,
      tokenUrl: settings.tokenUrl,
      scope: [
        'openid',
        'profile',
        'user/*.*',
        'patient/*.read',
        'patient/*.write',
        'launch/patient'
      ],
      audience: settings.audience
    };

    return new TETRIXEpicMyChartIntegration(config);
  }

  /**
   * Create Epic MyChart integration for Epic sandbox
   */
  static createSandboxIntegration(): TETRIXEpicMyChartIntegration {
    const config: EpicConfig = {
      clientId: 'your-sandbox-client-id',
      redirectUri: 'https://your-app.com/auth/epic/callback',
      fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
      authUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      scope: [
        'openid',
        'profile',
        'user/*.*',
        'patient/*.read',
        'patient/*.write',
        'launch/patient'
      ],
      audience: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
    };

    return new TETRIXEpicMyChartIntegration(config);
  }
}
