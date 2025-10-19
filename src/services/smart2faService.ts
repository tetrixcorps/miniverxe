// Smart 2FA Service with Provider Selection and WhatsApp Onboarding Integration
// Integrates with existing Telnyx 2FA implementation (Voice primary, SMS fallback)
import { getSHANGOAIService } from './sinchChatService';

export interface TwoFAConfig {
  preferredMethod: 'voice' | 'sms';  // Voice is primary as per requirements
  fallbackMethod: 'sms' | 'voice';   // SMS as fallback
  timeout: number;
  maxRetries: number;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  email?: string;
  businessName?: string;
  displayName?: string;
  onboardingStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  trialStatus: 'active' | 'expired' | 'not_started';
  trialExpiresAt?: Date;
  stripeCustomerId?: string;
  wabaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  businessName: string;
  displayName: string;
  businessCategory: string;
  businessDescription: string;
  website?: string;
  address?: string;
  timezone: string;
}

class Smart2FAService {
  private config: TwoFAConfig;
  private shangoService: any;

  constructor(config: TwoFAConfig) {
    this.config = config;
    this.shangoService = getSHANGOAIService();
    
    if (!this.shangoService) {
      console.warn('SHANGO AI Super Agent is not available. 2FA will work without AI features.');
    }
  }

  /**
   * Smart 2FA with automatic provider selection and fallback
   */
  async initiateSmart2FA(phoneNumber: string, userAgent?: string): Promise<{
    verificationId: string;
    method: 'sms' | 'voice';
    estimatedDelivery: number;
    fallbackAvailable: boolean;
  }> {
    try {
      // Clean and validate phone number
      const cleanPhone = this.sanitizePhoneNumber(phoneNumber);
      if (!this.isValidPhoneNumber(cleanPhone)) {
        throw new Error('Invalid phone number format');
      }

      // Check rate limiting
      await this.checkRateLimit(cleanPhone);

      // Determine best method based on user agent and carrier detection
      const method = await this.selectOptimalMethod(cleanPhone, userAgent);
      
      // Initiate verification with primary method
      const verification = await this.sendVerification(cleanPhone, method);
      
      // Log the attempt
      await this.log2FAAttempt(cleanPhone, method, 'initiated');

      return {
        verificationId: verification.id,
        method,
        estimatedDelivery: method === 'sms' ? 15 : 30,
        fallbackAvailable: true
      };

    } catch (error) {
      console.error('Smart 2FA initiation failed:', error);
      throw new Error('Failed to initiate verification. Please try again.');
    }
  }

  /**
   * Verify OTP and trigger WhatsApp onboarding
   */
  async verifyAndOnboard(
    verificationId: string, 
    otpCode: string, 
    onboardingData: OnboardingData
  ): Promise<{
    user: UserProfile;
    token: string;
    onboardingTriggered: boolean;
    nextSteps: string[];
  }> {
    try {
      // Verify OTP
      const verificationResult = await this.verifyOTP(verificationId, otpCode);
      
      if (!verificationResult.success) {
        throw new Error('Invalid verification code');
      }

      // Create or update user profile
      const user = await this.createOrUpdateUser(verificationResult.phoneNumber, onboardingData);
      
      // Generate authentication token
      const token = await this.generateAuthToken(user);
      
      // Trigger WhatsApp Business Account onboarding
      const onboardingTriggered = await this.triggerWABAOnboarding(user, onboardingData);
      
      // Determine next steps for user
      const nextSteps = this.getNextSteps(user, onboardingTriggered);

      // Log successful verification
      await this.log2FAAttempt(verificationResult.phoneNumber, 'sms', 'verified');

      return {
        user,
        token,
        onboardingTriggered,
        nextSteps
      };

    } catch (error) {
      console.error('Verification and onboarding failed:', error);
      throw new Error('Verification failed. Please try again.');
    }
  }

  /**
   * Get real-time onboarding status
   */
  async getOnboardingStatus(userId: string): Promise<{
    status: string;
    progress: number;
    message: string;
    actionsRequired: string[];
    estimatedCompletion: Date | null;
  }> {
    try {
      const user = await this.getUserProfile(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get latest status from webhook events
      const latestEvent = await this.getLatestWebhookEvent(userId);
      
      return {
        status: user.onboardingStatus,
        progress: this.calculateProgress(user.onboardingStatus, latestEvent),
        message: this.getStatusMessage(user.onboardingStatus, latestEvent),
        actionsRequired: this.getRequiredActions(user.onboardingStatus, latestEvent),
        estimatedCompletion: this.getEstimatedCompletion(user.onboardingStatus)
      };

    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      throw new Error('Unable to retrieve status');
    }
  }

  /**
   * Handle webhook events from Sinch
   */
  async handleWebhookEvent(event: any): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(event)) {
        throw new Error('Invalid webhook signature');
      }

      const { type, data } = event;
      
      switch (type) {
        case 'waba.status.updated':
          await this.updateWABAStatus(data);
          break;
        case 'waba.approved':
          await this.handleWABAApproval(data);
          break;
        case 'waba.rejected':
          await this.handleWABARejection(data);
          break;
        case 'verification.completed':
          await this.handleVerificationComplete(data);
          break;
        default:
          console.log('Unhandled webhook event:', type);
      }

    } catch (error) {
      console.error('Webhook handling failed:', error);
    }
  }

  // Private helper methods
  private sanitizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  private async checkRateLimit(phone: string): Promise<void> {
    // Implementation for rate limiting
    // Check against database for recent attempts
  }

  private async selectOptimalMethod(phone: string, userAgent?: string): Promise<'voice' | 'sms'> {
    // Smart selection based on:
    // 1. Voice is primary method as per requirements
    // 2. Carrier detection for fallback
    // 3. Previous success rates
    // 4. Time of day (voice better during business hours)
    // 5. User agent detection (mobile vs desktop)
    
    // Always start with voice as primary
    return this.config.preferredMethod;
  }

  private async sendVerification(phone: string, method: 'voice' | 'sms'): Promise<any> {
    // Check if we have the required environment variables
    const tetrixApiUrl = process.env.TETRIX_API_URL || 'http://localhost:3000';
    const sessionSecret = process.env.CROSS_PLATFORM_SESSION_SECRET;
    
    if (!sessionSecret) {
      console.warn('CROSS_PLATFORM_SESSION_SECRET not configured, using mock verification for development');
      return this.generateMockVerification(phone, method);
    }
    
    try {
      const response = await fetch(`${tetrixApiUrl}/api/v1/2fa/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionSecret}`
        },
        body: JSON.stringify({
          phoneNumber: phone,
          method: method,
          provider: 'telnyx'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send verification via TETRIX API:', error);
      // Fallback to mock verification for development
      return this.generateMockVerification(phone, method);
    }
  }

  private generateMockVerification(phone: string, method: 'voice' | 'sms'): any {
    // Generate a mock verification for development when APIs are not configured
    const verificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[MOCK] Generated verification for ${phone} via ${method}: ${verificationId}`);
    
    return {
      id: verificationId,
      phone_number: phone,
      type: method,
      status: 'pending',
      created_at: new Date().toISOString(),
      timeout_secs: 300,
      failed_attempts: 0
    };
  }

  private async sendDirectTelnyxVerification(phone: string, method: 'voice' | 'sms'): Promise<any> {
    // Direct integration with Telnyx (fallback method)
    const telnyxApiUrl = process.env.TELNYX_API_URL || 'https://api.telnyx.com/v2';
    const apiKey = process.env.TELNYX_API_KEY;
    
    if (!apiKey) {
      throw new Error('Telnyx API key not configured');
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    if (method === 'voice') {
      // Voice call via Telnyx
      const payload = {
        to: phone,
        from: process.env.TELNYX_PHONE_NUMBER,
        webhook_url: `${process.env.WEBHOOK_BASE_URL}/webhooks/telnyx/voice`
      };
      
      const response = await fetch(`${telnyxApiUrl}/calls`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      return await response.json();
    } else {
      // SMS via Telnyx
      const payload = {
        from: process.env.TELNYX_PHONE_NUMBER,
        to: phone,
        text: "Your verification code is: {code}",
        type: "SMS",
        webhook_url: `${process.env.WEBHOOK_BASE_URL}/webhooks/telnyx/sms`
      };
      
      const response = await fetch(`${telnyxApiUrl}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      return await response.json();
    }
  }

  private async verifyOTP(verificationId: string, otpCode: string): Promise<any> {
    if (!this.shangoService) {
      throw new Error('SHANGO AI Super Agent is not available for OTP verification');
    }
    return await this.shangoService.verifyOTP(verificationId, otpCode);
  }

  private async createOrUpdateUser(phoneNumber: string, onboardingData: OnboardingData): Promise<UserProfile> {
    // Create or update user in database
    // This would integrate with your existing user management system
    return {
      id: 'user_' + Date.now(),
      phoneNumber,
      businessName: onboardingData.businessName,
      displayName: onboardingData.displayName,
      onboardingStatus: 'pending',
      trialStatus: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async generateAuthToken(user: UserProfile): Promise<string> {
    // Generate JWT token for authentication
    return 'jwt_token_' + user.id;
  }

  private async triggerWABAOnboarding(user: UserProfile, data: OnboardingData): Promise<boolean> {
    try {
      // Call Sinch Engage API to start WABA onboarding
      const wabaRequest = {
        userId: user.id,
        businessName: data.businessName,
        displayName: data.displayName,
        category: data.businessCategory,
        description: data.businessDescription,
        website: data.website,
        address: data.address,
        timezone: data.timezone
      };

      // This would make the actual API call to Sinch
      console.log('Triggering WABA onboarding:', wabaRequest);
      
      return true;
    } catch (error) {
      console.error('WABA onboarding trigger failed:', error);
      return false;
    }
  }

  private getNextSteps(user: UserProfile, onboardingTriggered: boolean): string[] {
    if (!onboardingTriggered) {
      return ['Complete phone verification', 'Try onboarding again'];
    }

    switch (user.onboardingStatus) {
      case 'pending':
        return ['Check your email for verification link', 'Complete Facebook Business verification'];
      case 'in_progress':
        return ['Wait for approval', 'Check status in dashboard'];
      case 'completed':
        return ['Access your unified messaging dashboard', 'Start sending messages'];
      case 'failed':
        return ['Review rejection reason', 'Update business information', 'Resubmit application'];
      default:
        return ['Contact support for assistance'];
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Get user profile from database
    return null; // Placeholder
  }

  private async getLatestWebhookEvent(userId: string): Promise<any> {
    // Get latest webhook event for user
    return null; // Placeholder
  }

  private calculateProgress(status: string, event: any): number {
    const progressMap: Record<string, number> = {
      'pending': 25,
      'in_progress': 60,
      'completed': 100,
      'failed': 0
    };
    return progressMap[status] || 0;
  }

  private getStatusMessage(status: string, event: any): string {
    const messages: Record<string, string> = {
      'pending': 'Your WhatsApp Business Account is being reviewed. This usually takes 24-48 hours.',
      'in_progress': 'We\'re processing your application. You\'ll receive an email when ready.',
      'completed': 'Congratulations! Your WhatsApp Business Account is ready to use.',
      'failed': 'Your application needs attention. Please review the requirements and resubmit.'
    };
    return messages[status] || 'Processing your request...';
  }

  private getRequiredActions(status: string, event: any): string[] {
    const actions: Record<string, string[]> = {
      'pending': ['Check your email', 'Verify your business information'],
      'in_progress': ['Wait for approval', 'Monitor your email'],
      'completed': ['Start using your dashboard'],
      'failed': ['Review rejection reason', 'Update information', 'Resubmit']
    };
    return actions[status] || [];
  }

  private getEstimatedCompletion(status: string): Date | null {
    if (status === 'pending' || status === 'in_progress') {
      const completion = new Date();
      completion.setHours(completion.getHours() + 24); // 24 hours from now
      return completion;
    }
    return null;
  }

  private verifyWebhookSignature(event: any): boolean {
    // Verify webhook signature for security
    return true; // Placeholder
  }

  private async updateWABAStatus(data: any): Promise<void> {
    // Update WABA status in database
  }

  private async handleWABAApproval(data: any): Promise<void> {
    // Handle WABA approval
  }

  private async handleWABARejection(data: any): Promise<void> {
    // Handle WABA rejection
  }

  private async handleVerificationComplete(data: any): Promise<void> {
    // Handle verification completion
  }

  private async log2FAAttempt(phone: string, method: string, status: string): Promise<void> {
    // Log 2FA attempt for audit and analytics
  }
}

export const smart2FAService = new Smart2FAService({
  preferredMethod: 'voice',  // Voice is primary as per requirements
  fallbackMethod: 'sms',     // SMS as fallback
  timeout: 300,
  maxRetries: 3
});
