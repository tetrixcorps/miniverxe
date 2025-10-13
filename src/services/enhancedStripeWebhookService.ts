// Enhanced Stripe Webhook Service for TETRIX
// Handles all Stripe webhook events with dual invoice delivery

import Stripe from 'stripe';
import { enhancedInvoiceService } from './enhancedInvoiceService';
import { stripeTrialService } from './stripeTrialService';

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}

export interface WebhookProcessingResult {
  success: boolean;
  eventType: string;
  invoiceId?: string;
  customerId?: string;
  error?: string;
  deliveryResults?: any;
}

class EnhancedStripeWebhookService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true
    });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(payload: string, signature: string): Promise<WebhookProcessingResult> {
    try {
      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      console.log(`Processing Stripe webhook: ${event.type}`);

      // Route to appropriate handler
      switch (event.type) {
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        
        case 'invoice.created':
          return await this.handleInvoiceCreated(event.data.object as Stripe.Invoice);
        
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        
        case 'customer.subscription.trial_will_end':
          return await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
        
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        
        case 'payment_intent.succeeded':
          return await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
          return {
            success: true,
            eventType: event.type,
            error: `Unhandled event type: ${event.type}`
          };
      }

    } catch (error) {
      console.error('Webhook processing failed:', error);
      return {
        success: false,
        eventType: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle successful payment - Main trigger for invoice delivery
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<WebhookProcessingResult> {
    try {
      console.log(`Payment succeeded for invoice: ${invoice.id}`);
      
      // Process with enhanced invoice service
      const deliveryResults = await enhancedInvoiceService.handlePaymentSuccess(invoice);
      
      // Update customer status
      await this.updateCustomerStatus(invoice.customer as string, 'active');
      
      // Log payment event
      await this.logPaymentEvent(invoice.customer as string, 'success', invoice.amount_paid);
      
      return {
        success: true,
        eventType: 'invoice.payment_succeeded',
        invoiceId: invoice.id,
        customerId: invoice.customer as string,
        deliveryResults
      };

    } catch (error) {
      console.error('Payment succeeded handling failed:', error);
      return {
        success: false,
        eventType: 'invoice.payment_succeeded',
        invoiceId: invoice.id,
        customerId: invoice.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle invoice creation
   */
  private async handleInvoiceCreated(invoice: Stripe.Invoice): Promise<WebhookProcessingResult> {
    try {
      console.log(`Invoice created: ${invoice.id}`);
      
      // Log invoice creation
      await this.logInvoiceEvent(invoice.id, 'created', invoice.amount_due);
      
      return {
        success: true,
        eventType: 'invoice.created',
        invoiceId: invoice.id,
        customerId: invoice.customer as string
      };

    } catch (error) {
      console.error('Invoice created handling failed:', error);
      return {
        success: false,
        eventType: 'invoice.created',
        invoiceId: invoice.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle subscription creation
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
    try {
      console.log(`Subscription created: ${subscription.id}`);
      
      // Check if this is a trial subscription
      if (subscription.status === 'trialing') {
        await this.handleTrialSubscriptionCreated(subscription);
      }
      
      return {
        success: true,
        eventType: 'customer.subscription.created',
        customerId: subscription.customer as string
      };

    } catch (error) {
      console.error('Subscription created handling failed:', error);
      return {
        success: false,
        eventType: 'customer.subscription.created',
        customerId: subscription.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
    try {
      console.log(`Subscription updated: ${subscription.id}`);
      
      // Handle different subscription status changes
      switch (subscription.status) {
        case 'active':
          await this.handleSubscriptionActivated(subscription);
          break;
        case 'past_due':
          await this.handleSubscriptionPastDue(subscription);
          break;
        case 'canceled':
          await this.handleSubscriptionCanceled(subscription);
          break;
        case 'unpaid':
          await this.handleSubscriptionUnpaid(subscription);
          break;
      }
      
      return {
        success: true,
        eventType: 'customer.subscription.updated',
        customerId: subscription.customer as string
      };

    } catch (error) {
      console.error('Subscription updated handling failed:', error);
      return {
        success: false,
        eventType: 'customer.subscription.updated',
        customerId: subscription.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle trial will end notification
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
    try {
      console.log(`Trial will end for subscription: ${subscription.id}`);
      
      // Send trial expiration notification
      await this.sendTrialExpirationNotification(subscription);
      
      return {
        success: true,
        eventType: 'customer.subscription.trial_will_end',
        customerId: subscription.customer as string
      };

    } catch (error) {
      console.error('Trial will end handling failed:', error);
      return {
        success: false,
        eventType: 'customer.subscription.trial_will_end',
        customerId: subscription.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle subscription deletion
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<WebhookProcessingResult> {
    try {
      console.log(`Subscription deleted: ${subscription.id}`);
      
      // Update customer status
      await this.updateCustomerStatus(subscription.customer as string, 'cancelled');
      
      // Send cancellation notification
      await this.sendCancellationNotification(subscription);
      
      return {
        success: true,
        eventType: 'customer.subscription.deleted',
        customerId: subscription.customer as string
      };

    } catch (error) {
      console.error('Subscription deleted handling failed:', error);
      return {
        success: false,
        eventType: 'customer.subscription.deleted',
        customerId: subscription.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle payment intent succeeded (for one-time payments)
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<WebhookProcessingResult> {
    try {
      console.log(`Payment intent succeeded: ${paymentIntent.id}`);
      
      // For one-time payments, we might need to create an invoice
      if (paymentIntent.invoice) {
        const invoice = await this.stripe.invoices.retrieve(paymentIntent.invoice as string);
        return await this.handlePaymentSucceeded(invoice);
      }
      
      return {
        success: true,
        eventType: 'payment_intent.succeeded',
        customerId: paymentIntent.customer as string
      };

    } catch (error) {
      console.error('Payment intent succeeded handling failed:', error);
      return {
        success: false,
        eventType: 'payment_intent.succeeded',
        customerId: paymentIntent.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<WebhookProcessingResult> {
    try {
      console.log(`Payment failed for invoice: ${invoice.id}`);
      
      // Update customer status
      await this.updateCustomerStatus(invoice.customer as string, 'past_due');
      
      // Send payment failure notification
      await this.sendPaymentFailureNotification(invoice);
      
      // Log payment event
      await this.logPaymentEvent(invoice.customer as string, 'failed', invoice.amount_due);
      
      return {
        success: true,
        eventType: 'invoice.payment_failed',
        invoiceId: invoice.id,
        customerId: invoice.customer as string
      };

    } catch (error) {
      console.error('Payment failed handling failed:', error);
      return {
        success: false,
        eventType: 'invoice.payment_failed',
        invoiceId: invoice.id,
        customerId: invoice.customer as string,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods

  private async updateCustomerStatus(customerId: string, status: string): Promise<void> {
    try {
      await this.stripe.customers.update(customerId, {
        metadata: {
          status,
          lastUpdated: new Date().toISOString()
        }
      });
      console.log(`Updated customer ${customerId} status to ${status}`);
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  }

  private async logPaymentEvent(customerId: string, eventType: string, amount: number): Promise<void> {
    console.log(`Payment event logged: ${eventType} for customer ${customerId}, amount: ${amount}`);
    // This would integrate with your logging system
  }

  private async logInvoiceEvent(invoiceId: string, eventType: string, amount: number): Promise<void> {
    console.log(`Invoice event logged: ${eventType} for invoice ${invoiceId}, amount: ${amount}`);
    // This would integrate with your logging system
  }

  private async handleTrialSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Trial subscription created: ${subscription.id}`);
    // Send welcome email for trial users
  }

  private async handleSubscriptionActivated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription activated: ${subscription.id}`);
    
    // Update customer status to active
    await this.stripe.customers.update(subscription.customer as string, {
      metadata: {
        subscription_status: 'active',
        last_updated: new Date().toISOString()
      }
    });
  }

  private async handleSubscriptionPastDue(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription past due: ${subscription.id}`);
    
    // Update customer status to past due
    await this.stripe.customers.update(subscription.customer as string, {
      metadata: {
        subscription_status: 'past_due',
        last_updated: new Date().toISOString()
      }
    });
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription canceled: ${subscription.id}`);
    
    // Update customer status to canceled
    await this.stripe.customers.update(subscription.customer as string, {
      metadata: {
        subscription_status: 'canceled',
        last_updated: new Date().toISOString()
      }
    });
  }

  private async handleSubscriptionUnpaid(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription unpaid: ${subscription.id}`);
    // Handle unpaid subscription
  }

  private async sendTrialExpirationNotification(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Sending trial expiration notification for subscription: ${subscription.id}`);
    // This would integrate with your notification service
  }

  private async sendCancellationNotification(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Sending cancellation notification for subscription: ${subscription.id}`);
    // This would integrate with your notification service
  }

  private async sendPaymentFailureNotification(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Sending payment failure notification for invoice: ${invoice.id}`);
    // This would integrate with your notification service
  }
}

// Export singleton instance
export const enhancedStripeWebhookService = new EnhancedStripeWebhookService();
