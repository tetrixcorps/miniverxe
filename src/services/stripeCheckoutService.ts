import Stripe from 'stripe';

export interface CheckoutSessionConfig {
  priceId: string;
  customerEmail?: string;
  customerName?: string;
  trialDays: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface TrialUser {
  email: string;
  phoneNumber: string;
  name?: string;
  organization?: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

class StripeCheckoutService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
      typescript: true
    });
  }

  /**
   * Create a Stripe Checkout session with 7-day free trial and card-on-file requirement
   */
  async createTrialCheckoutSession(
    config: CheckoutSessionConfig,
    user: TrialUser
  ): Promise<CheckoutSessionResult> {
    try {
      // Create or retrieve customer
      const customer = await this.findOrCreateCustomer(user);

      // Create checkout session with trial
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customer.id,
        line_items: [
          {
            price: config.priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: config.trialDays,
          metadata: {
            trialUser: 'true',
            userEmail: user.email,
            userPhone: user.phoneNumber,
            organization: user.organization || '',
            ...config.metadata
          }
        },
        payment_method_collection: 'always', // Require payment method upfront
        success_url: config.successUrl,
        cancel_url: config.cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
        metadata: {
          trialUser: 'true',
          userEmail: user.email,
          userPhone: user.phoneNumber,
          organization: user.organization || '',
          ...config.metadata
        }
      });

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url!
      };

    } catch (error) {
      console.error('Failed to create checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create embedded checkout session for seamless integration
   */
  async createEmbeddedCheckoutSession(
    config: CheckoutSessionConfig,
    user: TrialUser
  ): Promise<CheckoutSessionResult> {
    try {
      const customer = await this.findOrCreateCustomer(user);

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customer.id,
        line_items: [
          {
            price: config.priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: config.trialDays,
          metadata: {
            trialUser: 'true',
            userEmail: user.email,
            userPhone: user.phoneNumber,
            organization: user.organization || '',
            ...config.metadata
          }
        },
        payment_method_collection: 'always',
        success_url: config.successUrl,
        cancel_url: config.cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
        ui_mode: 'embedded', // Enable embedded mode
        return_url: config.successUrl,
        metadata: {
          trialUser: 'true',
          userEmail: user.email,
          userPhone: user.phoneNumber,
          organization: user.organization || '',
          ...config.metadata
        }
      });

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url!
      };

    } catch (error) {
      console.error('Failed to create embedded checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Retrieve checkout session details
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error('Failed to retrieve checkout session:', error);
      return null;
    }
  }

  /**
   * Handle successful trial conversion
   */
  async handleTrialConversion(sessionId: string): Promise<{
    success: boolean;
    subscriptionId?: string;
    customerId?: string;
    trialEndDate?: Date;
    error?: string;
  }> {
    try {
      const session = await this.getCheckoutSession(sessionId);
      
      if (!session || !session.subscription) {
        return {
          success: false,
          error: 'Session or subscription not found'
        };
      }

      const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
      
      return {
        success: true,
        subscriptionId: subscription.id,
        customerId: subscription.customer as string,
        trialEndDate: new Date(subscription.trial_end! * 1000)
      };

    } catch (error) {
      console.error('Failed to handle trial conversion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find existing customer or create new one
   */
  private async findOrCreateCustomer(user: TrialUser): Promise<Stripe.Customer> {
    try {
      // Try to find existing customer by email
      const existingCustomers = await this.stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      return await this.stripe.customers.create({
        email: user.email,
        phone: user.phoneNumber,
        name: user.name,
        metadata: {
          phoneNumber: user.phoneNumber,
          organization: user.organization || '',
          trialUser: 'true'
        }
      });

    } catch (error) {
      console.error('Failed to find or create customer:', error);
      throw error;
    }
  }

  /**
   * Get customer's active subscriptions
   */
  async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active'
      });

      return subscriptions.data;
    } catch (error) {
      console.error('Failed to get customer subscriptions:', error);
      return [];
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default StripeCheckoutService;
