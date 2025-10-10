"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createStripeWebhookRoutes;
const express_1 = __importDefault(require("express"));
const StripeWebhookService_1 = require("../services/StripeWebhookService");
const StripeCLIService_1 = require("../services/StripeCLIService");
const stripeModels_1 = require("../models/stripeModels");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
function createStripeWebhookRoutes(prisma, redis, io) {
    const stripeConfig = {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        webhookUrl: process.env.STRIPE_WEBHOOK_URL || 'https://tetrixcorp.com/webhook',
        apiVersion: process.env.STRIPE_API_VERSION || '2024-06-20'
    };
    const stripeWebhookService = new StripeWebhookService_1.StripeWebhookService(prisma, redis, io, stripeConfig);
    const stripeCLIService = new StripeCLIService_1.StripeCLIService({
        webhookUrl: 'http://localhost:4900/api/stripe-webhooks/webhook',
        events: [
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'checkout.session.completed',
            'invoice.payment_succeeded',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted'
        ]
    });
    const dbService = new stripeModels_1.StripeDatabaseService(prisma);
    const requireApiKey = (req, res, next) => {
        const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.STRIPE_WEBHOOK_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
        }
        return next();
    };
    router.get('/health', (req, res) => {
        return res.json({
            status: 'healthy',
            service: 'stripe-webhooks',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    });
    router.post('/webhook', async (req, res) => {
        try {
            const signature = req.headers['stripe-signature'];
            const payload = JSON.stringify(req.body);
            if (!signature) {
                logger_1.default.warn('Missing Stripe signature header');
                return res.status(400).json({ error: 'Missing Stripe signature' });
            }
            const result = await stripeWebhookService.processWebhookEvent(payload, signature);
            if (result.success) {
                logger_1.default.info('Webhook processed successfully', {
                    eventId: result.eventId,
                    eventType: result.eventType
                });
                return res.json({
                    success: true,
                    message: 'Webhook processed successfully',
                    eventId: result.eventId,
                    eventType: result.eventType
                });
            }
            else {
                logger_1.default.error('Webhook processing failed', {
                    eventId: result.eventId,
                    error: result.error
                });
                return res.status(500).json({
                    success: false,
                    error: 'Webhook processing failed',
                    details: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error processing webhook:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    router.get('/events', requireApiKey, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const eventType = req.query.event_type;
            let result;
            if (eventType) {
                result = await dbService.getWebhookEventsByType(eventType, page, limit);
            }
            else {
                result = await dbService.getWebhookEvents(page, limit);
            }
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching webhook events:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch webhook events'
            });
        }
    });
    router.get('/events/:eventId', requireApiKey, async (req, res) => {
        try {
            const { eventId } = req.params;
            const event = await dbService.getWebhookEvent(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Webhook event not found'
                });
            }
            return res.json({
                success: true,
                data: event
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching webhook event ${req.params.eventId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch webhook event'
            });
        }
    });
    router.get('/stats', requireApiKey, async (req, res) => {
        try {
            const stats = await dbService.getWebhookStats();
            return res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching webhook stats:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch webhook statistics'
            });
        }
    });
    router.post('/events/:eventId/retry', requireApiKey, async (req, res) => {
        try {
            const { eventId } = req.params;
            const event = await dbService.getWebhookEvent(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Webhook event not found'
                });
            }
            if (event.processed) {
                return res.status(400).json({
                    success: false,
                    error: 'Event already processed'
                });
            }
            if (event.retry_count >= 3) {
                return res.status(400).json({
                    success: false,
                    error: 'Maximum retry count exceeded'
                });
            }
            await dbService.incrementRetryCount(eventId);
            const result = await stripeWebhookService.processWebhookEvent(JSON.stringify({ id: event.stripe_event_id, type: event.event_type, data: { object: event.data } }), 'retry-signature');
            return res.json({
                success: true,
                message: 'Event retry initiated',
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error retrying webhook event ${req.params.eventId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retry webhook event'
            });
        }
    });
    router.get('/events/failed', requireApiKey, async (req, res) => {
        try {
            const failedEvents = await dbService.getFailedWebhookEvents();
            return res.json({
                success: true,
                data: failedEvents
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching failed webhook events:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch failed webhook events'
            });
        }
    });
    router.post('/cleanup', requireApiKey, async (req, res) => {
        try {
            const daysOld = parseInt(req.body.days_old) || 30;
            const deletedCount = await dbService.cleanupOldEvents(daysOld);
            return res.json({
                success: true,
                message: `Cleaned up ${deletedCount} old webhook events`,
                deletedCount
            });
        }
        catch (error) {
            logger_1.default.error('Error cleaning up webhook events:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to cleanup webhook events'
            });
        }
    });
    router.post('/cli/start', requireApiKey, async (req, res) => {
        try {
            await stripeCLIService.startWebhookForwarding();
            return res.json({
                success: true,
                message: 'Stripe CLI webhook forwarding started',
                status: stripeCLIService.getStatus()
            });
        }
        catch (error) {
            logger_1.default.error('Error starting Stripe CLI:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to start Stripe CLI'
            });
        }
    });
    router.post('/cli/stop', requireApiKey, async (req, res) => {
        try {
            await stripeCLIService.stopWebhookForwarding();
            return res.json({
                success: true,
                message: 'Stripe CLI webhook forwarding stopped',
                status: stripeCLIService.getStatus()
            });
        }
        catch (error) {
            logger_1.default.error('Error stopping Stripe CLI:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to stop Stripe CLI'
            });
        }
    });
    router.get('/cli/status', requireApiKey, async (req, res) => {
        try {
            const status = stripeCLIService.getStatus();
            const isInstalled = await stripeCLIService.isInstalled();
            return res.json({
                success: true,
                data: {
                    ...status,
                    isInstalled
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error getting Stripe CLI status:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get Stripe CLI status'
            });
        }
    });
    router.post('/cli/restart', requireApiKey, async (req, res) => {
        try {
            await stripeCLIService.restart();
            return res.json({
                success: true,
                message: 'Stripe CLI restarted successfully',
                status: stripeCLIService.getStatus()
            });
        }
        catch (error) {
            logger_1.default.error('Error restarting Stripe CLI:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to restart Stripe CLI'
            });
        }
    });
    router.post('/cli/login', requireApiKey, async (req, res) => {
        try {
            await stripeCLIService.login();
            return res.json({
                success: true,
                message: 'Successfully logged into Stripe CLI'
            });
        }
        catch (error) {
            logger_1.default.error('Error logging into Stripe CLI:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to login to Stripe CLI'
            });
        }
    });
    router.get('/cli/events', requireApiKey, async (req, res) => {
        try {
            const events = stripeCLIService.getAvailableTestEvents();
            return res.json({
                success: true,
                data: events
            });
        }
        catch (error) {
            logger_1.default.error('Error getting available test events:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get available test events'
            });
        }
    });
    router.post('/cli/trigger', requireApiKey, async (req, res) => {
        try {
            const { event_type, data } = req.body;
            if (!event_type) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: event_type'
                });
            }
            await stripeCLIService.triggerTestEvent(event_type, data);
            return res.json({
                success: true,
                message: `Test event ${event_type} triggered successfully`
            });
        }
        catch (error) {
            logger_1.default.error('Error triggering test event:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to trigger test event'
            });
        }
    });
    router.post('/cli/trigger-multiple', requireApiKey, async (req, res) => {
        try {
            const { events } = req.body;
            if (!events || !Array.isArray(events)) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing or invalid events array'
                });
            }
            await stripeCLIService.triggerMultipleEvents(events);
            return res.json({
                success: true,
                message: `Triggered ${events.length} test events successfully`
            });
        }
        catch (error) {
            logger_1.default.error('Error triggering multiple test events:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to trigger multiple test events'
            });
        }
    });
    router.get('/cli/secret', requireApiKey, async (req, res) => {
        try {
            const secret = await stripeCLIService.getWebhookSecret();
            return res.json({
                success: true,
                data: { secret }
            });
        }
        catch (error) {
            logger_1.default.error('Error getting webhook secret:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get webhook secret'
            });
        }
    });
    router.get('/payments', requireApiKey, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const customerId = req.query.customer_id;
            let result;
            if (customerId) {
                result = await dbService.getPaymentsByCustomer(customerId, page, limit);
            }
            else {
                result = { payments: [], total: 0, pages: 0 };
            }
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching payments:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch payments'
            });
        }
    });
    router.get('/payments/:paymentId', requireApiKey, async (req, res) => {
        try {
            const { paymentId } = req.params;
            const payment = await dbService.getPayment(paymentId);
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'Payment not found'
                });
            }
            return res.json({
                success: true,
                data: payment
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching payment ${req.params.paymentId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch payment'
            });
        }
    });
    router.get('/customers', requireApiKey, async (req, res) => {
        try {
            return res.json({
                success: true,
                data: { customers: [], total: 0, pages: 0 }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching customers:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch customers'
            });
        }
    });
    router.get('/customers/:customerId', requireApiKey, async (req, res) => {
        try {
            const { customerId } = req.params;
            const customer = await dbService.getCustomer(customerId);
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
            return res.json({
                success: true,
                data: customer
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching customer ${req.params.customerId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch customer'
            });
        }
    });
    router.get('/customers/:customerId/subscriptions', requireApiKey, async (req, res) => {
        try {
            const { customerId } = req.params;
            const subscriptions = await dbService.getSubscriptionsByCustomer(customerId);
            return res.json({
                success: true,
                data: subscriptions
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching subscriptions for customer ${req.params.customerId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch subscriptions'
            });
        }
    });
    router.get('/customers/:customerId/invoices', requireApiKey, async (req, res) => {
        try {
            const { customerId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await dbService.getInvoicesByCustomer(customerId, page, limit);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching invoices for customer ${req.params.customerId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch invoices'
            });
        }
    });
    router.get('/disputes', requireApiKey, async (req, res) => {
        try {
            return res.json({
                success: true,
                data: { disputes: [], total: 0, pages: 0 }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching disputes:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch disputes'
            });
        }
    });
    router.get('/disputes/:disputeId', requireApiKey, async (req, res) => {
        try {
            const { disputeId } = req.params;
            const dispute = await dbService.getDispute(disputeId);
            if (!dispute) {
                return res.status(404).json({
                    success: false,
                    error: 'Dispute not found'
                });
            }
            return res.json({
                success: true,
                data: dispute
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching dispute ${req.params.disputeId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch dispute'
            });
        }
    });
    router.get('/charges/:chargeId/refunds', requireApiKey, async (req, res) => {
        try {
            const { chargeId } = req.params;
            const refunds = await dbService.getRefundsByCharge(chargeId);
            return res.json({
                success: true,
                data: refunds
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching refunds for charge ${req.params.chargeId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch refunds'
            });
        }
    });
    return router;
}
//# sourceMappingURL=stripe-webhooks.js.map