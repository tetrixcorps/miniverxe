// eSIM Integration Service for TETRIX
// Handles eSIM ordering and activation for applicable services

import { getPriceMapping, requiresESIM } from '../config/stripePriceMapping';

export interface ESIMOrderRequest {
  invoiceId: string;
  customerId: string;
  serviceType: 'healthcare' | 'legal' | 'business';
  planTier: string;
  customerEmail: string;
  customerPhone?: string;
  businessName?: string;
  quantity: number;
  region: string;
  dataPlan: string;
  duration: string;
}

export interface ESIMOrderResult {
  success: boolean;
  orderId?: string;
  trackingId?: string;
  activationCodes?: string[];
  qrCodes?: string[];
  downloadUrls?: string[];
  estimatedDelivery?: Date;
  error?: string;
}

export interface ESIMActivationDetails {
  orderId: string;
  activationCode: string;
  qrCode: string;
  downloadUrl: string;
  deviceInfo: any;
  expiresAt: Date;
}

class ESIMIntegrationService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor() {
    this.apiBaseUrl = process.env.ESIM_API_BASE_URL || 'https://api.esim-provider.com';
    this.apiKey = process.env.ESIM_API_KEY || '';
  }

  /**
   * Check if eSIM ordering is required for a service
   */
  shouldOrderESIM(serviceType: string, planTier: string): boolean {
    // Check if the service requires eSIM based on pricing configuration
    const priceId = `price_${serviceType}_${planTier}`;
    return requiresESIM(priceId);
  }

  /**
   * Create eSIM order for applicable services
   */
  async createESIMOrder(request: ESIMOrderRequest): Promise<ESIMOrderResult> {
    try {
      // Check if eSIM is required for this service
      if (!this.shouldOrderESIM(request.serviceType, request.planTier)) {
        return {
          success: false,
          error: 'eSIM ordering not required for this service'
        };
      }

      // Determine eSIM configuration based on service type
      const esimConfig = this.getESIMConfiguration(request.serviceType, request.planTier);
      
      // Create order payload
      const orderPayload = {
        customerId: request.customerId,
        invoiceId: request.invoiceId,
        serviceType: request.serviceType,
        planTier: request.planTier,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        businessName: request.businessName,
        quantity: request.quantity,
        region: request.region,
        dataPlan: request.dataPlan,
        duration: request.duration,
        esimType: esimConfig.esimType,
        features: esimConfig.features,
        priority: esimConfig.priority
      };

      // Call eSIM ordering API
      const response = await this.callESIMAPI('/orders', 'POST', orderPayload);
      
      if (response.success) {
        return {
          success: true,
          orderId: response.data.orderId,
          trackingId: response.data.trackingId,
          activationCodes: response.data.activationCodes,
          qrCodes: response.data.qrCodes,
          downloadUrls: response.data.downloadUrls,
          estimatedDelivery: new Date(response.data.estimatedDelivery)
        };
      } else {
        return {
          success: false,
          error: response.error || 'eSIM ordering failed'
        };
      }

    } catch (error) {
      console.error('eSIM ordering failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get eSIM activation details
   */
  async getActivationDetails(orderId: string): Promise<ESIMActivationDetails | null> {
    try {
      const response = await this.callESIMAPI(`/orders/${orderId}/activation`, 'GET');
      
      if (response.success) {
        return {
          orderId: response.data.orderId,
          activationCode: response.data.activationCode,
          qrCode: response.data.qrCode,
          downloadUrl: response.data.downloadUrl,
          deviceInfo: response.data.deviceInfo,
          expiresAt: new Date(response.data.expiresAt)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get eSIM activation details:', error);
      return null;
    }
  }

  /**
   * Send eSIM activation details to customer
   */
  async sendActivationDetails(
    customerEmail: string,
    customerPhone: string | undefined,
    activationDetails: ESIMActivationDetails,
    serviceType: string
  ): Promise<{ email: boolean; sms: boolean }> {
    try {
      const results = { email: false, sms: false };

      // Send email with activation details
      if (customerEmail) {
        const emailResult = await this.sendActivationEmail(customerEmail, activationDetails, serviceType);
        results.email = emailResult.success;
      }

      // Send SMS with activation details
      if (customerPhone) {
        const smsResult = await this.sendActivationSMS(customerPhone, activationDetails, serviceType);
        results.sms = smsResult.success;
      }

      return results;
    } catch (error) {
      console.error('Failed to send eSIM activation details:', error);
      return { email: false, sms: false };
    }
  }

  /**
   * Get eSIM configuration based on service type and tier
   */
  private getESIMConfiguration(serviceType: string, planTier: string) {
    const configurations = {
      healthcare: {
        professional: {
          esimType: 'healthcare_professional',
          features: ['voice', 'sms', 'data', 'secure_messaging'],
          priority: 'high'
        },
        enterprise: {
          esimType: 'healthcare_enterprise',
          features: ['voice', 'sms', 'data', 'secure_messaging', 'video_calls', 'priority_support'],
          priority: 'critical'
        }
      },
      legal: {
        midsize: {
          esimType: 'legal_midsize',
          features: ['voice', 'sms', 'data', 'secure_communication'],
          priority: 'high'
        },
        enterprise: {
          esimType: 'legal_enterprise',
          features: ['voice', 'sms', 'data', 'secure_communication', 'video_calls', 'priority_support'],
          priority: 'critical'
        }
      },
      business: {
        starter: {
          esimType: 'business_starter',
          features: ['voice', 'sms', 'data'],
          priority: 'normal'
        },
        professional: {
          esimType: 'business_professional',
          features: ['voice', 'sms', 'data', 'video_calls'],
          priority: 'high'
        },
        enterprise: {
          esimType: 'business_enterprise',
          features: ['voice', 'sms', 'data', 'video_calls', 'priority_support'],
          priority: 'critical'
        },
        custom: {
          esimType: 'business_custom',
          features: ['voice', 'sms', 'data', 'video_calls', 'priority_support', 'custom_features'],
          priority: 'critical'
        }
      }
    };

    return configurations[serviceType as keyof typeof configurations]?.[planTier as keyof typeof configurations[typeof serviceType]] || {
      esimType: 'standard',
      features: ['voice', 'sms', 'data'],
      priority: 'normal'
    };
  }

  /**
   * Call eSIM API
   */
  private async callESIMAPI(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Platform': 'tetrix'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`eSIM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('eSIM API call failed:', error);
      throw error;
    }
  }

  /**
   * Send activation email
   */
  private async sendActivationEmail(
    customerEmail: string,
    activationDetails: ESIMActivationDetails,
    serviceType: string
  ): Promise<{ success: boolean }> {
    try {
      // This would integrate with your notification service
      const { notificationService } = await import('./notificationService');
      
      const subject = `Your TETRIX eSIM Activation Details - ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service`;
      const content = this.generateActivationEmailContent(activationDetails, serviceType);
      
      const result = await notificationService.sendNotification({
        to: customerEmail,
        channel: 'email',
        subject,
        content: {
          html: content.html,
          text: content.text
        },
        attachments: [
          {
            filename: `esim-qr-${activationDetails.orderId}.png`,
            content: activationDetails.qrCode // Base64 encoded QR code
          }
        ]
      });

      return { success: result.success };
    } catch (error) {
      console.error('Failed to send activation email:', error);
      return { success: false };
    }
  }

  /**
   * Send activation SMS
   */
  private async sendActivationSMS(
    customerPhone: string,
    activationDetails: ESIMActivationDetails,
    serviceType: string
  ): Promise<{ success: boolean }> {
    try {
      const { notificationService } = await import('./notificationService');
      
      const message = `🎉 Your TETRIX eSIM is ready! Activation Code: ${activationDetails.activationCode}. Download: ${activationDetails.downloadUrl}. Questions? Reply HELP.`;
      
      const result = await notificationService.sendNotification({
        to: customerPhone,
        channel: 'sms',
        content: message
      });

      return { success: result.success };
    } catch (error) {
      console.error('Failed to send activation SMS:', error);
      return { success: false };
    }
  }

  /**
   * Generate activation email content
   */
  private generateActivationEmailContent(
    activationDetails: ESIMActivationDetails,
    serviceType: string
  ): { html: string; text: string } {
    const serviceName = serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
    
    return {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎉 Your TETRIX eSIM is Ready!</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${serviceName} Service Activation</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151;">Activation Details</h2>
            <p><strong>Order ID:</strong> ${activationDetails.orderId}</p>
            <p><strong>Activation Code:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${activationDetails.activationCode}</code></p>
            <p><strong>Expires:</strong> ${activationDetails.expiresAt.toLocaleDateString()}</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">How to Activate:</h3>
              <ol style="color: #6b7280;">
                <li>Scan the QR code below with your device</li>
                <li>Or manually enter the activation code</li>
                <li>Follow the on-screen instructions</li>
                <li>Your eSIM will be ready to use!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <img src="data:image/png;base64,${activationDetails.qrCode}" alt="eSIM QR Code" style="max-width: 200px; border: 1px solid #e5e7eb; border-radius: 8px;">
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${activationDetails.downloadUrl}" 
                 style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Download eSIM Profile
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
Your TETRIX eSIM is Ready!

Order ID: ${activationDetails.orderId}
Activation Code: ${activationDetails.activationCode}
Expires: ${activationDetails.expiresAt.toLocaleDateString()}

How to Activate:
1. Scan the QR code with your device
2. Or manually enter the activation code
3. Follow the on-screen instructions
4. Your eSIM will be ready to use!

Download eSIM Profile: ${activationDetails.downloadUrl}

Questions? Contact support@tetrixcorp.com
      `
    };
  }
}

// Export singleton instance
export const esimIntegrationService = new ESIMIntegrationService();
