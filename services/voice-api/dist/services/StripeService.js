"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const logger_1 = __importDefault(require("../utils/logger"));
class StripeService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.config = {
            secretKey: process.env.STRIPE_SECRET_KEY || '',
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
            apiVersion: '2023-10-16'
        };
        this.stripe = new stripe_1.default(this.config.secretKey, {
            apiVersion: this.config.apiVersion
        });
    }
    async createPrice(productName, amount, currency) {
        try {
            const price = await this.stripe.prices.create({
                currency,
                unit_amount: Math.round(amount * 100),
                product_data: {
                    name: productName,
                },
            });
            return price.id;
        }
        catch (error) {
            logger_1.default.error('Error creating price:', error);
            throw new Error('Failed to create price');
        }
    }
    async createPaymentLink(data) {
        try {
            const paymentLink = await this.stripe.paymentLinks.create({
                line_items: [
                    {
                        price: await this.createPrice(data.productName, data.amount, data.currency),
                        quantity: 1,
                    },
                ],
                metadata: data.metadata || {},
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        url: `${process.env.FRONTEND_URL}/payment/success`,
                    },
                },
            });
            return paymentLink.url;
        }
        catch (error) {
            console.error('Error creating payment link:', error);
            throw error;
        }
    }
    async createOrGetCustomer(data) {
        try {
            const existingCustomers = await this.stripe.customers.list({
                email: data.email,
                limit: 1
            });
            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0].id;
            }
            const customer = await this.stripe.customers.create({
                email: data.email,
                name: data.name,
                phone: data.phone,
                metadata: data.metadata || {}
            });
            return customer.id;
        }
        catch (error) {
            console.error('Error creating or getting customer:', error);
            throw error;
        }
    }
    async createSubscription(data) {
        try {
            const subscription = await this.stripe.subscriptions.create({
                customer: data.customerId,
                items: [
                    {
                        price: data.priceId,
                    },
                ],
                trial_period_days: data.trialPeriodDays,
                metadata: data.metadata || {},
                expand: ['latest_invoice.payment_intent'],
            });
            return subscription.id;
        }
        catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }
    async getBillingInformation(customerId) {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);
            const subscriptions = await this.stripe.subscriptions.list({
                customer: customerId,
                status: 'all',
                limit: 10
            });
            const invoices = await this.stripe.invoices.list({
                customer: customerId,
                limit: 10
            });
            let upcomingInvoice = null;
            try {
                upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
                    customer: customerId
                });
            }
            catch (error) {
            }
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            return {
                customerId,
                subscriptionId: subscriptions.data[0]?.id,
                paymentMethod: paymentMethods.data[0],
                invoices: invoices.data,
                upcomingInvoice,
                balance: customer.balance || 0,
                currency: customer.currency || 'usd'
            };
        }
        catch (error) {
            console.error('Error getting billing information:', error);
            throw error;
        }
    }
    async processRefund(paymentIntentId, amount, reason) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason: reason
            });
            return refund.id;
        }
        catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }
    async updatePaymentMethod(customerId, paymentMethodId) {
        try {
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
            await this.stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }
        catch (error) {
            console.error('Error updating payment method:', error);
            throw error;
        }
    }
    async cancelSubscription(subscriptionId, immediately = false) {
        try {
            if (immediately) {
                await this.stripe.subscriptions.cancel(subscriptionId);
            }
            else {
                await this.stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true
                });
            }
        }
        catch (error) {
            console.error('Error canceling subscription:', error);
            throw error;
        }
    }
    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        }
        catch (error) {
            console.error('Error getting subscription:', error);
            throw error;
        }
    }
    async createInvoice(customerId, items, metadata) {
        try {
            const invoice = await this.stripe.invoices.create({
                customer: customerId,
                metadata: metadata || {}
            });
            for (const item of items) {
                await this.stripe.invoiceItems.create({
                    customer: customerId,
                    invoice: invoice.id,
                    amount: Math.round(item.amount * 100),
                    currency: item.currency || 'usd',
                    description: item.description
                });
            }
            await this.stripe.invoices.finalizeInvoice(invoice.id);
            await this.stripe.invoices.sendInvoice(invoice.id);
            return invoice.id;
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }
    async processWebhook(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            throw error;
        }
    }
    async handlePaymentSucceeded(paymentIntent) {
        console.log('Payment succeeded:', paymentIntent.id);
    }
    async handlePaymentFailed(paymentIntent) {
        console.log('Payment failed:', paymentIntent.id);
    }
    async handleSubscriptionCreated(subscription) {
        console.log('Subscription created:', subscription.id);
    }
    async handleSubscriptionUpdated(subscription) {
        console.log('Subscription updated:', subscription.id);
    }
    async handleSubscriptionDeleted(subscription) {
        console.log('Subscription deleted:', subscription.id);
    }
    async handleInvoicePaymentSucceeded(invoice) {
        console.log('Invoice payment succeeded:', invoice.id);
    }
    async handleInvoicePaymentFailed(invoice) {
        console.log('Invoice payment failed:', invoice.id);
    }
    async createCustomerPortalSession(customerId, returnUrl) {
        try {
            const session = await this.stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl,
            });
            return session.url;
        }
        catch (error) {
            console.error('Error creating customer portal session:', error);
            throw error;
        }
    }
    async getPaymentMethods(customerId) {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            return paymentMethods.data;
        }
        catch (error) {
            console.error('Error getting payment methods:', error);
            throw error;
        }
    }
    async createSetupIntent(customerId) {
        try {
            const setupIntent = await this.stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
                usage: 'off_session'
            });
            return setupIntent.client_secret || '';
        }
        catch (error) {
            console.error('Error creating setup intent:', error);
            throw error;
        }
    }
    async getAccountBalance() {
        try {
            const balance = await this.stripe.balance.retrieve();
            return balance;
        }
        catch (error) {
            console.error('Error getting account balance:', error);
            throw error;
        }
    }
    async listCustomers(limit = 10, startingAfter) {
        try {
            const customers = await this.stripe.customers.list({
                limit,
                starting_after: startingAfter
            });
            return customers.data;
        }
        catch (error) {
            console.error('Error listing customers:', error);
            throw error;
        }
    }
    async searchCustomers(query) {
        try {
            const customers = await this.stripe.customers.search({
                query: query
            });
            return customers.data;
        }
        catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=StripeService.js.map