// Construction and Real Estate Specific IVR Service
// Handles project inquiries, vendor coordination, permit status, and property inquiries

import { ivrService, type IVRCallSession } from '../ivrService';

export interface ConstructionIVRData {
  projectId?: string;
  vendorId?: string;
  permitNumber?: string;
  propertyAddress?: string;
  contractNumber?: string;
}

class ConstructionIVRService {
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeConstructionFlows();
    this.initializeRealEstateFlows();
  }

  /**
   * Initialize construction-specific IVR flows
   */
  private initializeConstructionFlows() {
    // Project Inquiries Flow
    ivrService.registerFlow({
      id: 'construction_project_inquiry',
      name: 'Construction Project Inquiries',
      industry: 'construction',
      steps: [
        {
          id: 'project_greeting',
          type: 'say',
          message: 'You have selected project inquiries. Please have your project number ready.'
        },
        {
          id: 'project_number',
          type: 'gather',
          message: 'Please enter your project number using your keypad.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'project_status'
        },
        {
          id: 'project_status',
          type: 'say',
          message: 'Thank you. We are retrieving your project information. Please hold.',
          nextStep: 'project_info'
        },
        {
          id: 'project_info',
          type: 'say',
          message: 'Your project is currently in progress. The estimated completion date is December 15th, 2025. For detailed project updates, please visit our project portal or press 0 to speak with a project manager.',
          nextStep: 'project_options'
        },
        {
          id: 'project_options',
          type: 'gather',
          message: 'Press 0 to speak with a project manager, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Project Manager', action: 'transfer', nextStep: 'transfer_project_manager' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Vendor Coordination Flow
    ivrService.registerFlow({
      id: 'construction_vendor_coordination',
      name: 'Construction Vendor Coordination',
      industry: 'construction',
      steps: [
        {
          id: 'vendor_greeting',
          type: 'say',
          message: 'You have selected vendor coordination. Please enter your vendor ID or say your company name.'
        },
        {
          id: 'vendor_id',
          type: 'gather',
          message: 'Please enter your vendor ID using your keypad, or say your company name.',
          timeout: 15,
          maxDigits: 10,
          metadata: { speechRecognition: true },
          nextStep: 'vendor_coordination'
        },
        {
          id: 'vendor_coordination',
          type: 'say',
          message: 'Thank you. We are retrieving your vendor coordination information. Please hold.',
          nextStep: 'vendor_info'
        },
        {
          id: 'vendor_info',
          type: 'say',
          message: 'Your vendor coordination details are available. For scheduling and coordination updates, please visit our vendor portal or press 0 to speak with a coordinator.',
          nextStep: 'vendor_options'
        },
        {
          id: 'vendor_options',
          type: 'gather',
          message: 'Press 0 to speak with a coordinator, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Coordinator', action: 'transfer', nextStep: 'transfer_coordinator' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Permit Status Flow
    ivrService.registerFlow({
      id: 'construction_permit_status',
      name: 'Construction Permit Status',
      industry: 'construction',
      steps: [
        {
          id: 'permit_greeting',
          type: 'say',
          message: 'You have selected permit status. Please enter your permit number.'
        },
        {
          id: 'permit_number',
          type: 'gather',
          message: 'Please enter your permit number using your keypad.',
          timeout: 15,
          maxDigits: 15,
          nextStep: 'permit_status_check'
        },
        {
          id: 'permit_status_check',
          type: 'say',
          message: 'Thank you. We are checking your permit status. Please hold.',
          nextStep: 'permit_status_delivery'
        },
        {
          id: 'permit_status_delivery',
          type: 'say',
          message: 'Your permit application is currently under review. Expected approval date is November 1st, 2025. You will receive a notification once your permit is approved.',
          nextStep: 'permit_complete'
        },
        {
          id: 'permit_complete',
          type: 'hangup'
        }
      ]
    });

    // Warranty Claims Flow
    ivrService.registerFlow({
      id: 'construction_warranty_claims',
      name: 'Construction Warranty Claims',
      industry: 'construction',
      steps: [
        {
          id: 'warranty_greeting',
          type: 'say',
          message: 'You have selected warranty claims. Please have your contract number ready.'
        },
        {
          id: 'warranty_contract',
          type: 'gather',
          message: 'Please enter your contract number.',
          timeout: 15,
          maxDigits: 15,
          nextStep: 'warranty_description'
        },
        {
          id: 'warranty_description',
          type: 'record',
          message: 'Please describe the warranty issue in detail after the beep. When finished, press the pound key.',
          timeout: 180,
          metadata: { maxLength: 300 },
          nextStep: 'warranty_confirmation'
        },
        {
          id: 'warranty_confirmation',
          type: 'say',
          message: 'Thank you for reporting your warranty claim. Your claim has been submitted and a warranty specialist will contact you within 48 hours.',
          nextStep: 'warranty_complete'
        },
        {
          id: 'warranty_complete',
          type: 'hangup'
        }
      ]
    });
  }

  /**
   * Initialize real estate-specific IVR flows
   */
  private initializeRealEstateFlows() {
    // Property Inquiries Flow
    ivrService.registerFlow({
      id: 'real_estate_property_inquiry',
      name: 'Real Estate Property Inquiries',
      industry: 'real_estate',
      steps: [
        {
          id: 'property_greeting',
          type: 'say',
          message: 'You have selected property inquiries. Please enter the property address or MLS number.'
        },
        {
          id: 'property_input',
          type: 'gather',
          message: 'Please enter the MLS number using your keypad, or say the property address.',
          timeout: 20,
          maxDigits: 10,
          metadata: { speechRecognition: true },
          nextStep: 'property_retrieve'
        },
        {
          id: 'property_retrieve',
          type: 'say',
          message: 'Thank you. We are retrieving property information. Please hold.',
          nextStep: 'property_info'
        },
        {
          id: 'property_info',
          type: 'say',
          message: 'Property information is available. For detailed property information, photos, and virtual tours, please visit our website or press 0 to speak with a real estate agent.',
          nextStep: 'property_options'
        },
        {
          id: 'property_options',
          type: 'gather',
          message: 'Press 0 to speak with an agent, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Real Estate Agent', action: 'transfer', nextStep: 'transfer_agent' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Virtual Tour Scheduling Flow
    ivrService.registerFlow({
      id: 'real_estate_virtual_tour',
      name: 'Real Estate Virtual Tour Scheduling',
      industry: 'real_estate',
      steps: [
        {
          id: 'tour_greeting',
          type: 'say',
          message: 'You have selected virtual tour scheduling. Please enter the property MLS number.'
        },
        {
          id: 'tour_mls',
          type: 'gather',
          message: 'Please enter the MLS number.',
          timeout: 15,
          maxDigits: 10,
          nextStep: 'tour_availability'
        },
        {
          id: 'tour_availability',
          type: 'say',
          message: 'Thank you. We are checking virtual tour availability. Please hold.',
          nextStep: 'tour_schedule'
        },
        {
          id: 'tour_schedule',
          type: 'say',
          message: 'Virtual tours are available. To schedule a virtual tour, please visit our website or press 0 to speak with an agent who can assist you with scheduling.',
          nextStep: 'tour_options'
        },
        {
          id: 'tour_options',
          type: 'gather',
          message: 'Press 0 to speak with an agent, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Agent', action: 'transfer', nextStep: 'transfer_agent' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Contract Follow-up Flow
    ivrService.registerFlow({
      id: 'real_estate_contract_followup',
      name: 'Real Estate Contract Follow-up',
      industry: 'real_estate',
      steps: [
        {
          id: 'contract_greeting',
          type: 'say',
          message: 'You have selected contract follow-ups. Please enter your contract number.'
        },
        {
          id: 'contract_number',
          type: 'gather',
          message: 'Please enter your contract number.',
          timeout: 15,
          maxDigits: 15,
          nextStep: 'contract_status'
        },
        {
          id: 'contract_status',
          type: 'say',
          message: 'Thank you. We are retrieving your contract information. Please hold.',
          nextStep: 'contract_info'
        },
        {
          id: 'contract_info',
          type: 'say',
          message: 'Your contract is currently being processed. For contract updates and status, please visit our client portal or press 0 to speak with your agent.',
          nextStep: 'contract_options'
        },
        {
          id: 'contract_options',
          type: 'gather',
          message: 'Press 0 to speak with your agent, or press 9 to return to the main menu.',
          options: [
            { digit: '0', label: 'Agent', action: 'transfer', nextStep: 'transfer_agent' },
            { digit: '9', label: 'Main Menu', action: 'route', nextStep: 'main_menu' }
          ],
          timeout: 10,
          maxDigits: 1
        }
      ]
    });

    // Financing Information Flow
    ivrService.registerFlow({
      id: 'real_estate_financing_info',
      name: 'Real Estate Financing Information',
      industry: 'real_estate',
      steps: [
        {
          id: 'financing_greeting',
          type: 'say',
          message: 'You have selected financing information. Our financing specialists can help you with mortgage options, pre-approval, and loan applications.'
        },
        {
          id: 'financing_options',
          type: 'gather',
          message: 'Press 1 for mortgage information. Press 2 for pre-approval. Press 3 for loan application assistance. Press 0 to speak with a financing specialist.',
          options: [
            { digit: '1', label: 'Mortgage Info', action: 'route', nextStep: 'financing_mortgage' },
            { digit: '2', label: 'Pre-approval', action: 'route', nextStep: 'financing_preapproval' },
            { digit: '3', label: 'Loan Application', action: 'route', nextStep: 'financing_application' },
            { digit: '0', label: 'Financing Specialist', action: 'transfer', nextStep: 'transfer_financing' }
          ],
          timeout: 10,
          maxDigits: 1
        },
        {
          id: 'financing_mortgage',
          type: 'say',
          message: 'For detailed mortgage information and rates, please visit our website or press 0 to speak with a financing specialist.',
          nextStep: 'financing_options'
        },
        {
          id: 'financing_preapproval',
          type: 'say',
          message: 'To begin the pre-approval process, please visit our website or press 0 to speak with a financing specialist.',
          nextStep: 'financing_options'
        },
        {
          id: 'financing_application',
          type: 'say',
          message: 'For loan application assistance, please press 0 to speak with a financing specialist.',
          nextStep: 'financing_options'
        }
      ]
    });
  }

  /**
   * Process construction-specific IVR actions
   */
  async processConstructionAction(session: IVRCallSession, action: string, data: ConstructionIVRData): Promise<string> {
    switch (action) {
      case 'get_project_status':
        return await this.getProjectStatus(data);
      
      case 'coordinate_vendor':
        return await this.coordinateVendor(data);
      
      case 'check_permit_status':
        return await this.checkPermitStatus(data);
      
      case 'process_warranty_claim':
        return await this.processWarrantyClaim(session, data);
      
      default:
        throw new Error(`Unknown construction action: ${action}`);
    }
  }

  /**
   * Process real estate-specific IVR actions
   */
  async processRealEstateAction(session: IVRCallSession, action: string, data: ConstructionIVRData): Promise<string> {
    switch (action) {
      case 'get_property_info':
        return await this.getPropertyInfo(data);
      
      case 'schedule_virtual_tour':
        return await this.scheduleVirtualTour(data);
      
      case 'get_contract_status':
        return await this.getContractStatus(data);
      
      case 'get_financing_info':
        return await this.getFinancingInfo(data);
      
      default:
        throw new Error(`Unknown real estate action: ${action}`);
    }
  }

  /**
   * Get project status
   */
  private async getProjectStatus(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Project Management System
      // Retrieve project status and completion date
      
      return 'Your project is currently in progress. The estimated completion date is December 15th, 2025.';
    } catch (error) {
      console.error('Error retrieving project status:', error);
      return 'We are unable to retrieve project information at this time. Please hold to speak with a project manager.';
    }
  }

  /**
   * Coordinate with vendor
   */
  private async coordinateVendor(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Vendor Management System
      // Retrieve vendor coordination details
      
      return 'Your vendor coordination details are available. For scheduling and coordination updates, please visit our vendor portal.';
    } catch (error) {
      console.error('Error coordinating vendor:', error);
      return 'We are unable to retrieve vendor coordination information at this time. Please hold to speak with a coordinator.';
    }
  }

  /**
   * Check permit status
   */
  private async checkPermitStatus(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Permit Management System
      // Check permit status and approval date
      
      return 'Your permit application is currently under review. Expected approval date is November 1st, 2025.';
    } catch (error) {
      console.error('Error checking permit status:', error);
      return 'We are unable to check permit status at this time. Please contact the permit office directly.';
    }
  }

  /**
   * Process warranty claim
   */
  private async processWarrantyClaim(session: IVRCallSession, data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Warranty Management System
      // Process warranty claim
      // Assign warranty specialist
      
      return 'Thank you for reporting your warranty claim. Your claim has been submitted and a warranty specialist will contact you within 48 hours.';
    } catch (error) {
      console.error('Error processing warranty claim:', error);
      return 'We encountered an error processing your warranty claim. Please hold to speak with a warranty specialist.';
    }
  }

  /**
   * Get property information
   */
  private async getPropertyInfo(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with MLS System
      // Retrieve property information
      
      return 'Property information is available. For detailed property information, photos, and virtual tours, please visit our website.';
    } catch (error) {
      console.error('Error retrieving property info:', error);
      return 'We are unable to retrieve property information at this time. Please hold to speak with a real estate agent.';
    }
  }

  /**
   * Schedule virtual tour
   */
  private async scheduleVirtualTour(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Tour Scheduling System
      // Check availability and schedule tour
      
      return 'Virtual tours are available. To schedule a virtual tour, please visit our website or speak with an agent.';
    } catch (error) {
      console.error('Error scheduling virtual tour:', error);
      return 'We are unable to schedule a virtual tour at this time. Please hold to speak with an agent.';
    }
  }

  /**
   * Get contract status
   */
  private async getContractStatus(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Contract Management System
      // Retrieve contract status
      
      return 'Your contract is currently being processed. For contract updates and status, please visit our client portal.';
    } catch (error) {
      console.error('Error retrieving contract status:', error);
      return 'We are unable to retrieve contract information at this time. Please hold to speak with your agent.';
    }
  }

  /**
   * Get financing information
   */
  private async getFinancingInfo(data: ConstructionIVRData): Promise<string> {
    try {
      // Integration with Financing System
      // Retrieve financing options and rates
      
      return 'For detailed mortgage information and rates, please visit our website or speak with a financing specialist.';
    } catch (error) {
      console.error('Error retrieving financing info:', error);
      return 'We are unable to retrieve financing information at this time. Please hold to speak with a financing specialist.';
    }
  }
}

export const constructionIVRService = new ConstructionIVRService();

