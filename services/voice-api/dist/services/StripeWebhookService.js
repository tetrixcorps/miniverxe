"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const logger_1 = __importDefault(require("../utils/logger"));
class StripeWebhookService {
    constructor(prisma, redis, io, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.io = io;
        this.config = config;
        this.stripe = new stripe_1.default(config.secretKey, {
            apiVersion: config.apiVersion,
            typescript: true
        });
    }
    verifyWebhookSignature(payload, signature) {
        try {
            const webhookSecret = this.config.webhookSecret;
            if (!webhookSecret) {
                logger_1.default.warn('No webhook secret configured, skipping signature verification');
                return true;
            }
            const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            return !!event;
        }
        catch (error) {
            logger_1.default.error('Webhook signature verification failed:', error);
            return false;
        }
    }
    async processWebhookEvent(payload, signature) {
        try {
            if (!this.verifyWebhookSignature(payload, signature)) {
                throw new Error('Invalid webhook signature');
            }
            const event = JSON.parse(payload.toString());
            logger_1.default.info(`Processing Stripe webhook: ${event.type}`, {
                eventId: event.id,
                eventType: event.type,
                livemode: event.livemode
            });
            const isProcessed = await this.isEventProcessed(event.id);
            if (isProcessed) {
                logger_1.default.info(`Event ${event.id} already processed, skipping`);
                return {
                    success: true,
                    eventId: event.id,
                    eventType: event.type,
                    processedAt: new Date()
                };
            }
            await this.logWebhookEvent(event);
            const result = await this.handleWebhookEvent(event);
            await this.markEventAsProcessed(event.id);
            this.io.emit('stripe_webhook_event', {
                eventId: event.id,
                eventType: event.type,
                data: event.data.object,
                timestamp: new Date().toISOString()
            });
            return {
                success: true,
                eventId: event.id,
                eventType: event.type,
                processedAt: new Date()
            };
        }
        catch (error) {
            logger_1.default.error('Error processing webhook event:', error);
            return {
                success: false,
                eventId: 'unknown',
                eventType: 'unknown',
                processedAt: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async handleWebhookEvent(event) {
        const { type, data } = event;
        switch (type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentIntentSucceeded(data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentIntentFailed(data.object);
                break;
            case 'payment_intent.canceled':
                await this.handlePaymentIntentCanceled(data.object);
                break;
            case 'payment_intent.requires_action':
                await this.handlePaymentIntentRequiresAction(data.object);
                break;
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(data.object);
                break;
            case 'checkout.session.expired':
                await this.handleCheckoutSessionExpired(data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(data.object);
                break;
            case 'invoice.created':
                await this.handleInvoiceCreated(data.object);
                break;
            case 'invoice.updated':
                await this.handleInvoiceUpdated(data.object);
                break;
            case 'customer.created':
                await this.handleCustomerCreated(data.object);
                break;
            case 'customer.updated':
                await this.handleCustomerUpdated(data.object);
                break;
            case 'customer.deleted':
                await this.handleCustomerDeleted(data.object);
                break;
            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(data.object);
                break;
            case 'customer.subscription.trial_will_end':
                await this.handleSubscriptionTrialWillEnd(data.object);
                break;
            case 'payment_method.attached':
                await this.handlePaymentMethodAttached(data.object);
                break;
            case 'payment_method.detached':
                await this.handlePaymentMethodDetached(data.object);
                break;
            case 'payment_method.updated':
                await this.handlePaymentMethodUpdated(data.object);
                break;
            case 'charge.dispute.created':
                await this.handleDisputeCreated(data.object);
                break;
            case 'charge.dispute.updated':
                await this.handleDisputeUpdated(data.object);
                break;
            case 'charge.dispute.closed':
                await this.handleDisputeClosed(data.object);
                break;
            case 'charge.refunded':
                await this.handleChargeRefunded(data.object);
                break;
            case 'account.updated':
                await this.handleAccountUpdated(data.object);
                break;
            case 'capability.updated':
                await this.handleCapabilityUpdated(data.object);
                break;
            default:
                logger_1.default.info(`Unhandled Stripe webhook event type: ${type}`);
        }
    }
    async handlePaymentIntentSucceeded(paymentIntent) {
        logger_1.default.info('Payment succeeded:', { paymentIntentId: paymentIntent.id });
        await this.updatePaymentStatus(paymentIntent.id, 'succeeded', paymentIntent);
        await this.processSuccessfulPayment(paymentIntent);
        await this.sendPaymentConfirmation(paymentIntent);
    }
    async handlePaymentIntentFailed(paymentIntent) {
        logger_1.default.info('Payment failed:', { paymentIntentId: paymentIntent.id });
        await this.updatePaymentStatus(paymentIntent.id, 'failed', paymentIntent);
        await this.processFailedPayment(paymentIntent);
        await this.sendPaymentFailureNotification(paymentIntent);
    }
    async handlePaymentIntentCanceled(paymentIntent) {
        logger_1.default.info('Payment canceled:', { paymentIntentId: paymentIntent.id });
        await this.updatePaymentStatus(paymentIntent.id, 'canceled', paymentIntent);
        await this.processCanceledPayment(paymentIntent);
    }
    async handlePaymentIntentRequiresAction(paymentIntent) {
        logger_1.default.info('Payment requires action:', { paymentIntentId: paymentIntent.id });
        await this.updatePaymentStatus(paymentIntent.id, 'requires_action', paymentIntent);
        await this.processPaymentRequiresAction(paymentIntent);
    }
    async handleCheckoutSessionCompleted(session) {
        logger_1.default.info('Checkout session completed:', { sessionId: session.id });
        const sessionWithLineItems = await this.stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items', 'payment_intent'] });
        await this.processCompletedOrder(sessionWithLineItems);
        await this.updateOrderStatus(session.metadata?.order_id, 'completed');
    }
    async handleCheckoutSessionExpired(session) {
        logger_1.default.info('Checkout session expired:', { sessionId: session.id });
        await this.updateOrderStatus(session.metadata?.order_id, 'expired');
        await this.processExpiredSession(session);
    }
    async handleInvoicePaymentSucceeded(invoice) {
        logger_1.default.info('Invoice payment succeeded:', { invoiceId: invoice.id });
        await this.updateInvoiceStatus(invoice.id, 'paid', invoice);
        await this.processInvoicePayment(invoice);
    }
    async handleInvoicePaymentFailed(invoice) {
        logger_1.default.info('Invoice payment failed:', { invoiceId: invoice.id });
        await this.updateInvoiceStatus(invoice.id, 'payment_failed', invoice);
        await this.processInvoicePaymentFailure(invoice);
    }
    async handleInvoiceCreated(invoice) {
        logger_1.default.info('Invoice created:', { invoiceId: invoice.id });
        await this.createInvoiceRecord(invoice);
    }
    async handleInvoiceUpdated(invoice) {
        logger_1.default.info('Invoice updated:', { invoiceId: invoice.id });
        await this.updateInvoiceRecord(invoice);
    }
    async handleCustomerCreated(customer) {
        logger_1.default.info('Customer created:', { customerId: customer.id });
        await this.createCustomerRecord(customer);
    }
    async handleCustomerUpdated(customer) {
        logger_1.default.info('Customer updated:', { customerId: customer.id });
        await this.updateCustomerRecord(customer);
    }
    async handleCustomerDeleted(customer) {
        logger_1.default.info('Customer deleted:', { customerId: customer.id });
        await this.deleteCustomerRecord(customer.id);
    }
    async handleSubscriptionCreated(subscription) {
        logger_1.default.info('Subscription created:', { subscriptionId: subscription.id });
        await this.createSubscriptionRecord(subscription);
        await this.processNewSubscription(subscription);
    }
    async handleSubscriptionUpdated(subscription) {
        logger_1.default.info('Subscription updated:', { subscriptionId: subscription.id });
        await this.updateSubscriptionRecord(subscription);
        await this.processSubscriptionUpdate(subscription);
    }
    async handleSubscriptionDeleted(subscription) {
        logger_1.default.info('Subscription deleted:', { subscriptionId: subscription.id });
        await this.updateSubscriptionRecord(subscription);
        await this.processSubscriptionCancellation(subscription);
    }
    async handleSubscriptionTrialWillEnd(subscription) {
        logger_1.default.info('Subscription trial will end:', { subscriptionId: subscription.id });
        await this.processTrialEndingNotification(subscription);
    }
    async handlePaymentMethodAttached(paymentMethod) {
        logger_1.default.info('Payment method attached:', { paymentMethodId: paymentMethod.id });
        await this.createPaymentMethodRecord(paymentMethod);
    }
    async handlePaymentMethodDetached(paymentMethod) {
        logger_1.default.info('Payment method detached:', { paymentMethodId: paymentMethod.id });
        await this.deletePaymentMethodRecord(paymentMethod.id);
    }
    async handlePaymentMethodUpdated(paymentMethod) {
        logger_1.default.info('Payment method updated:', { paymentMethodId: paymentMethod.id });
        await this.updatePaymentMethodRecord(paymentMethod);
    }
    async handleDisputeCreated(dispute) {
        logger_1.default.info('Dispute created:', { disputeId: dispute.id });
        await this.createDisputeRecord(dispute);
        await this.processDisputeCreated(dispute);
    }
    async handleDisputeUpdated(dispute) {
        logger_1.default.info('Dispute updated:', { disputeId: dispute.id });
        await this.updateDisputeRecord(dispute);
        await this.processDisputeUpdate(dispute);
    }
    async handleDisputeClosed(dispute) {
        logger_1.default.info('Dispute closed:', { disputeId: dispute.id });
        await this.updateDisputeRecord(dispute);
        await this.processDisputeClosed(dispute);
    }
    async handleChargeRefunded(charge) {
        logger_1.default.info('Charge refunded:', { chargeId: charge.id });
        await this.createRefundRecord(charge);
        await this.processRefund(charge);
    }
    async handleAccountUpdated(account) {
        logger_1.default.info('Account updated:', { accountId: account.id });
        await this.updateAccountRecord(account);
    }
    async handleCapabilityUpdated(capability) {
        logger_1.default.info('Capability updated:', { capabilityId: capability.id });
        await this.updateCapabilityRecord(capability);
    }
    async logWebhookEvent(event) {
        try {
            await this.prisma.stripeWebhookEvent.create({
                data: {
                    stripe_event_id: event.id,
                    event_type: event.type,
                    livemode: event.livemode,
                    data: event.data.object,
                    processed: false,
                    created_at: new Date(event.created * 1000)
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error logging webhook event:', error);
        }
    }
    async isEventProcessed(eventId) {
        try {
            const event = await this.prisma.stripeWebhookEvent.findUnique({
                where: { stripe_event_id: eventId }
            });
            return event?.processed || false;
        }
        catch (error) {
            logger_1.default.error('Error checking event processing status:', error);
            return false;
        }
    }
    async markEventAsProcessed(eventId) {
        try {
            await this.prisma.stripeWebhookEvent.update({
                where: { stripe_event_id: eventId },
                data: { processed: true, processed_at: new Date() }
            });
        }
        catch (error) {
            logger_1.default.error('Error marking event as processed:', error);
        }
    }
    async updatePaymentStatus(paymentIntentId, status, paymentIntent) {
        logger_1.default.info(`Updating payment status: ${paymentIntentId} -> ${status}`);
    }
    async processSuccessfulPayment(paymentIntent) {
        logger_1.default.info(`Processing successful payment: ${paymentIntent.id}`);
    }
    async processFailedPayment(paymentIntent) {
        logger_1.default.info(`Processing failed payment: ${paymentIntent.id}`);
    }
    async processCanceledPayment(paymentIntent) {
        logger_1.default.info(`Processing canceled payment: ${paymentIntent.id}`);
    }
    async processPaymentRequiresAction(paymentIntent) {
        logger_1.default.info(`Processing payment requires action: ${paymentIntent.id}`);
    }
    async processCompletedOrder(session) {
        logger_1.default.info(`Processing completed order: ${session.id}`);
    }
    async processExpiredSession(session) {
        logger_1.default.info(`Processing expired session: ${session.id}`);
    }
    async updateOrderStatus(orderId, status) {
        if (!orderId)
            return;
        logger_1.default.info(`Updating order status: ${orderId} -> ${status}`);
    }
    async updateInvoiceStatus(invoiceId, status, invoice) {
        logger_1.default.info(`Updating invoice status: ${invoiceId} -> ${status}`);
    }
    async processInvoicePayment(invoice) {
        logger_1.default.info(`Processing invoice payment: ${invoice.id}`);
    }
    async processInvoicePaymentFailure(invoice) {
        logger_1.default.info(`Processing invoice payment failure: ${invoice.id}`);
    }
    async createInvoiceRecord(invoice) {
        logger_1.default.info(`Creating invoice record: ${invoice.id}`);
    }
    async updateInvoiceRecord(invoice) {
        logger_1.default.info(`Updating invoice record: ${invoice.id}`);
    }
    async createCustomerRecord(customer) {
        logger_1.default.info(`Creating customer record: ${customer.id}`);
    }
    async updateCustomerRecord(customer) {
        logger_1.default.info(`Updating customer record: ${customer.id}`);
    }
    async deleteCustomerRecord(customerId) {
        logger_1.default.info(`Deleting customer record: ${customerId}`);
    }
    async createSubscriptionRecord(subscription) {
        logger_1.default.info(`Creating subscription record: ${subscription.id}`);
    }
    async updateSubscriptionRecord(subscription) {
        logger_1.default.info(`Updating subscription record: ${subscription.id}`);
    }
    async processNewSubscription(subscription) {
        logger_1.default.info(`Processing new subscription: ${subscription.id}`);
    }
    async processSubscriptionUpdate(subscription) {
        logger_1.default.info(`Processing subscription update: ${subscription.id}`);
    }
    async processSubscriptionCancellation(subscription) {
        logger_1.default.info(`Processing subscription cancellation: ${subscription.id}`);
    }
    async processTrialEndingNotification(subscription) {
        logger_1.default.info(`Processing trial ending notification: ${subscription.id}`);
    }
    async createPaymentMethodRecord(paymentMethod) {
        logger_1.default.info(`Creating payment method record: ${paymentMethod.id}`);
    }
    async deletePaymentMethodRecord(paymentMethodId) {
        logger_1.default.info(`Deleting payment method record: ${paymentMethodId}`);
    }
    async updatePaymentMethodRecord(paymentMethod) {
        logger_1.default.info(`Updating payment method record: ${paymentMethod.id}`);
    }
    async createDisputeRecord(dispute) {
        logger_1.default.info(`Creating dispute record: ${dispute.id}`);
    }
    async updateDisputeRecord(dispute) {
        logger_1.default.info(`Updating dispute record: ${dispute.id}`);
    }
    async processDisputeCreated(dispute) {
        logger_1.default.info(`Processing dispute created: ${dispute.id}`);
    }
    async processDisputeUpdate(dispute) {
        logger_1.default.info(`Processing dispute update: ${dispute.id}`);
    }
    async processDisputeClosed(dispute) {
        logger_1.default.info(`Processing dispute closed: ${dispute.id}`);
    }
    async createRefundRecord(charge) {
        logger_1.default.info(`Creating refund record: ${charge.id}`);
    }
    async processRefund(charge) {
        logger_1.default.info(`Processing refund: ${charge.id}`);
    }
    async updateAccountRecord(account) {
        logger_1.default.info(`Updating account record: ${account.id}`);
    }
    async updateCapabilityRecord(capability) {
        logger_1.default.info(`Updating capability record: ${capability.id}`);
    }
    async sendPaymentConfirmation(paymentIntent) {
        logger_1.default.info(`Sending payment confirmation: ${paymentIntent.id}`);
    }
    async sendPaymentFailureNotification(paymentIntent) {
        logger_1.default.info(`Sending payment failure notification: ${paymentIntent.id}`);
    }
    async getWebhookEvents(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [events, total] = await Promise.all([
                this.prisma.stripeWebhookEvent.findMany({
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }
                }),
                this.prisma.stripeWebhookEvent.count()
            ]);
            return {
                events,
                total,
                pages: Math.ceil(total / limit),
                current_page: page
            };
        }
        catch (error) {
            logger_1.default.error('Error fetching webhook events:', error);
            throw error;
        }
    }
    async getWebhookEventById(eventId) {
        try {
            return await this.prisma.stripeWebhookEvent.findUnique({
                where: { stripe_event_id: eventId }
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching webhook event ${eventId}:`, error);
            throw error;
        }
    }
    async getWebhookStats() {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const [total, processed, failed, todayCount] = await Promise.all([
                this.prisma.stripeWebhookEvent.count(),
                this.prisma.stripeWebhookEvent.count({ where: { processed: true } }),
                this.prisma.stripeWebhookEvent.count({ where: { processed: false } }),
                this.prisma.stripeWebhookEvent.count({
                    where: { created_at: { gte: today } }
                })
            ]);
            return {
                total,
                processed,
                failed,
                todayCount,
                successRate: total > 0 ? (processed / total) * 100 : 0
            };
        }
        catch (error) {
            logger_1.default.error('Error fetching webhook stats:', error);
            throw error;
        }
    }
}
exports.StripeWebhookService = StripeWebhookService;
//# sourceMappingURL=StripeWebhookService.js.map