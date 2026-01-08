// EHR Documentation Service
// Real-time documentation of voice interactions into structured EHR notes
// Supports FHIR and HL7 standards for Epic, Cerner, Allscripts, etc.

import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { backendIntegrationService } from '../ivr/integrations/backendIntegrations';

export interface EHRNote {
  patientId: string;
  encounterId?: string;
  noteType: 'intake' | 'triage' | 'follow_up' | 'medication_review' | 'chronic_care' | 'general';
  structuredData: {
    chiefComplaint?: string;
    vitalSigns?: Record<string, any>;
    medications?: string[];
    allergies?: string[];
    assessment?: string;
    plan?: string;
    symptoms?: string[];
    triageSeverity?: 'low' | 'medium' | 'high' | 'urgent';
    redFlags?: string[];
  };
  transcription?: string;
  timestamp: Date;
  providerId?: string;
  department?: string;
}

export interface FHIRComposition {
  resourceType: 'Composition';
  id?: string;
  status: 'preliminary' | 'final' | 'amended' | 'entered-in-error';
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string; // Patient/patientId
  };
  encounter?: {
    reference: string; // Encounter/encounterId
  };
  author: Array<{
    reference: string; // Practitioner/providerId or Device/systemId
  }>;
  date: string; // ISO 8601
  title: string;
  section: Array<{
    title: string;
    code?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    text: {
      status: 'generated' | 'extensions' | 'additional' | 'empty';
      div: string; // HTML formatted text
    };
  }>;
}

export interface EHRIntegrationConfig {
  ehrSystem: 'epic' | 'cerner' | 'allscripts' | 'athenahealth' | 'generic';
  endpoint: string;
  apiKey?: string;
  fhirBaseUrl?: string;
  hl7Endpoint?: string;
  authentication: {
    type: 'oauth2' | 'api_key' | 'basic';
    credentials: Record<string, string>;
  };
}

class EHRDocumentationService {
  private ehrConfigs: Map<string, EHRIntegrationConfig> = new Map();
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeEHRConfigs();
  }

  /**
   * Initialize EHR configurations from environment
   */
  private initializeEHRConfigs() {
    // Epic MyChart API
    if (process.env.EPIC_FHIR_BASE_URL) {
      this.ehrConfigs.set('epic', {
        ehrSystem: 'epic',
        endpoint: process.env.EPIC_API_ENDPOINT || '',
        fhirBaseUrl: process.env.EPIC_FHIR_BASE_URL,
        authentication: {
          type: 'oauth2',
          credentials: {
            clientId: process.env.EPIC_CLIENT_ID || '',
            clientSecret: process.env.EPIC_CLIENT_SECRET || '',
            tokenUrl: process.env.EPIC_TOKEN_URL || ''
          }
        }
      });
    }

    // Cerner FHIR API
    if (process.env.CERNER_FHIR_BASE_URL) {
      this.ehrConfigs.set('cerner', {
        ehrSystem: 'cerner',
        endpoint: process.env.CERNER_API_ENDPOINT || '',
        fhirBaseUrl: process.env.CERNER_FHIR_BASE_URL,
        authentication: {
          type: 'oauth2',
          credentials: {
            clientId: process.env.CERNER_CLIENT_ID || '',
            clientSecret: process.env.CERNER_CLIENT_SECRET || '',
            tokenUrl: process.env.CERNER_TOKEN_URL || ''
          }
        }
      });
    }

    // Generic FHIR endpoint
    if (process.env.FHIR_BASE_URL) {
      this.ehrConfigs.set('generic', {
        ehrSystem: 'generic',
        endpoint: process.env.EHR_API_ENDPOINT || '',
        fhirBaseUrl: process.env.FHIR_BASE_URL,
        authentication: {
          type: 'api_key',
          credentials: {
            apiKey: process.env.EHR_API_KEY || ''
          }
        }
      });
    }
  }

  /**
   * Document conversation to EHR in real-time
   */
  async documentToEHR(
    tenantId: string,
    note: EHRNote,
    ehrSystem?: string
  ): Promise<{
    success: boolean;
    noteId: string;
    ehrEncounterId?: string;
    fhirResourceId?: string;
  }> {
    try {
      // Determine EHR system (tenant-specific or default)
      const systemKey = ehrSystem || this.getDefaultEHRSystem(tenantId);
      const config = this.ehrConfigs.get(systemKey);

      if (!config) {
        throw new Error(`EHR system not configured: ${systemKey}`);
      }

      // Convert to FHIR Composition
      const fhirComposition = this.convertToFHIRComposition(note, config);

      // Authenticate and submit to EHR
      const accessToken = await this.authenticate(config);
      const result = await this.submitFHIRComposition(config, fhirComposition, accessToken);

      // Log audit event
      await auditEvidenceService.logEvent({
        tenantId,
        callId: note.encounterId || 'unknown',
        eventType: 'data.access',
        eventData: {
          action: 'ehr_documentation',
          patientId: note.patientId,
          noteType: note.noteType,
          ehrSystem: config.ehrSystem,
          fhirResourceId: result.id,
          timestamp: note.timestamp
        },
        metadata: {
          service: 'ehr_documentation',
          ehrSystem: config.ehrSystem
        }
      });

      return {
        success: true,
        noteId: result.id || `NOTE-${Date.now()}`,
        ehrEncounterId: note.encounterId,
        fhirResourceId: result.id
      };
    } catch (error) {
      console.error('EHR documentation error:', error);
      
      // Log error for audit
      await auditEvidenceService.logEvent({
        tenantId,
        callId: note.encounterId || 'unknown',
        eventType: 'error.occurred',
        eventData: {
          error: 'ehr_documentation_failed',
          patientId: note.patientId,
          noteType: note.noteType,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          service: 'ehr_documentation'
        }
      });

      throw error;
    }
  }

  /**
   * Convert EHR note to FHIR Composition
   */
  private convertToFHIRComposition(
    note: EHRNote,
    config: EHRIntegrationConfig
  ): FHIRComposition {
    const sections: FHIRComposition['section'] = [];

    // Chief Complaint section
    if (note.structuredData.chiefComplaint) {
      sections.push({
        title: 'Chief Complaint',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '10154-3',
            display: 'Chief complaint'
          }]
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${this.escapeHtml(note.structuredData.chiefComplaint)}</div>`
        }
      });
    }

    // Vital Signs section
    if (note.structuredData.vitalSigns && Object.keys(note.structuredData.vitalSigns).length > 0) {
      const vitalSignsHtml = Object.entries(note.structuredData.vitalSigns)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('');
      
      sections.push({
        title: 'Vital Signs',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8716-3',
            display: 'Vital signs'
          }]
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${vitalSignsHtml}</div>`
        }
      });
    }

    // Medications section
    if (note.structuredData.medications && note.structuredData.medications.length > 0) {
      const medicationsHtml = note.structuredData.medications
        .map(med => `<p>${this.escapeHtml(med)}</p>`)
        .join('');
      
      sections.push({
        title: 'Current Medications',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '10160-0',
            display: 'History of medication use'
          }]
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${medicationsHtml}</div>`
        }
      });
    }

    // Assessment and Plan section
    if (note.structuredData.assessment || note.structuredData.plan) {
      let assessmentPlanHtml = '';
      if (note.structuredData.assessment) {
        assessmentPlanHtml += `<p><strong>Assessment:</strong> ${this.escapeHtml(note.structuredData.assessment)}</p>`;
      }
      if (note.structuredData.plan) {
        assessmentPlanHtml += `<p><strong>Plan:</strong> ${this.escapeHtml(note.structuredData.plan)}</p>`;
      }

      sections.push({
        title: 'Assessment and Plan',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '51848-0',
            display: 'Assessment and plan'
          }]
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${assessmentPlanHtml}</div>`
        }
      });
    }

    // Full transcription section (if available)
    if (note.transcription) {
      sections.push({
        title: 'Full Transcript',
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${this.escapeHtml(note.transcription)}</p></div>`
        }
      });
    }

    // Determine note type code
    const noteTypeCode = this.getNoteTypeCode(note.noteType);

    return {
      resourceType: 'Composition',
      status: 'preliminary',
      type: {
        coding: [{
          system: 'http://loinc.org',
          code: noteTypeCode.code,
          display: noteTypeCode.display
        }]
      },
      subject: {
        reference: `Patient/${note.patientId}`
      },
      encounter: note.encounterId ? {
        reference: `Encounter/${note.encounterId}`
      } : undefined,
      author: [{
        reference: note.providerId ? `Practitioner/${note.providerId}` : 'Device/voice-ai-system'
      }],
      date: note.timestamp.toISOString(),
      title: `${note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)} Note - Voice AI`,
      section: sections
    };
  }

  /**
   * Get LOINC code for note type
   */
  private getNoteTypeCode(noteType: EHRNote['noteType']): { code: string; display: string } {
    const codes: Record<string, { code: string; display: string }> = {
      intake: { code: '51855-5', display: 'Patient intake note' },
      triage: { code: '51847-2', display: 'Triage note' },
      follow_up: { code: '11506-3', display: 'Progress note' },
      medication_review: { code: '10160-0', display: 'Medication review' },
      chronic_care: { code: '51848-0', display: 'Chronic care management note' },
      general: { code: '11506-3', display: 'Clinical note' }
    };

    return codes[noteType] || codes.general;
  }

  /**
   * Authenticate with EHR system
   */
  private async authenticate(config: EHRIntegrationConfig): Promise<string> {
    if (config.authentication.type === 'api_key') {
      return config.authentication.credentials.apiKey || '';
    }

    if (config.authentication.type === 'oauth2') {
      // OAuth2 token acquisition
      const tokenUrl = config.authentication.credentials.tokenUrl;
      const clientId = config.authentication.credentials.clientId;
      const clientSecret = config.authentication.credentials.clientSecret;

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'system/Composition.write system/Patient.read'
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth2 authentication failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    }

    throw new Error(`Unsupported authentication type: ${config.authentication.type}`);
  }

  /**
   * Submit FHIR Composition to EHR
   */
  private async submitFHIRComposition(
    config: EHRIntegrationConfig,
    composition: FHIRComposition,
    accessToken: string
  ): Promise<{ id: string }> {
    const fhirUrl = `${config.fhirBaseUrl}/Composition`;

    const response = await fetch(fhirUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(composition)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FHIR submission failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { id: result.id };
  }

  /**
   * Get default EHR system for tenant
   */
  private getDefaultEHRSystem(tenantId: string): string {
    // In production, this would query tenant configuration
    // For now, return first available system or 'generic'
    return this.ehrConfigs.keys().next().value || 'generic';
  }

  /**
   * Escape HTML for FHIR text.div
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Create structured note from conversation data
   */
  createStructuredNote(
    patientId: string,
    noteType: EHRNote['noteType'],
    conversationData: {
      transcription?: string;
      chiefComplaint?: string;
      vitalSigns?: Record<string, any>;
      medications?: string[];
      allergies?: string[];
      symptoms?: string[];
      assessment?: string;
      plan?: string;
      triageSeverity?: 'low' | 'medium' | 'high' | 'urgent';
      redFlags?: string[];
    },
    encounterId?: string,
    providerId?: string
  ): EHRNote {
    return {
      patientId,
      encounterId,
      noteType,
      structuredData: {
        chiefComplaint: conversationData.chiefComplaint,
        vitalSigns: conversationData.vitalSigns,
        medications: conversationData.medications,
        allergies: conversationData.allergies,
        assessment: conversationData.assessment,
        plan: conversationData.plan,
        symptoms: conversationData.symptoms,
        triageSeverity: conversationData.triageSeverity,
        redFlags: conversationData.redFlags
      },
      transcription: conversationData.transcription,
      timestamp: new Date(),
      providerId,
      department: undefined
    };
  }
}

export const ehrDocumentationService = new EHRDocumentationService();
