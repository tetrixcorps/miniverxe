// Core IVR Service
// Provides foundational IVR capabilities with TeXML generation and call routing

import type { APIRoute } from 'astro';

export interface IVRConfig {
  industry: string;
  language: string;
  enableSpeechRecognition: boolean;
  enableDTMF: boolean;
  timeout: number;
  maxRetries: number;
  webhookUrl: string;
}

export interface IVRCallFlow {
  id: string;
  name: string;
  industry: string;
  steps: IVRStep[];
  defaultAction?: string;
}

export interface IVRStep {
  id: string;
  type: 'say' | 'gather' | 'dial' | 'record' | 'redirect' | 'hangup' | 'conference';
  message?: string;
  options?: IVROption[];
  timeout?: number;
  maxDigits?: number;
  action?: string;
  nextStep?: string;
  metadata?: Record<string, any>;
}

export interface IVROption {
  digit: string;
  label: string;
  action: string;
  nextStep?: string;
}

export interface IVRCallSession {
  sessionId: string;
  callControlId: string;
  from: string;
  to: string;
  industry: string;
  currentStep: string;
  flowId: string;
  collectedData: Record<string, any>;
  startTime: Date;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'transferred';
  metadata: Record<string, any>;
}

class IVRService {
  private activeSessions: Map<string, IVRCallSession> = new Map();
  private callFlows: Map<string, IVRCallFlow> = new Map();
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeDefaultFlows();
  }

  /**
   * Initialize default IVR flows for each industry
   */
  private initializeDefaultFlows() {
    // Healthcare flow
    this.callFlows.set('healthcare_main', {
      id: 'healthcare_main',
      name: 'Healthcare Main Menu',
      industry: 'healthcare',
      steps: [
        {
          id: 'greeting',
          type: 'say',
          message: 'Welcome to TETRIX Healthcare Services. This call may be recorded for quality and compliance purposes.'
        },
        {
          id: 'main_menu',
          type: 'gather',
          message: 'Please select from the following options. Press 1 for appointment scheduling. Press 2 for prescription refills. Press 3 for lab results. Press 4 for billing inquiries. Press 0 to speak with a representative.',
          options: [
            { digit: '1', label: 'Appointment Scheduling', action: 'route', nextStep: 'appointment_menu' },
            { digit: '2', label: 'Prescription Refills', action: 'route', nextStep: 'prescription_menu' },
            { digit: '3', label: 'Lab Results', action: 'route', nextStep: 'lab_results' },
            { digit: '4', label: 'Billing Inquiries', action: 'route', nextStep: 'billing_menu' },
            { digit: '0', label: 'Representative', action: 'transfer', nextStep: 'transfer_agent' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Insurance flow
    this.callFlows.set('insurance_main', {
      id: 'insurance_main',
      name: 'Insurance Main Menu',
      industry: 'insurance',
      steps: [
        {
          id: 'greeting',
          type: 'say',
          message: 'Welcome to TETRIX Insurance Services. Your call may be recorded for quality assurance.'
        },
        {
          id: 'main_menu',
          type: 'gather',
          message: 'Please select from the following options. Press 1 to report a claim. Press 2 to check claim status. Press 3 for policy information. Press 4 to make a payment. Press 0 for a representative.',
          options: [
            { digit: '1', label: 'Report Claim', action: 'route', nextStep: 'fnol_menu' },
            { digit: '2', label: 'Claim Status', action: 'route', nextStep: 'claim_status' },
            { digit: '3', label: 'Policy Info', action: 'route', nextStep: 'policy_info' },
            { digit: '4', label: 'Make Payment', action: 'route', nextStep: 'payment_menu' },
            { digit: '0', label: 'Representative', action: 'transfer', nextStep: 'transfer_agent' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Retail/E-commerce flow
    this.callFlows.set('retail_main', {
      id: 'retail_main',
      name: 'Retail Main Menu',
      industry: 'retail',
      steps: [
        {
          id: 'greeting',
          type: 'say',
          message: 'Thank you for calling TETRIX Retail Services. How can we help you today?'
        },
        {
          id: 'main_menu',
          type: 'gather',
          message: 'Press 1 to check your order status. Press 2 for returns and exchanges. Press 3 for product information. Press 4 for store hours and locations. Press 0 for customer service.',
          options: [
            { digit: '1', label: 'Order Status', action: 'route', nextStep: 'order_status' },
            { digit: '2', label: 'Returns', action: 'route', nextStep: 'returns_menu' },
            { digit: '3', label: 'Product Info', action: 'route', nextStep: 'product_info' },
            { digit: '4', label: 'Store Info', action: 'route', nextStep: 'store_info' },
            { digit: '0', label: 'Customer Service', action: 'transfer', nextStep: 'transfer_agent' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Construction flow
    this.callFlows.set('construction_main', {
      id: 'construction_main',
      name: 'Construction Main Menu',
      industry: 'construction',
      steps: [
        {
          id: 'greeting',
          type: 'say',
          message: 'Welcome to TETRIX Construction Services. Your call is important to us.'
        },
        {
          id: 'main_menu',
          type: 'gather',
          message: 'Press 1 for project inquiries. Press 2 for vendor coordination. Press 3 for permit status. Press 4 for warranty claims. Press 0 for immediate assistance.',
          options: [
            { digit: '1', label: 'Project Inquiries', action: 'route', nextStep: 'project_inquiry' },
            { digit: '2', label: 'Vendor Coordination', action: 'route', nextStep: 'vendor_coordination' },
            { digit: '3', label: 'Permit Status', action: 'route', nextStep: 'permit_status' },
            { digit: '4', label: 'Warranty Claims', action: 'route', nextStep: 'warranty_claims' },
            { digit: '0', label: 'Immediate Assistance', action: 'transfer', nextStep: 'transfer_agent' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Real Estate flow
    this.callFlows.set('real_estate_main', {
      id: 'real_estate_main',
      name: 'Real Estate Main Menu',
      industry: 'real_estate',
      steps: [
        {
          id: 'greeting',
          type: 'say',
          message: 'Welcome to TETRIX Real Estate Services. How can we assist you today?'
        },
        {
          id: 'main_menu',
          type: 'gather',
          message: 'Press 1 for property inquiries. Press 2 to schedule a virtual tour. Press 3 for contract follow-ups. Press 4 for financing information. Press 0 to speak with an agent.',
          options: [
            { digit: '1', label: 'Property Inquiries', action: 'route', nextStep: 'property_inquiry' },
            { digit: '2', label: 'Virtual Tour', action: 'route', nextStep: 'virtual_tour' },
            { digit: '3', label: 'Contract Follow-up', action: 'route', nextStep: 'contract_followup' },
            { digit: '4', label: 'Financing Info', action: 'route', nextStep: 'financing_info' },
            { digit: '0', label: 'Speak with Agent', action: 'transfer', nextStep: 'transfer_agent' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });
  }

  /**
   * Create a new IVR call session
   */
  createSession(config: IVRConfig, callControlId: string, from: string, to: string): IVRCallSession {
    const sessionId = this.generateSessionId();
    const flowId = `${config.industry}_main`;

    const session: IVRCallSession = {
      sessionId,
      callControlId,
      from,
      to,
      industry: config.industry,
      currentStep: 'greeting',
      flowId,
      collectedData: {},
      startTime: new Date(),
      status: 'initiated',
      metadata: {
        language: config.language,
        enableSpeechRecognition: config.enableSpeechRecognition,
        enableDTMF: config.enableDTMF
      }
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Get current step TeXML for a session
   */
  getCurrentStepTeXML(sessionId: string): string {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const flow = this.callFlows.get(session.flowId);
    if (!flow) {
      throw new Error(`Flow ${session.flowId} not found`);
    }

    const step = flow.steps.find(s => s.id === session.currentStep);
    if (!step) {
      throw new Error(`Step ${session.currentStep} not found in flow ${session.flowId}`);
    }

    return this.generateStepTeXML(step, session);
  }

  /**
   * Process DTMF input and advance to next step
   */
  processDTMF(sessionId: string, digits: string): { texml: string; nextStep?: string } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const flow = this.callFlows.get(session.flowId);
    if (!flow) {
      throw new Error(`Flow ${session.flowId} not found`);
    }

    const currentStep = flow.steps.find(s => s.id === session.currentStep);
    if (!currentStep || currentStep.type !== 'gather') {
      throw new Error(`Current step ${session.currentStep} is not a gather step`);
    }

    // Find matching option
    const option = currentStep.options?.find(opt => opt.digit === digits);
    if (!option) {
      // Invalid selection, replay menu
      return { texml: this.generateStepTeXML(currentStep, session) };
    }

    // Store collected data
    session.collectedData[currentStep.id] = digits;

    // Determine next step
    if (option.nextStep) {
      session.currentStep = option.nextStep;
      const nextStep = flow.steps.find(s => s.id === option.nextStep);
      if (nextStep) {
        return {
          texml: this.generateStepTeXML(nextStep, session),
          nextStep: option.nextStep
        };
      }
    }

    // Handle transfer action
    if (option.action === 'transfer') {
      return this.handleTransfer(session, option);
    }

    return { texml: this.generateStepTeXML(currentStep, session) };
  }

  /**
   * Generate TeXML for a step
   */
  private generateStepTeXML(step: IVRStep, session: IVRCallSession): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

    switch (step.type) {
      case 'say':
        xml += this.generateSayTeXML(step.message || '', session.metadata.language as string);
        if (step.nextStep) {
          xml += this.generateRedirectTeXML(session.sessionId, step.nextStep);
        } else {
          xml += '  <Hangup/>\n';
        }
        break;

      case 'gather':
        xml += this.generateSayTeXML(step.message || '', session.metadata.language as string);
        xml += this.generateGatherTeXML(session.sessionId, step, session);
        xml += '  <Say voice="alice">We didn\'t receive any input. Please try again.</Say>\n';
        xml += '  <Hangup/>\n';
        break;

      case 'dial':
        xml += this.generateDialTeXML(step, session);
        break;

      case 'record':
        xml += this.generateRecordTeXML(step, session);
        break;

      case 'hangup':
        xml += '  <Hangup/>\n';
        break;

      default:
        xml += '  <Say voice="alice">Invalid step type.</Say>\n';
        xml += '  <Hangup/>\n';
    }

    xml += '</Response>';
    return xml;
  }

  /**
   * Generate Say TeXML
   */
  private generateSayTeXML(message: string, language: string = 'en-US'): string {
    return `  <Say voice="alice" language="${language}">${this.escapeXML(message)}</Say>\n`;
  }

  /**
   * Generate Gather TeXML
   */
  private generateGatherTeXML(sessionId: string, step: IVRStep, session: IVRCallSession): string {
    const actionUrl = `${this.webhookBaseUrl}/api/ivr/${sessionId}/gather`;
    const timeout = step.timeout || 10;
    const maxDigits = step.maxDigits || 1;
    const enableSpeech = step.metadata?.speechRecognition || session.metadata?.enableSpeechRecognition;

    // If speech recognition is enabled, use both speech and DTMF
    if (enableSpeech) {
      const language = session.metadata.language as string || 'en-US';
      return `  <Gather 
    action="${actionUrl}" 
    method="POST" 
    input="speech dtmf" 
    speechTimeout="auto"
    speechModel="default"
    language="${language}"
    timeout="${timeout}" 
    numDigits="${maxDigits}">
    <Say voice="alice">Please speak or press a number.</Say>
  </Gather>\n`;
    }

    // Standard DTMF-only gather
    return `  <Gather action="${actionUrl}" method="POST" timeout="${timeout}" numDigits="${maxDigits}">\n` +
           `    <Say voice="alice">Please make your selection.</Say>\n` +
           `  </Gather>\n`;
  }

  /**
   * Generate Dial TeXML
   */
  private generateDialTeXML(step: IVRStep, session: IVRCallSession): string {
    const number = step.metadata?.phoneNumber || step.metadata?.sipUri;
    if (!number) {
      return '  <Say voice="alice">Unable to connect. Please try again later.</Say>\n  <Hangup/>\n';
    }

    return `  <Say voice="alice">Please hold while we connect you.</Say>\n` +
           `  <Dial timeout="30" record="record-from-answer">\n` +
           `    <Number>${number}</Number>\n` +
           `  </Dial>\n` +
           `  <Say voice="alice">Thank you for calling. Goodbye.</Say>\n` +
           `  <Hangup/>\n`;
  }

  /**
   * Generate Record TeXML
   */
  private generateRecordTeXML(step: IVRStep, session: IVRCallSession): string {
    const actionUrl = `${this.webhookBaseUrl}/api/ivr/${session.sessionId}/recording`;
    const timeout = step.timeout || 30;
    const maxLength = step.metadata?.maxLength || 300;

    return `  <Say voice="alice">${step.message || 'Please leave your message after the beep.'}</Say>\n` +
           `  <Record action="${actionUrl}" method="POST" timeout="${timeout}" maxLength="${maxLength}" playBeep="true" transcribe="true"/>\n` +
           `  <Say voice="alice">Thank you for your message.</Say>\n` +
           `  <Hangup/>\n`;
  }

  /**
   * Generate Redirect TeXML
   */
  private generateRedirectTeXML(sessionId: string, nextStep: string): string {
    const redirectUrl = `${this.webhookBaseUrl}/api/ivr/${sessionId}/step/${nextStep}`;
    return `  <Redirect method="POST">${redirectUrl}</Redirect>\n`;
  }

  /**
   * Handle transfer action
   */
  private handleTransfer(session: IVRCallSession, option: IVROption): { texml: string; nextStep?: string } {
    // This will be handled by the call forwarding service
    const transferStep: IVRStep = {
      id: 'transfer',
      type: 'dial',
      message: 'Please hold while we connect you to a representative.',
      metadata: {
        transferType: 'agent',
        industry: session.industry
      }
    };

    session.status = 'transferred';
    return {
      texml: this.generateStepTeXML(transferStep, session),
      nextStep: 'transfer'
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): IVRCallSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Update session
   */
  updateSession(sessionId: string, updates: Partial<IVRCallSession>): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  /**
   * End session
   */
  endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      // Keep session for analytics, remove after retention period
      setTimeout(() => {
        this.activeSessions.delete(sessionId);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }
  }

  /**
   * Get flow by ID
   */
  getFlow(flowId: string): IVRCallFlow | undefined {
    return this.callFlows.get(flowId);
  }

  /**
   * Register custom flow
   */
  registerFlow(flow: IVRCallFlow): void {
    this.callFlows.set(flow.id, flow);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `ivr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Export singleton instance
export const ivrService = new IVRService();

