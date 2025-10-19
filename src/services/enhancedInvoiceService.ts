// Enhanced Invoice Service for TETRIX Dual Delivery System
// Handles invoice delivery for Healthcare, Legal, and Business services

import Stripe from 'stripe';
import { notificationService } from './notificationService';
import { stripeTrialService } from './stripeTrialService';

// Service type definitions based on pricing page
export type ServiceType = 'healthcare' | 'legal' | 'business';
export type HealthcareTier = 'individual' | 'small' | 'professional' | 'enterprise';
export type LegalTier = 'solo' | 'small' | 'midsize' | 'enterprise';
export type BusinessTier = 'starter' | 'professional' | 'enterprise' | 'custom';

// Service mapping based on pricing page
export const SERVICE_MAPPING = {
  healthcare: {
    individual: {
      name: 'Individual Practice',
      basePrice: 150,
      period: 'per provider/month',
      description: '1-4 Providers',
      features: [
        '2,000 AI voice sessions/month',
        'Basic benefit verification',
        'Appointment scheduling',
        'Patient communication',
        'Basic EHR integration',
        'HIPAA compliance',
        'Email support'
      ]
    },
    small: {
      name: 'Small Practice',
      basePrice: 200,
      perProvider: 100,
      period: 'base + $100/provider',
      description: '5-49 Providers',
      features: [
        '5,000 AI voice sessions/month',
        'Prior authorization assistance',
        'Prescription follow-up automation',
        'Appointment scheduling',
        'Up to 2 EHR integrations',
        'Basic workflows',
        'Email support'
      ]
    },
    professional: {
      name: 'Professional',
      basePrice: 500,
      perProvider: 75,
      period: 'base + $75/provider',
      description: '50-499 Providers',
      features: [
        '10,000 AI voice sessions/month',
        'Advanced prior authorization',
        'Prescription follow-up automation',
        'Up to 5 EHR integrations',
        'Advanced analytics & reporting',
        'Priority support + phone',
        'Standard integrations'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      basePrice: 2000,
      perProvider: 50,
      period: 'base + $50/provider',
      description: '500+ Providers',
      features: [
        'Unlimited AI voice sessions',
        'Unlimited EHR integrations',
        'Custom healthcare workflows',
        'Advanced analytics & reporting',
        '24/7 dedicated support',
        'Dedicated account manager',
        'White-label options'
      ]
    }
  },
  legal: {
    solo: {
      name: 'Solo Practice',
      basePrice: 150,
      period: 'per attorney/month',
      description: '1-4 Attorneys',
      features: [
        '2,000 AI legal assistant sessions/month',
        'Basic case management',
        'Document generation',
        'Client communication',
        'Time tracking and billing',
        'Attorney-client privilege protection',
        'Email support'
      ]
    },
    small: {
      name: 'Small Firm',
      basePrice: 500,
      perAttorney: 125,
      period: 'base + $125/attorney',
      description: '5-24 Attorneys',
      features: [
        '5,000 AI legal assistant sessions/month',
        'Case management automation',
        'Document generation',
        'Client communication workflows',
        'Time tracking and billing',
        'Basic legal research',
        'Email support'
      ]
    },
    midsize: {
      name: 'Mid-Size Firm',
      basePrice: 1000,
      perAttorney: 100,
      period: 'base + $100/attorney',
      description: '25-99 Attorneys',
      features: [
        '10,000 AI legal assistant sessions/month',
        'Advanced case management',
        'Document generation',
        'Legal research integration',
        'Client communication workflows',
        'Conflict checking',
        'Priority support + phone'
      ]
    },
    enterprise: {
      name: 'Enterprise Law Firm',
      basePrice: 3000,
      perAttorney: 75,
      period: 'base + $75/attorney',
      description: '100+ Attorneys',
      features: [
        'Unlimited AI legal assistant sessions',
        'Advanced case management automation',
        'Document generation and automation',
        'Legal research integration',
        'Advanced analytics and reporting',
        '24/7 dedicated support',
        'Dedicated account manager'
      ]
    }
  },
  business: {
    starter: {
      name: 'Starter',
      basePrice: 99,
      period: 'per month',
      description: 'Small businesses, startups (1-10 employees)',
      features: [
        '1,000 voice minutes included',
        '1,000 SMS messages included',
        '500 2FA attempts included',
        '2 toll-free numbers',
        'Basic AI workflow automation',
        'Email support',
        'Basic analytics'
      ]
    },
    professional: {
      name: 'Professional',
      basePrice: 299,
      period: 'per month',
      description: 'Growing businesses (11-100 employees)',
      features: [
        '5,000 voice minutes included',
        '5,000 SMS messages included',
        '2,500 2FA attempts included',
        '5 toll-free numbers',
        'Advanced AI automation + data labeling',
        'Priority support + phone',
        'Advanced analytics'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      basePrice: 799,
      period: 'per month',
      description: 'Large enterprises (100+ employees)',
      features: [
        '15,000 voice minutes included',
        '15,000 SMS messages included',
        '7,500 2FA attempts included',
        '15 toll-free numbers',
        'Full AI suite + custom models',
        'Dedicated account manager',
        'Real-time analytics'
      ]
    },
    custom: {
      name: 'Custom Enterprise',
      basePrice: 0,
      period: 'custom pricing',
      description: 'Fortune 500, government, high-volume',
      features: [
        'Unlimited usage with volume discounts',
        'Custom pricing based on usage',
        'Dedicated infrastructure',
        '24/7 support with SLA guarantees',
        'Custom AI model training',
        'White-label options',
        'Custom integrations'
      ]
    }
  }
};

export interface ServiceDetails {
  serviceType: ServiceType;
  tier: string;
  planName: string;
  basePrice: number;
  perUnitPrice?: number;
  unitCount?: number;
  period: string;
  description: string;
  features: string[];
  isTrialConversion: boolean;
  requiresESIM: boolean;
}

export interface DeliveryResult {
  customerDelivery: {
    email: any;
    sms?: any;
  };
  internalDelivery: any;
  esimOrdering?: any;
  serviceDetails: ServiceDetails;
}

class EnhancedInvoiceService {
  private stripe: Stripe;
  private notificationService: any;
  private internalEmail: string = 'support@tetrixcorp.com';

  constructor(stripe: Stripe, notificationService: any) {
    this.stripe = stripe;
    this.notificationService = notificationService;
  }

  /**
   * Main method to handle payment success and deliver invoices
   */
  async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<DeliveryResult> {
    try {
      // 1. Retrieve customer data
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
      if (!customerId) {
        throw new Error('Invoice customer ID not found');
      }
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      
      // 2. Analyze service details from invoice
      const serviceDetails = await this.analyzeServiceDetails(invoice);
      
      // 3. Execute dual delivery pipeline
      const deliveryResults = await this.executeDualDeliveryPipeline(invoice, customer, serviceDetails);
      
      // 4. Log delivery results
      await this.logDeliveryResults(invoice.id, deliveryResults);
      
      return deliveryResults;
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      await this.handlePaymentError(invoice, error);
      throw error;
    }
  }

  /**
   * Analyze service details from Stripe invoice
   */
  private async analyzeServiceDetails(invoice: Stripe.Invoice): Promise<ServiceDetails> {
    // Extract service information from invoice metadata or line items
    const metadata = invoice.metadata || {};
    const serviceType = metadata.service_type as ServiceType || 'business';
    const tier = metadata.plan_tier || 'starter';
    const isTrialConversion = metadata.trial_conversion === 'true';
    const unitCount = parseInt(metadata.unit_count || '1');
    
    // Get service configuration
    const serviceConfig = SERVICE_MAPPING[serviceType][tier as keyof typeof SERVICE_MAPPING[ServiceType]];
    
    return {
      serviceType,
      tier,
      planName: serviceConfig.name,
      basePrice: serviceConfig.basePrice,
      perUnitPrice: (serviceConfig as any).perUnitPrice || (serviceConfig as any).perProvider || (serviceConfig as any).perAttorney || 0,
      unitCount,
      period: serviceConfig.period,
      description: serviceConfig.description,
      features: serviceConfig.features,
      isTrialConversion,
      requiresESIM: this.shouldTriggerESIM(serviceType, tier)
    };
  }

  /**
   * Execute dual delivery pipeline
   */
  private async executeDualDeliveryPipeline(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ): Promise<DeliveryResult> {
    
    console.error('🔍 executeDualDeliveryPipeline - Customer data:', {
      email: customer.email,
      phone: customer.phone,
      hasEmail: !!customer.email,
      hasPhone: !!customer.phone
    });
    
    const deliveryPromises = [
      // Customer email delivery
      this.sendCustomerInvoice(invoice, customer, serviceDetails),
      
      // Customer SMS delivery (if phone available)
      customer.phone ? this.sendCustomerSMS(invoice, customer, serviceDetails) : null,
      
      // Internal notification
      this.sendInternalInvoice(invoice, customer, serviceDetails),
      
      // eSIM ordering (if applicable)
      serviceDetails.requiresESIM ? this.triggerESIMOrdering(invoice, serviceDetails) : null
    ];
    
    console.error('🔍 Delivery promises count:', deliveryPromises.filter(Boolean).length);
    console.error('🔍 SMS promise included:', !!customer.phone);
    
    const results = await Promise.allSettled(deliveryPromises.filter(Boolean));
    
    console.error('🔍 Promise results:', results.map((r, i) => ({
      index: i,
      status: r.status,
      hasValue: r.status === 'fulfilled' ? !!r.value : false,
      hasReason: r.status === 'rejected' ? !!r.reason : false
    })));
    
    return this.processDeliveryResults(results, serviceDetails);
  }

  /**
   * Send invoice to customer via email
   */
  private async sendCustomerInvoice(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ): Promise<any> {
    console.error('🔍 sendCustomerInvoice - Customer email check:', {
      hasCustomer: !!customer,
      hasEmail: !!customer?.email,
      email: customer?.email
    });
    
    if (!customer || !customer.email) {
      console.error('❌ sendCustomerInvoice - Throwing error: Customer email is required');
      throw new Error('Customer email is required for invoice delivery');
    }
    
    console.error('✅ sendCustomerInvoice - Proceeding with email delivery');
    
    const template = this.getCustomerInvoiceTemplate(invoice, customer, serviceDetails);
    
    return await this.notificationService.sendNotification({
      to: customer.email,
      channel: 'email',
      subject: template.subject,
      content: template.content,
      attachments: template.attachments,
      metadata: {
        invoiceId: invoice.id,
        serviceType: serviceDetails.serviceType,
        planTier: serviceDetails.tier
      }
    });
  }

  /**
   * Send invoice summary to customer via SMS
   */
  private async sendCustomerSMS(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ): Promise<any> {
    console.error('🔍 sendCustomerSMS - Customer phone check:', {
      hasCustomer: !!customer,
      hasPhone: !!customer?.phone,
      phone: customer?.phone
    });
    
    const template = this.getCustomerSMSTemplate(invoice, customer, serviceDetails);
    
    return await this.notificationService.sendNotification({
      to: customer.phone!,
      channel: 'sms',
      content: template.message,
      metadata: {
        invoiceId: invoice.id,
        serviceType: serviceDetails.serviceType
      }
    });
  }

  /**
   * Send internal invoice copy to support team
   */
  private async sendInternalInvoice(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ): Promise<any> {
    const template = this.getInternalInvoiceTemplate(invoice, customer, serviceDetails);
    
    return await this.notificationService.sendNotification({
      to: this.internalEmail,
      channel: 'email',
      subject: template.subject,
      content: template.content,
      attachments: template.attachments,
      metadata: {
        invoiceId: invoice.id,
        customerId: customer.id,
        serviceType: serviceDetails.serviceType,
        planTier: serviceDetails.tier,
        amount: invoice.amount_paid,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Trigger eSIM ordering if applicable
   */
  private async triggerESIMOrdering(
    invoice: Stripe.Invoice,
    serviceDetails: ServiceDetails
  ): Promise<any> {
    try {
      // Import eSIM integration service
      const { esimIntegrationService } = await import('./esimIntegrationService');
      
      // Check if eSIM ordering is required
      if (!esimIntegrationService.shouldOrderESIM(serviceDetails.serviceType, serviceDetails.tier)) {
        return {
          success: true,
          message: 'eSIM ordering not required for this service'
        };
      }

      // Get customer data
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
      if (!customerId) {
        throw new Error('Invoice customer ID not found');
      }
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      
      // Create eSIM order request
      const esimOrderRequest = {
        invoiceId: invoice.id,
        customerId: customer.id,
        serviceType: serviceDetails.serviceType,
        planTier: serviceDetails.tier,
        customerEmail: customer.email!,
        customerPhone: customer.phone || undefined,
        businessName: customer.metadata?.businessName || customer.name || undefined,
        quantity: serviceDetails.unitCount || 1,
        region: 'US', // Default region, could be from customer metadata
        dataPlan: this.getDataPlanForService(serviceDetails),
        duration: this.getDurationForService(serviceDetails)
      };

      // Create eSIM order
      const esimResult = await esimIntegrationService.createESIMOrder(esimOrderRequest);
      
      if (esimResult.success) {
        // Send activation details to customer
        const activationDetails = await esimIntegrationService.getActivationDetails(esimResult.orderId!);
        if (activationDetails) {
          await esimIntegrationService.sendActivationDetails(
            customer.email!,
            customer.phone || undefined,
            activationDetails,
            serviceDetails.serviceType
          );
        }
      }

      return esimResult;

    } catch (error) {
      console.error('eSIM ordering failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get data plan for service
   */
  private getDataPlanForService(serviceDetails: ServiceDetails): string {
    const dataPlans = {
      healthcare: {
        professional: 'Healthcare Professional - 10GB',
        enterprise: 'Healthcare Enterprise - Unlimited'
      },
      legal: {
        midsize: 'Legal Midsize - 15GB',
        enterprise: 'Legal Enterprise - Unlimited'
      },
      business: {
        starter: 'Business Starter - 5GB',
        professional: 'Business Professional - 20GB',
        enterprise: 'Business Enterprise - Unlimited',
        custom: 'Custom Enterprise - Unlimited'
      }
    };

    return dataPlans[serviceDetails.serviceType]?.[serviceDetails.tier as keyof typeof dataPlans[typeof serviceDetails.serviceType]] || 'Standard - 5GB';
  }

  /**
   * Get duration for service
   */
  private getDurationForService(serviceDetails: ServiceDetails): string {
    // Most services are monthly, but this could be configurable
    return '30 days';
  }

  /**
   * Determine if eSIM ordering should be triggered
   */
  private shouldTriggerESIM(serviceType: ServiceType, tier: string): boolean {
    // eSIM ordering is typically for business services or specific healthcare/legal plans
    return serviceType === 'business' || 
           (serviceType === 'healthcare' && ['professional', 'enterprise'].includes(tier)) ||
           (serviceType === 'legal' && ['midsize', 'enterprise'].includes(tier));
  }

  /**
   * Get customer invoice email template
   */
  private getCustomerInvoiceTemplate(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ) {
    const amount = (invoice.amount_paid / 100).toFixed(2);
    const serviceName = `${serviceDetails.serviceType.charAt(0).toUpperCase() + serviceDetails.serviceType.slice(1)} ${serviceDetails.planName}`;
    
    return {
      subject: `Your TETRIX Invoice - ${serviceName} - $${amount}`,
      content: {
        html: this.generateCustomerInvoiceHTML(invoice, customer, serviceDetails, amount),
        text: this.generateCustomerInvoiceText(invoice, customer, serviceDetails, amount)
      },
      attachments: [
        {
          filename: `tetrix-invoice-${invoice.id}.pdf`,
          content: `Invoice PDF content for ${invoice.id}` // This would be actual PDF content
        }
      ]
    };
  }

  /**
   * Get customer SMS template
   */
  private getCustomerSMSTemplate(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ) {
    const amount = (invoice.amount_paid / 100).toFixed(2);
    
    return {
      message: `🎉 Payment confirmed! Your TETRIX ${serviceDetails.planName} subscription is now active. Amount: $${amount}. Check your email for detailed invoice. Questions? Reply HELP.`
    };
  }

  /**
   * Get internal invoice template
   */
  private getInternalInvoiceTemplate(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails
  ) {
    const amount = (invoice.amount_paid / 100).toFixed(2);
    const serviceName = `${serviceDetails.serviceType.charAt(0).toUpperCase() + serviceDetails.serviceType.slice(1)} ${serviceDetails.planName}`;
    
    return {
      subject: `💰 New Payment: $${amount} - ${serviceName}`,
      content: {
        html: this.generateInternalInvoiceHTML(invoice, customer, serviceDetails, amount),
        text: this.generateInternalInvoiceText(invoice, customer, serviceDetails, amount)
      },
      attachments: [
        {
          filename: `tetrix-invoice-${invoice.id}.pdf`,
          content: `Invoice PDF content for ${invoice.id}`
        }
      ]
    };
  }

  /**
   * Generate customer invoice HTML
   */
  private generateCustomerInvoiceHTML(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails,
    amount: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to TETRIX!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Your ${serviceDetails.planName} subscription is now active</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="color: #374151; margin-top: 0;">Invoice Details</h2>
          <p><strong>Invoice ID:</strong> ${invoice.id}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Service:</strong> ${serviceDetails.description}</p>
          <p><strong>Billing Period:</strong> ${serviceDetails.period}</p>
          
          <h3 style="color: #374151;">What's Included:</h3>
          <ul style="color: #6b7280;">
            ${serviceDetails.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://tetrixcorp.com/dashboard" 
               style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate customer invoice text
   */
  private generateCustomerInvoiceText(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails,
    amount: string
  ): string {
    return `
Welcome to TETRIX!

Your ${serviceDetails.planName} subscription is now active.

Invoice Details:
- Invoice ID: ${invoice.id}
- Amount: $${amount}
- Service: ${serviceDetails.description}
- Billing Period: ${serviceDetails.period}

What's Included:
${serviceDetails.features.map(feature => `- ${feature}`).join('\n')}

Access your dashboard: https://tetrixcorp.com/dashboard

Questions? Contact support@tetrixcorp.com
    `;
  }

  /**
   * Generate internal invoice HTML
   */
  private generateInternalInvoiceHTML(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails,
    amount: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🎉 New Payment Received</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">TETRIX Payment Notification</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h3 style="color: #374151; margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${customer.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${customer.email}</p>
              <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
              <p><strong>Customer ID:</strong> ${customer.id}</p>
            </div>
            
            <div>
              <h3 style="color: #374151; margin-top: 0;">Payment Details</h3>
              <p><strong>Amount:</strong> $${amount}</p>
              <p><strong>Service:</strong> ${serviceDetails.serviceType} - ${serviceDetails.planName}</p>
              <p><strong>Invoice ID:</strong> ${invoice.id}</p>
              <p><strong>Trial Conversion:</strong> ${serviceDetails.isTrialConversion ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Service Status</h3>
            <p><strong>Plan:</strong> ${serviceDetails.description}</p>
            <p><strong>eSIM Ordered:</strong> ${serviceDetails.requiresESIM ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Features:</strong> ${serviceDetails.features.length} included</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://dashboard.stripe.com/invoices/${invoice.id}" 
               style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Stripe Dashboard
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate internal invoice text
   */
  private generateInternalInvoiceText(
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    serviceDetails: ServiceDetails,
    amount: string
  ): string {
    return `
New Payment Received - TETRIX

Customer: ${customer.name || 'N/A'} (${customer.email})
Phone: ${customer.phone || 'N/A'}
Customer ID: ${customer.id}

Amount: $${amount}
Service: ${serviceDetails.serviceType} - ${serviceDetails.planName}
Invoice ID: ${invoice.id}
Trial Conversion: ${serviceDetails.isTrialConversion ? 'Yes' : 'No'}

Plan: ${serviceDetails.description}
eSIM Ordered: ${serviceDetails.requiresESIM ? 'Yes' : 'No'}
Features: ${serviceDetails.features.length} included

View in Stripe: https://dashboard.stripe.com/invoices/${invoice.id}
    `;
  }

  /**
   * Process delivery results
   */
  private processDeliveryResults(results: PromiseSettledResult<any>[], serviceDetails: ServiceDetails): DeliveryResult {
    // The results array can have different lengths depending on what promises were included
    // We need to identify which result corresponds to which delivery type
    let customerEmail: PromiseSettledResult<any> | null = null;
    let customerSMS: PromiseSettledResult<any> | null = null;
    let internalEmail: PromiseSettledResult<any> | null = null;
    let esimOrdering: PromiseSettledResult<any> | null = null;
    
    // The first result is always customer email
    if (results.length > 0) {
      customerEmail = results[0];
    }
    
    // Process remaining results based on their content
    for (let i = 1; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        const value = result.value;
        // Identify SMS by channel property
        if (value?.channel === 'sms') {
          customerSMS = result;
        }
        // Identify eSIM by checking for eSIM-specific properties
        else if (value?.orderId || value?.message?.includes('eSIM') || (value?.success !== undefined && !value?.channel)) {
          esimOrdering = result;
        }
        // If it's an email and not customer email, it's internal email
        else if (value?.channel === 'email') {
          internalEmail = result;
        }
      } else {
        // For rejected promises, we need to identify by the error message or context
        const reason = result.reason;
        if (reason?.message?.includes('eSIM') || reason?.message?.includes('ordering')) {
          esimOrdering = result;
        }
      }
    }
    
    return {
      customerDelivery: {
        email: customerEmail?.status === 'fulfilled' ? customerEmail.value : null,
        sms: customerSMS?.status === 'fulfilled' ? customerSMS.value : null
      },
      internalDelivery: internalEmail?.status === 'fulfilled' ? internalEmail.value : null,
      esimOrdering: esimOrdering?.status === 'fulfilled' ? esimOrdering.value : null,
      serviceDetails
    };
  }

  /**
   * Log delivery results
   */
  private async logDeliveryResults(invoiceId: string, results: DeliveryResult): Promise<void> {
    console.log(`Invoice delivery completed for ${invoiceId}:`, {
      customerEmail: results.customerDelivery.email?.success,
      customerSMS: results.customerDelivery.sms?.success,
      internalEmail: results.internalDelivery?.success,
      esimOrdering: results.esimOrdering?.success,
      serviceType: results.serviceDetails.serviceType,
      planTier: results.serviceDetails.tier
    });
  }

  /**
   * Handle payment processing errors
   */
  private async handlePaymentError(invoice: Stripe.Invoice, error: any): Promise<void> {
    console.error(`Payment processing failed for invoice ${invoice.id}:`, error);
    
    // Send alert to support team
    await this.notificationService.sendNotification({
      to: this.internalEmail,
      channel: 'email',
      subject: `🚨 Payment Processing Error - Invoice ${invoice.id}`,
      content: {
        text: `Payment processing failed for invoice ${invoice.id}. Error: ${error.message}`
      }
    });
  }
}

// Export singleton instance
export const enhancedInvoiceService = new EnhancedInvoiceService(
  new Stripe(process.env.STRIPE_SECRET_KEY!),
  notificationService
);
