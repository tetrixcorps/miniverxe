// WhatsApp Business Account Onboarding Service
// Integrates with Sinch Engage API for automated WABA setup

export interface WABAConfig {
  sinchApiKey: string;
  sinchApiSecret: string;
  sinchProjectId: string;
  webhookBaseUrl: string;
  defaultTimezone: string;
}

export interface WABAOnboardingData {
  businessName: string;
  displayName: string;
  businessCategory: string;
  businessDescription: string;
  website?: string;
  address?: string;
  timezone: string;
  phoneNumber: string;
  email: string;
  businessType: 'INDIVIDUAL' | 'BUSINESS';
  verificationMethod: 'SMS' | 'CALL';
}

export interface WABAStatus {
  wabaId?: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'suspended';
  message?: string;
  verificationRequired?: boolean;
  verificationSteps?: string[];
  estimatedApprovalTime?: string;
  rejectionReason?: string;
  lastUpdated: Date;
}

export interface WABAWebhookEvent {
  eventType: string;
  wabaId: string;
  status: string;
  message?: string;
  timestamp: Date;
  metadata?: any;
}

class WhatsAppOnboardingService {
  private config: WABAConfig;
  private sinchApiUrl: string;

  constructor(config: WABAConfig) {
    this.config = config;
    this.sinchApiUrl = 'https://api.sinch.com/v1/projects';
  }

  /**
   * Initiate WhatsApp Business Account onboarding
   */
  async initiateWABAOnboarding(
    userId: string,
    onboardingData: WABAOnboardingData
  ): Promise<{
    success: boolean;
    wabaId?: string;
    status: WABAStatus['status'];
    message: string;
    verificationRequired: boolean;
    nextSteps: string[];
    error?: string;
  }> {
    try {
      // Validate business data
      const validation = this.validateOnboardingData(onboardingData);
      if (!validation.valid) {
        return {
          success: false,
          status: 'rejected',
          message: validation.error!,
          verificationRequired: false,
          nextSteps: [],
          error: validation.error
        };
      }

      // Create WABA application via Sinch Engage API
      const wabaApplication = await this.createWABAApplication(onboardingData);
      
      if (!wabaApplication.success) {
        return {
          success: false,
          status: 'rejected',
          message: 'Failed to create WABA application',
          verificationRequired: false,
          nextSteps: [],
          error: wabaApplication.error
        };
      }

      // Store WABA data in database
      await this.storeWABAData(userId, wabaApplication.data, onboardingData);

      // Determine next steps based on response
      const nextSteps = this.getNextSteps(wabaApplication.data.status);
      const verificationRequired = this.requiresVerification(wabaApplication.data.status);

      return {
        success: true,
        wabaId: wabaApplication.data.wabaId,
        status: this.mapSinchStatusToWABAStatus(wabaApplication.data.status),
        message: this.getStatusMessage(wabaApplication.data.status),
        verificationRequired,
        nextSteps
      };

    } catch (error) {
      console.error('WABA onboarding initiation failed:', error);
      return {
        success: false,
        status: 'rejected',
        message: 'Onboarding failed due to technical error',
        verificationRequired: false,
        nextSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current WABA onboarding status
   */
  async getWABAStatus(wabaId: string): Promise<WABAStatus> {
    try {
      // Check status with Sinch API
      const statusResponse = await this.checkWABAStatusWithSinch(wabaId);
      
      if (!statusResponse.success) {
        return {
          status: 'rejected',
          message: 'Failed to retrieve status',
          lastUpdated: new Date()
        };
      }

      const status = this.mapSinchStatusToWABAStatus(statusResponse.data.status);
      
      return {
        wabaId,
        status,
        message: this.getStatusMessage(status),
        verificationRequired: this.requiresVerification(status),
        verificationSteps: this.getVerificationSteps(status),
        estimatedApprovalTime: this.getEstimatedApprovalTime(status),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Failed to get WABA status:', error);
      return {
        status: 'rejected',
        message: 'Status check failed',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Handle WABA webhook events
   */
  async handleWABAWebhook(event: WABAWebhookEvent): Promise<void> {
    try {
      console.log(`Processing WABA webhook: ${event.eventType} for WABA: ${event.wabaId}`);

      switch (event.eventType) {
        case 'waba.created':
          await this.handleWABACreated(event);
          break;
        case 'waba.verification_required':
          await this.handleVerificationRequired(event);
          break;
        case 'waba.approved':
          await this.handleWABAApproved(event);
          break;
        case 'waba.rejected':
          await this.handleWABARejected(event);
          break;
        case 'waba.suspended':
          await this.handleWABASuspended(event);
          break;
        default:
          console.log(`Unhandled WABA webhook event: ${event.eventType}`);
      }

      // Update database with latest status
      await this.updateWABAStatus(event.wabaId, event.status, event.message);

    } catch (error) {
      console.error('WABA webhook handling failed:', error);
    }
  }

  /**
   * Resubmit WABA application after rejection
   */
  async resubmitWABAApplication(
    wabaId: string,
    updatedData: Partial<WABAOnboardingData>
  ): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      // Update WABA application with new data
      const updateResponse = await this.updateWABAApplication(wabaId, updatedData);
      
      if (!updateResponse.success) {
        return {
          success: false,
          message: 'Failed to update WABA application',
          error: updateResponse.error
        };
      }

      // Resubmit for review
      const resubmitResponse = await this.resubmitForReview(wabaId);
      
      if (!resubmitResponse.success) {
        return {
          success: false,
          message: 'Failed to resubmit application',
          error: resubmitResponse.error
        };
      }

      return {
        success: true,
        message: 'Application resubmitted successfully. You will be notified of the decision.'
      };

    } catch (error) {
      console.error('WABA resubmission failed:', error);
      return {
        success: false,
        message: 'Resubmission failed due to technical error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private helper methods
  private validateOnboardingData(data: WABAOnboardingData): { valid: boolean; error?: string } {
    if (!data.businessName || data.businessName.length < 2) {
      return { valid: false, error: 'Business name must be at least 2 characters' };
    }
    
    if (!data.displayName || data.displayName.length < 2) {
      return { valid: false, error: 'Display name must be at least 2 characters' };
    }
    
    if (!data.phoneNumber || !this.isValidPhoneNumber(data.phoneNumber)) {
      return { valid: false, error: 'Valid phone number is required' };
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
      return { valid: false, error: 'Valid email address is required' };
    }
    
    return { valid: true };
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async createWABAApplication(data: WABAOnboardingData): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.sinchApiUrl}/${this.config.sinchProjectId}/whatsapp/business-accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.sinchApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_name: data.businessName,
          display_name: data.displayName,
          category: data.businessCategory,
          description: data.businessDescription,
          website: data.website,
          address: data.address,
          timezone: data.timezone,
          phone_number: data.phoneNumber,
          email: data.email,
          business_type: data.businessType,
          verification_method: data.verificationMethod,
          webhook_url: `${this.config.webhookBaseUrl}/webhooks/sinch/waba`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkWABAStatusWithSinch(wabaId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.sinchApiUrl}/${this.config.sinchProjectId}/whatsapp/business-accounts/${wabaId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.sinchApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapSinchStatusToWABAStatus(sinchStatus: string): WABAStatus['status'] {
    const statusMap: Record<string, WABAStatus['status']> = {
      'PENDING': 'pending',
      'IN_REVIEW': 'in_progress',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'SUSPENDED': 'suspended'
    };
    
    return statusMap[sinchStatus] || 'pending';
  }

  private getStatusMessage(status: WABAStatus['status']): string {
    const messages = {
      'pending': 'Your WhatsApp Business Account application is being reviewed. This usually takes 24-48 hours.',
      'in_progress': 'We\'re processing your application. You may receive additional verification requests.',
      'approved': 'Congratulations! Your WhatsApp Business Account has been approved and is ready to use.',
      'rejected': 'Your application was not approved. Please review the requirements and resubmit.',
      'suspended': 'Your WhatsApp Business Account has been suspended. Please contact support for assistance.'
    };
    
    return messages[status] || 'Processing your request...';
  }

  private requiresVerification(status: WABAStatus['status']): boolean {
    return status === 'pending' || status === 'in_progress';
  }

  private getVerificationSteps(status: WABAStatus['status']): string[] {
    if (status === 'pending') {
      return [
        'Verify your business phone number',
        'Complete Facebook Business verification',
        'Submit required business documents'
      ];
    }
    
    if (status === 'in_progress') {
      return [
        'Check your email for additional verification steps',
        'Complete any pending document requirements'
      ];
    }
    
    return [];
  }

  private getEstimatedApprovalTime(status: WABAStatus['status']): string {
    if (status === 'pending' || status === 'in_progress') {
      return '24-48 hours';
    }
    
    return 'N/A';
  }

  private getNextSteps(status: string): string[] {
    switch (status) {
      case 'PENDING':
        return [
          'Check your email for verification link',
          'Complete Facebook Business verification',
          'Submit required business documents'
        ];
      case 'IN_REVIEW':
        return [
          'Wait for approval',
          'Check status in dashboard',
          'Respond to any additional requests'
        ];
      case 'APPROVED':
        return [
          'Access your unified messaging dashboard',
          'Start sending WhatsApp messages',
          'Configure your business profile'
        ];
      case 'REJECTED':
        return [
          'Review rejection reason',
          'Update business information',
          'Resubmit application'
        ];
      default:
        return ['Contact support for assistance'];
    }
  }

  private async storeWABAData(userId: string, wabaData: any, onboardingData: WABAOnboardingData): Promise<void> {
    // Store WABA data in database
    // This would integrate with your existing database
    console.log('Storing WABA data:', { userId, wabaData, onboardingData });
  }

  private async updateWABAStatus(wabaId: string, status: string, message?: string): Promise<void> {
    // Update WABA status in database
    console.log('Updating WABA status:', { wabaId, status, message });
  }

  private async handleWABACreated(event: WABAWebhookEvent): Promise<void> {
    console.log('WABA created:', event);
    // Send notification to user
  }

  private async handleVerificationRequired(event: WABAWebhookEvent): Promise<void> {
    console.log('WABA verification required:', event);
    // Send verification instructions to user
  }

  private async handleWABAApproved(event: WABAWebhookEvent): Promise<void> {
    console.log('WABA approved:', event);
    // Enable WhatsApp features for user
    // Send congratulations notification
  }

  private async handleWABARejected(event: WABAWebhookEvent): Promise<void> {
    console.log('WABA rejected:', event);
    // Send rejection notification with next steps
  }

  private async handleWABASuspended(event: WABAWebhookEvent): Promise<void> {
    console.log('WABA suspended:', event);
    // Disable WhatsApp features
    // Send suspension notification
  }

  private async updateWABAApplication(wabaId: string, data: Partial<WABAOnboardingData>): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Update WABA application via Sinch API
    return { success: true };
  }

  private async resubmitForReview(wabaId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Resubmit WABA application for review
    return { success: true };
  }
}

export const whatsappOnboardingService = new WhatsAppOnboardingService({
  sinchApiKey: process.env.SINCH_API_KEY!,
  sinchApiSecret: process.env.SINCH_API_SECRET!,
  sinchProjectId: process.env.SINCH_CONVERSATION_PROJECT_ID!,
  webhookBaseUrl: process.env.WEBHOOK_BASE_URL!,
  defaultTimezone: 'UTC'
});
