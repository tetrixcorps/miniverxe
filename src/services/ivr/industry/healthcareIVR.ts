// Healthcare-Specific IVR Service
// Handles appointment scheduling, prescription refills, lab results, and billing

import { ivrService, type IVRCallSession, type IVRStep } from '../ivrService';
import type { TeXMLResponse } from '../../telnyxVoiceService';

export interface HealthcareIVRData {
  patientId?: string;
  appointmentDate?: string;
  department?: string;
  prescriptionNumber?: string;
  labResultId?: string;
  claimNumber?: string;
}

class HealthcareIVRService {
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeHealthcareFlows();
  }

  /**
   * Initialize healthcare-specific IVR flows
   */
  private initializeHealthcareFlows() {
    // Appointment Scheduling Flow
    ivrService.registerFlow({
      id: 'healthcare_appointment_menu',
      name: 'Healthcare Appointment Scheduling',
      industry: 'healthcare',
      steps: [
        {
          id: 'appointment_greeting',
          type: 'say',
          message: 'You have selected appointment scheduling. Please say the name of the department you\'d like to visit, like Cardiology or Pediatrics.'
        },
        {
          id: 'appointment_department',
          type: 'gather',
          message: 'Please say the department name, or press 1 for Cardiology, 2 for Pediatrics, 3 for Emergency, 4 for General Practice, or 0 to speak with a scheduler.',
          options: [
            { digit: '1', label: 'Cardiology', action: 'route', nextStep: 'appointment_availability' },
            { digit: '2', label: 'Pediatrics', action: 'route', nextStep: 'appointment_availability' },
            { digit: '3', label: 'Emergency', action: 'route', nextStep: 'appointment_emergency' },
            { digit: '4', label: 'General Practice', action: 'route', nextStep: 'appointment_availability' },
            { digit: '0', label: 'Scheduler', action: 'transfer', nextStep: 'transfer_scheduler' }
          ],
          timeout: 10,
          maxDigits: 1,
          metadata: { speechRecognition: true }
        },
        {
          id: 'appointment_availability',
          type: 'say',
          message: 'Checking availability. Please hold.',
          nextStep: 'appointment_confirm'
        },
        {
          id: 'appointment_confirm',
          type: 'gather',
          message: 'The next available appointment is Tuesday, October 14th, at 10:30 AM. To book this appointment, press 1. To hear other options, press 2. To speak with a scheduler, press 0.',
          options: [
            { digit: '1', label: 'Book Appointment', action: 'route', nextStep: 'appointment_book' },
            { digit: '2', label: 'More Options', action: 'route', nextStep: 'appointment_availability' },
            { digit: '0', label: 'Scheduler', action: 'transfer', nextStep: 'transfer_scheduler' }
          ],
          timeout: 10,
          maxDigits: 1
        },
        {
          id: 'appointment_book',
          type: 'say',
          message: 'Your appointment has been scheduled. You will receive a confirmation SMS shortly. Thank you for calling.',
          nextStep: 'appointment_complete'
        },
        {
          id: 'appointment_complete',
          type: 'hangup'
        }
      ]
    });

    // Prescription Refill Flow
    ivrService.registerFlow({
      id: 'healthcare_prescription_menu',
      name: 'Healthcare Prescription Refills',
      industry: 'healthcare',
      steps: [
        {
          id: 'prescription_greeting',
          type: 'say',
          message: 'You have selected prescription refills. For your security, please enter your 10-digit prescription number.'
        },
        {
          id: 'prescription_number',
          type: 'gather',
          message: 'Please enter your prescription number using your keypad.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'prescription_verify'
        },
        {
          id: 'prescription_verify',
          type: 'say',
          message: 'Thank you. We are processing your refill request. You will receive a notification when your prescription is ready for pickup.',
          nextStep: 'prescription_complete'
        },
        {
          id: 'prescription_complete',
          type: 'hangup'
        }
      ]
    });

    // Lab Results Flow
    ivrService.registerFlow({
      id: 'healthcare_lab_results',
      name: 'Healthcare Lab Results',
      industry: 'healthcare',
      steps: [
        {
          id: 'lab_greeting',
          type: 'say',
          message: 'You have selected lab results. For your security and HIPAA compliance, please enter your patient ID and date of birth.'
        },
        {
          id: 'lab_authentication',
          type: 'gather',
          message: 'Please enter your 8-digit patient ID followed by your 6-digit date of birth in MMDDYY format.',
          timeout: 20,
          maxDigits: 14,
          nextStep: 'lab_verify'
        },
        {
          id: 'lab_verify',
          type: 'say',
          message: 'Thank you. We are retrieving your lab results. Please hold.',
          nextStep: 'lab_results_delivery'
        },
        {
          id: 'lab_results_delivery',
          type: 'say',
          message: 'Your lab results are available. For detailed results, please log in to your patient portal or speak with your healthcare provider. Thank you.',
          nextStep: 'lab_complete'
        },
        {
          id: 'lab_complete',
          type: 'hangup'
        }
      ]
    });

    // Billing Inquiries Flow
    ivrService.registerFlow({
      id: 'healthcare_billing_menu',
      name: 'Healthcare Billing Inquiries',
      industry: 'healthcare',
      steps: [
        {
          id: 'billing_greeting',
          type: 'say',
          message: 'You have selected billing inquiries. Please enter your account number or claim number.'
        },
        {
          id: 'billing_account',
          type: 'gather',
          message: 'Please enter your 10-digit account number.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'billing_status'
        },
        {
          id: 'billing_status',
          type: 'say',
          message: 'Thank you. We are retrieving your billing information. Please hold.',
          nextStep: 'billing_info'
        },
        {
          id: 'billing_info',
          type: 'say',
          message: 'Your account balance is available. For detailed billing information or to make a payment, please visit our patient portal or press 0 to speak with a billing representative.',
          nextStep: 'billing_options'
        },
        {
          id: 'billing_options',
          type: 'gather',
          message: 'Press 0 to speak with a billing representative, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Billing Representative', action: 'transfer', nextStep: 'transfer_billing' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });
  }

  /**
   * Process healthcare-specific IVR actions
   */
  async processHealthcareAction(session: IVRCallSession, action: string, data: HealthcareIVRData): Promise<string> {
    switch (action) {
      case 'check_appointment_availability':
        return await this.checkAppointmentAvailability(data);
      
      case 'book_appointment':
        return await this.bookAppointment(session, data);
      
      case 'process_prescription_refill':
        return await this.processPrescriptionRefill(data);
      
      case 'retrieve_lab_results':
        return await this.retrieveLabResults(data);
      
      case 'get_billing_info':
        return await this.getBillingInfo(data);
      
      default:
        throw new Error(`Unknown healthcare action: ${action}`);
    }
  }

  /**
   * Check appointment availability (integrates with EHR)
   */
  private async checkAppointmentAvailability(data: HealthcareIVRData): Promise<string> {
    // Integration with EHR system (Epic, Cerner, etc.)
    // This would call the healthcare integration service
    try {
      // Mock implementation - would integrate with actual EHR
      const availableSlots = [
        { date: 'Tuesday, October 14th', time: '10:30 AM' },
        { date: 'Wednesday, October 15th', time: '2:00 PM' },
        { date: 'Thursday, October 16th', time: '9:00 AM' }
      ];

      const nextSlot = availableSlots[0];
      return `The next available appointment is ${nextSlot.date} at ${nextSlot.time}.`;
    } catch (error) {
      console.error('Error checking appointment availability:', error);
      return 'We are unable to check availability at this time. Please hold to speak with a scheduler.';
    }
  }

  /**
   * Book appointment (integrates with EHR)
   */
  private async bookAppointment(session: IVRCallSession, data: HealthcareIVRData): Promise<string> {
    try {
      // Integration with EHR system
      // Store appointment in database
      // Send SMS confirmation
      
      return 'Your appointment has been scheduled. You will receive a confirmation SMS shortly.';
    } catch (error) {
      console.error('Error booking appointment:', error);
      return 'We encountered an error scheduling your appointment. Please hold to speak with a scheduler.';
    }
  }

  /**
   * Process prescription refill
   */
  private async processPrescriptionRefill(data: HealthcareIVRData): Promise<string> {
    try {
      // Integration with pharmacy system
      // Process refill request
      // Send notification
      
      return 'Your prescription refill request has been processed. You will receive a notification when your prescription is ready for pickup.';
    } catch (error) {
      console.error('Error processing prescription refill:', error);
      return 'We encountered an error processing your refill request. Please hold to speak with a pharmacy representative.';
    }
  }

  /**
   * Retrieve lab results (HIPAA-compliant)
   */
  private async retrieveLabResults(data: HealthcareIVRData): Promise<string> {
    try {
      // HIPAA-compliant lab results retrieval
      // Verify patient authentication
      // Retrieve results from EHR
      
      return 'Your lab results are available. For detailed results, please log in to your patient portal or speak with your healthcare provider.';
    } catch (error) {
      console.error('Error retrieving lab results:', error);
      return 'We are unable to retrieve your lab results at this time. Please contact your healthcare provider directly.';
    }
  }

  /**
   * Get billing information
   */
  private async getBillingInfo(data: HealthcareIVRData): Promise<string> {
    try {
      // Integration with billing system
      // Retrieve account balance
      // Return formatted message
      
      return 'Your account balance information is available. For detailed billing information or to make a payment, please visit our patient portal.';
    } catch (error) {
      console.error('Error retrieving billing info:', error);
      return 'We are unable to retrieve your billing information at this time. Please hold to speak with a billing representative.';
    }
  }

  /**
   * Generate HIPAA-compliant TeXML response
   */
  generateHIPAACompliantTeXML(message: string, includeRecordingNotice: boolean = true): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';
    
    if (includeRecordingNotice) {
      xml += '  <Say voice="alice">This call may be recorded for medical record purposes and HIPAA compliance.</Say>\n';
    }
    
    xml += `  <Say voice="alice">${this.escapeXML(message)}</Say>\n`;
    xml += '</Response>';
    
    return xml;
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

export const healthcareIVRService = new HealthcareIVRService();

