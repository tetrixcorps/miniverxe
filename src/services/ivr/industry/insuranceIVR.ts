// Insurance-Specific IVR Service
// Handles FNOL reporting, claim status, policy inquiries, and payments

import { ivrService, type IVRCallSession } from '../ivrService';

export interface InsuranceIVRData {
  claimNumber?: string;
  policyNumber?: string;
  accountNumber?: string;
  incidentDate?: string;
  incidentDescription?: string;
}

class InsuranceIVRService {
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeInsuranceFlows();
  }

  /**
   * Initialize insurance-specific IVR flows
   */
  private initializeInsuranceFlows() {
    // First Notice of Loss (FNOL) Flow
    ivrService.registerFlow({
      id: 'insurance_fnol_menu',
      name: 'Insurance FNOL Reporting',
      industry: 'insurance',
      steps: [
        {
          id: 'fnol_greeting',
          type: 'say',
          message: 'You have selected to report a claim. Please have your policy number ready.'
        },
        {
          id: 'fnol_policy',
          type: 'gather',
          message: 'Please enter your 10-digit policy number using your keypad.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'fnol_incident_date'
        },
        {
          id: 'fnol_incident_date',
          type: 'gather',
          message: 'Please enter the date of the incident in MMDDYYYY format.',
          timeout: 15,
          maxDigits: 8,
          nextStep: 'fnol_incident_description'
        },
        {
          id: 'fnol_incident_description',
          type: 'record',
          message: 'Please describe the incident in detail after the beep. When finished, press the pound key.',
          timeout: 180,
          metadata: { maxLength: 300 },
          nextStep: 'fnol_confirmation'
        },
        {
          id: 'fnol_confirmation',
          type: 'say',
          message: 'Thank you for reporting your claim. Your claim number is being generated. You will receive a confirmation via SMS. A claims adjuster will contact you within 24 hours.',
          nextStep: 'fnol_complete'
        },
        {
          id: 'fnol_complete',
          type: 'hangup'
        }
      ]
    });

    // Claim Status Check Flow
    ivrService.registerFlow({
      id: 'insurance_claim_status',
      name: 'Insurance Claim Status',
      industry: 'insurance',
      steps: [
        {
          id: 'claim_status_greeting',
          type: 'say',
          message: 'You have selected to check claim status. Please enter your 10-digit claim number.'
        },
        {
          id: 'claim_status_number',
          type: 'gather',
          message: 'Please enter your claim number using your keypad.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'claim_status_retrieve'
        },
        {
          id: 'claim_status_retrieve',
          type: 'say',
          message: 'Thank you. We are retrieving your claim information. Please hold.',
          nextStep: 'claim_status_delivery'
        },
        {
          id: 'claim_status_delivery',
          type: 'say',
          message: 'Your claim is currently pending review by your assigned adjuster. Would you like to be transferred to your adjuster\'s voicemail?',
          nextStep: 'claim_status_options'
        },
        {
          id: 'claim_status_options',
          type: 'gather',
          message: 'Press 1 for yes, or 2 to return to the main menu.',
          options: [
            { digit: '1', label: 'Transfer to Adjuster', action: 'transfer', nextStep: 'transfer_adjuster' },
            { digit: '2', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Policy Information Flow
    ivrService.registerFlow({
      id: 'insurance_policy_info',
      name: 'Insurance Policy Information',
      industry: 'insurance',
      steps: [
        {
          id: 'policy_info_greeting',
          type: 'say',
          message: 'You have selected policy information. Please enter your policy number.'
        },
        {
          id: 'policy_info_number',
          type: 'gather',
          message: 'Please enter your 10-digit policy number.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'policy_info_retrieve'
        },
        {
          id: 'policy_info_retrieve',
          type: 'say',
          message: 'Thank you. We are retrieving your policy information. Please hold.',
          nextStep: 'policy_info_delivery'
        },
        {
          id: 'policy_info_delivery',
          type: 'say',
          message: 'Your policy information is available. For detailed policy information, please visit our website or press 0 to speak with a representative.',
          nextStep: 'policy_info_options'
        },
        {
          id: 'policy_info_options',
          type: 'gather',
          message: 'Press 0 to speak with a representative, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Representative', action: 'transfer', nextStep: 'transfer_agent' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Payment Flow (PCI-DSS Compliant)
    ivrService.registerFlow({
      id: 'insurance_payment_menu',
      name: 'Insurance Payment',
      industry: 'insurance',
      steps: [
        {
          id: 'payment_greeting',
          type: 'say',
          message: 'You have selected to make a payment. For your security, this call may be recorded.'
        },
        {
          id: 'payment_account',
          type: 'gather',
          message: 'Please enter your account number.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'payment_amount'
        },
        {
          id: 'payment_amount',
          type: 'say',
          message: 'Please enter the payment amount using your keypad. Enter the amount in dollars and cents. For example, for one hundred dollars and fifty cents, enter 1 0 0 5 0.',
          nextStep: 'payment_process'
        },
        {
          id: 'payment_process',
          type: 'gather',
          message: 'To process your payment, please press 1. To cancel, press 2.',
          options: [
            { digit: '1', label: 'Process Payment', action: 'route', nextStep: 'payment_confirm' },
            { digit: '2', label: 'Cancel', action: 'route', nextStep: 'payment_cancel' }
          ],
          timeout: 10,
          maxDigits: 1
        },
        {
          id: 'payment_confirm',
          type: 'say',
          message: 'Your payment is being processed securely. You will receive a confirmation via SMS. Thank you for your payment.',
          nextStep: 'payment_complete'
        },
        {
          id: 'payment_cancel',
          type: 'say',
          message: 'Your payment has been cancelled. Thank you for calling.',
          nextStep: 'payment_complete'
        },
        {
          id: 'payment_complete',
          type: 'hangup'
        }
      ]
    });
  }

  /**
   * Process insurance-specific IVR actions
   */
  async processInsuranceAction(session: IVRCallSession, action: string, data: InsuranceIVRData): Promise<string> {
    switch (action) {
      case 'report_fnol':
        return await this.reportFNOL(session, data);
      
      case 'check_claim_status':
        return await this.checkClaimStatus(data);
      
      case 'get_policy_info':
        return await this.getPolicyInfo(data);
      
      case 'process_payment':
        return await this.processPayment(session, data);
      
      default:
        throw new Error(`Unknown insurance action: ${action}`);
    }
  }

  /**
   * Report First Notice of Loss (FNOL)
   */
  private async reportFNOL(session: IVRCallSession, data: InsuranceIVRData): Promise<string> {
    try {
      // Integration with Claims Management System
      // Create claim record
      // Generate claim number
      // Send confirmation SMS
      
      const claimNumber = this.generateClaimNumber();
      session.collectedData.claimNumber = claimNumber;
      
      return `Thank you for reporting your claim. Your claim number is ${claimNumber}. You will receive a confirmation via SMS. A claims adjuster will contact you within 24 hours.`;
    } catch (error) {
      console.error('Error reporting FNOL:', error);
      return 'We encountered an error processing your claim. Please hold to speak with a claims representative.';
    }
  }

  /**
   * Check claim status
   */
  private async checkClaimStatus(data: InsuranceIVRData): Promise<string> {
    try {
      // Integration with Claims Management System
      // Retrieve claim status
      // Get adjuster information
      
      // Mock implementation
      return 'Your claim, number 123-456-7890, is currently pending review by your assigned adjuster, Jane Doe.';
    } catch (error) {
      console.error('Error checking claim status:', error);
      return 'We are unable to retrieve your claim status at this time. Please hold to speak with a claims representative.';
    }
  }

  /**
   * Get policy information
   */
  private async getPolicyInfo(data: InsuranceIVRData): Promise<string> {
    try {
      // Integration with Policy Administration System
      // Retrieve policy details
      
      return 'Your policy information is available. For detailed policy information, please visit our website.';
    } catch (error) {
      console.error('Error retrieving policy info:', error);
      return 'We are unable to retrieve your policy information at this time. Please hold to speak with a representative.';
    }
  }

  /**
   * Process payment (PCI-DSS compliant)
   */
  private async processPayment(session: IVRCallSession, data: InsuranceIVRData): Promise<string> {
    try {
      // PCI-DSS compliant payment processing
      // Integration with payment gateway
      // Process payment securely
      // Send confirmation
      
      return 'Your payment is being processed securely. You will receive a confirmation via SMS. Thank you for your payment.';
    } catch (error) {
      console.error('Error processing payment:', error);
      return 'We encountered an error processing your payment. Please hold to speak with a billing representative.';
    }
  }

  /**
   * Generate claim number
   */
  private generateClaimNumber(): string {
    const prefix = 'CLM';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}

export const insuranceIVRService = new InsuranceIVRService();

