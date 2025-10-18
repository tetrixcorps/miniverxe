// Stripe Integration for 7-Day Free Trial with Card-on-File Gating
import Stripe from 'stripe';

export interface TrialConfig {
  trialDays: number;
  requireCardOnFile: boolean;
  autoChargeAfterTrial: boolean;
  webhookEndpoint: string;
}

export interface TrialUser {
  id: string;
  email: string;
  phoneNumber: string;
  stripeCustomerId?: string;
  trialStatus: 'not_started' | 'active' | 'expired' | 'converted';
  trialStartDate?: Date;
  trialEndDate?: Date;
  cardOnFile: boolean;
  subscriptionId?: string;
  paymentMethodId?: string;
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

class StripeTrialService {
  private stripe: Stripe;
  private config: TrialConfig;

  constructor(config: TrialConfig) {
    this.config = config;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
      typescript: true
    });
  }

  /**
   * Create customer and start 7-day free trial with card-on-file requirement
   */
  async startFreeTrial(
    user: TrialUser, 
    onboardingData: OnboardingData,
    paymentMethodId: string
  ): Promise<{
    success: boolean;
    customerId: string;
    trialEndDate: Date;
    requiresCardOnFile: boolean;
    error?: string;
  }> {
    try {
      // Create Stripe customer
      const customer = await this.stripe.customers.create({
        email: user.email,
        phone: user.phoneNumber,
        name: onboardingData.businessName,
        metadata: {
          phoneNumber: user.phoneNumber,
          businessName: onboardingData.businessName,
          trialUser: 'true',
          onboardingData: JSON.stringify(onboardingData)
        }
      });

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription with trial period
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_TRIAL_PRICE_ID!, // Free trial price
        }],
        trial_period_days: this.config.trialDays,
        collection_method: 'charge_automatically',
        metadata: {
          trialUser: 'true',
          businessName: onboardingData.businessName,
          phoneNumber: user.phoneNumber
        }
      });

      const trialEndDate = new Date(subscription.trial_end! * 1000);

      return {
        success: true,
        customerId: customer.id,
        trialEndDate,
        requiresCardOnFile: true
      };

    } catch (error) {
      console.error('Failed to start free trial:', error);
      return {
        success: false,
        customerId: '',
        trialEndDate: new Date(),
        requiresCardOnFile: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check trial status and handle expiration
   */
  async checkTrialStatus(customerId: string): Promise<{
    status: 'active' | 'expired' | 'converted' | 'cancelled';
    daysRemaining: number;
    trialEndDate: Date;
    subscriptionId?: string;
    requiresAction?: string;
  }> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        return {
          status: 'cancelled',
          daysRemaining: 0,
          trialEndDate: new Date()
        };
      }

      // Get active subscriptions
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length === 0) {
        return {
          status: 'expired',
          daysRemaining: 0,
          trialEndDate: new Date()
        };
      }

      const subscription = subscriptions.data[0];
      const now = new Date();
      const trialEnd = new Date(subscription.trial_end! * 1000);

      if (subscription.status === 'active' && subscription.trial_end) {
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining > 0) {
          return {
            status: 'active',
            daysRemaining,
            trialEndDate: trialEnd,
            subscriptionId: subscription.id
          };
        } else {
          return {
            status: 'expired',
            daysRemaining: 0,
            trialEndDate: trialEnd,
            subscriptionId: subscription.id,
            requiresAction: 'trial_expired'
          };
        }
      } else {
        return {
          status: 'converted',
          daysRemaining: 0,
          trialEndDate: trialEnd,
          subscriptionId: subscription.id
        };
      }

    } catch (error) {
      console.error('Failed to check trial status:', error);
      return {
        status: 'expired',
        daysRemaining: 0,
        trialEndDate: new Date()
      };
    }
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrialToPaid(
    customerId: string,
    priceId: string
  ): Promise<{
    success: boolean;
    subscriptionId?: string;
    error?: string;
  }> {
    try {
      // Get current trial subscription
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length === 0) {
        return {
          success: false,
          error: 'No active subscription found'
        };
      }

      const subscription = subscriptions.data[0];

      // Update subscription to paid plan
      const updatedSubscription = await this.stripe.subscriptions.update(subscription.id, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        trial_end: 'now', // End trial immediately
        metadata: {
          trialUser: 'false',
          convertedAt: new Date().toISOString()
        }
      });

      return {
        success: true,
        subscriptionId: updatedSubscription.id
      };

    } catch (error) {
      console.error('Failed to convert trial to paid:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle trial expiration and send notifications
   */
  async handleTrialExpiration(customerId: string): Promise<void> {
    try {
      const trialStatus = await this.checkTrialStatus(customerId);
      
      if (trialStatus.status === 'expired') {
        // Send expiration notification
        await this.sendTrialExpirationNotification(customerId);
        
        // Optionally cancel subscription if no payment method
        await this.cancelExpiredTrial(customerId);
      }
    } catch (error) {
      console.error('Failed to handle trial expiration:', error);
    }
  }

  /**
   * Create payment intent for card verification (without charging)
   */
  async createPaymentIntentForVerification(
    customerId: string,
    amount: number = 100 // $1.00 in cents
  ): Promise<{
    success: boolean;
    clientSecret?: string;
    error?: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customerId,
        payment_method_types: ['card'],
        capture_method: 'manual', // Don't capture immediately
        metadata: {
          purpose: 'card_verification',
          trialUser: 'true'
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret!
      };

    } catch (error) {
      console.error('Failed to create payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify payment method without charging
   */
  async verifyPaymentMethod(paymentMethodId: string): Promise<{
    success: boolean;
    verified: boolean;
    error?: string;
  }> {
    try {
      // Create a small payment intent to verify the card
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 100, // $1.00
        currency: 'usd',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        capture_method: 'manual'
      });

      // Cancel the payment intent since we only wanted to verify
      await this.stripe.paymentIntents.cancel(paymentIntent.id);

      return {
        success: true,
        verified: true
      };

    } catch (error) {
      console.error('Failed to verify payment method:', error);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }

  // Private helper methods
  private async sendTrialExpirationNotification(customerId: string): Promise<void> {
    // Implementation for sending trial expiration notifications
    console.log(`Sending trial expiration notification to customer: ${customerId}`);
  }

  private async cancelExpiredTrial(customerId: string): Promise<void> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active'
      });

      for (const subscription of subscriptions.data) {
        await this.stripe.subscriptions.cancel(subscription.id);
      }
    } catch (error) {
      console.error('Failed to cancel expired trial:', error);
    }
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Trial will end for subscription: ${subscription.id}`);
    // Send notification to user about trial ending
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription updated: ${subscription.id}`);
    // Handle subscription changes
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Payment failed for invoice: ${invoice.id}`);
    // Handle payment failures
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log(`Subscription deleted: ${subscription.id}`);
    // Handle subscription cancellation
  }
}

export const stripeTrialService = new StripeTrialService({
  trialDays: 7,
  requireCardOnFile: true,
  autoChargeAfterTrial: true,
  webhookEndpoint: '/webhooks/stripe/trial'
});
