"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeDatabaseService = void 0;
class StripeDatabaseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWebhookEvent(eventData) {
        return await this.prisma.stripeWebhookEvent.create({
            data: {
                stripe_event_id: eventData.stripe_event_id,
                event_type: eventData.event_type,
                livemode: eventData.livemode ?? false,
                data: eventData.data || {},
                processed: eventData.processed ?? false,
                processed_at: eventData.processed_at,
                error_message: eventData.error_message,
                retry_count: eventData.retry_count ?? 0,
                created_at: eventData.created_at || new Date()
            }
        });
    }
    async updateWebhookEvent(eventId, updateData) {
        return await this.prisma.stripeWebhookEvent.update({
            where: { stripe_event_id: eventId },
            data: {
                processed: updateData.processed,
                processed_at: updateData.processed_at,
                error_message: updateData.error_message,
                retry_count: updateData.retry_count
            }
        });
    }
    async getWebhookEvent(eventId) {
        return await this.prisma.stripeWebhookEvent.findUnique({
            where: { stripe_event_id: eventId }
        });
    }
    async getWebhookEvents(page = 1, limit = 20) {
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
            pages: Math.ceil(total / limit)
        };
    }
    async getWebhookEventsByType(eventType, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            this.prisma.stripeWebhookEvent.findMany({
                where: { event_type: eventType },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.stripeWebhookEvent.count({
                where: { event_type: eventType }
            })
        ]);
        return {
            events,
            total,
            pages: Math.ceil(total / limit)
        };
    }
    async getFailedWebhookEvents() {
        return await this.prisma.stripeWebhookEvent.findMany({
            where: {
                processed: false,
                retry_count: { lt: 3 }
            },
            orderBy: { created_at: 'asc' }
        });
    }
    async incrementRetryCount(eventId) {
        await this.prisma.stripeWebhookEvent.update({
            where: { stripe_event_id: eventId },
            data: {
                retry_count: { increment: 1 }
            }
        });
    }
    async createPayment(paymentData) {
        return await this.prisma.stripePayment.create({
            data: {
                id: paymentData.id,
                payment_intent_id: paymentData.payment_intent_id,
                customer_id: paymentData.customer_id,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: paymentData.status,
                description: paymentData.description,
                metadata: paymentData.metadata || {},
                created_at: paymentData.created_at || new Date(),
                updated_at: paymentData.updated_at || new Date()
            }
        });
    }
    async updatePayment(paymentId, updateData) {
        return await this.prisma.stripePayment.update({
            where: { id: paymentId },
            data: {
                status: updateData.status,
                metadata: updateData.metadata,
                updated_at: new Date()
            }
        });
    }
    async getPayment(paymentId) {
        return await this.prisma.stripePayment.findUnique({
            where: { id: paymentId }
        });
    }
    async getPaymentsByCustomer(customerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.stripePayment.findMany({
                where: { customer_id: customerId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.stripePayment.count({
                where: { customer_id: customerId }
            })
        ]);
        return {
            payments,
            total,
            pages: Math.ceil(total / limit)
        };
    }
    async createCustomer(customerData) {
        return await this.prisma.stripeCustomer.create({
            data: {
                id: customerData.id,
                stripe_customer_id: customerData.stripe_customer_id,
                email: customerData.email,
                name: customerData.name,
                phone: customerData.phone,
                metadata: customerData.metadata || {},
                created_at: customerData.created_at || new Date(),
                updated_at: customerData.updated_at || new Date()
            }
        });
    }
    async updateCustomer(customerId, updateData) {
        return await this.prisma.stripeCustomer.update({
            where: { id: customerId },
            data: {
                email: updateData.email,
                name: updateData.name,
                phone: updateData.phone,
                metadata: updateData.metadata,
                updated_at: new Date()
            }
        });
    }
    async getCustomer(customerId) {
        return await this.prisma.stripeCustomer.findUnique({
            where: { id: customerId }
        });
    }
    async getCustomerByStripeId(stripeCustomerId) {
        return await this.prisma.stripeCustomer.findUnique({
            where: { stripe_customer_id: stripeCustomerId }
        });
    }
    async deleteCustomer(customerId) {
        await this.prisma.stripeCustomer.delete({
            where: { id: customerId }
        });
    }
    async createSubscription(subscriptionData) {
        return await this.prisma.stripeSubscription.create({
            data: {
                id: subscriptionData.id,
                stripe_subscription_id: subscriptionData.stripe_subscription_id,
                customer_id: subscriptionData.customer_id,
                status: subscriptionData.status,
                current_period_start: subscriptionData.current_period_start,
                current_period_end: subscriptionData.current_period_end,
                cancel_at_period_end: subscriptionData.cancel_at_period_end ?? false,
                canceled_at: subscriptionData.canceled_at,
                metadata: subscriptionData.metadata || {},
                created_at: subscriptionData.created_at || new Date(),
                updated_at: subscriptionData.updated_at || new Date()
            }
        });
    }
    async updateSubscription(subscriptionId, updateData) {
        return await this.prisma.stripeSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: updateData.status,
                current_period_start: updateData.current_period_start,
                current_period_end: updateData.current_period_end,
                cancel_at_period_end: updateData.cancel_at_period_end,
                canceled_at: updateData.canceled_at,
                metadata: updateData.metadata,
                updated_at: new Date()
            }
        });
    }
    async getSubscription(subscriptionId) {
        return await this.prisma.stripeSubscription.findUnique({
            where: { id: subscriptionId }
        });
    }
    async getSubscriptionsByCustomer(customerId) {
        return await this.prisma.stripeSubscription.findMany({
            where: { customer_id: customerId },
            orderBy: { created_at: 'desc' }
        });
    }
    async createInvoice(invoiceData) {
        return await this.prisma.stripeInvoice.create({
            data: {
                id: invoiceData.id,
                stripe_invoice_id: invoiceData.stripe_invoice_id,
                customer_id: invoiceData.customer_id,
                subscription_id: invoiceData.subscription_id,
                amount_paid: invoiceData.amount_paid,
                amount_due: invoiceData.amount_due,
                currency: invoiceData.currency,
                status: invoiceData.status,
                paid: invoiceData.paid ?? false,
                due_date: invoiceData.due_date,
                metadata: invoiceData.metadata || {},
                created_at: invoiceData.created_at || new Date(),
                updated_at: invoiceData.updated_at || new Date()
            }
        });
    }
    async updateInvoice(invoiceId, updateData) {
        return await this.prisma.stripeInvoice.update({
            where: { id: invoiceId },
            data: {
                amount_paid: updateData.amount_paid,
                amount_due: updateData.amount_due,
                status: updateData.status,
                paid: updateData.paid,
                due_date: updateData.due_date,
                metadata: updateData.metadata,
                updated_at: new Date()
            }
        });
    }
    async getInvoice(invoiceId) {
        return await this.prisma.stripeInvoice.findUnique({
            where: { id: invoiceId }
        });
    }
    async getInvoicesByCustomer(customerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [invoices, total] = await Promise.all([
            this.prisma.stripeInvoice.findMany({
                where: { customer_id: customerId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.stripeInvoice.count({
                where: { customer_id: customerId }
            })
        ]);
        return {
            invoices,
            total,
            pages: Math.ceil(total / limit)
        };
    }
    async createDispute(disputeData) {
        return await this.prisma.stripeDispute.create({
            data: {
                id: disputeData.id,
                stripe_dispute_id: disputeData.stripe_dispute_id,
                charge_id: disputeData.charge_id,
                amount: disputeData.amount,
                currency: disputeData.currency,
                reason: disputeData.reason,
                status: disputeData.status,
                evidence_due_by: disputeData.evidence_due_by,
                created_at: disputeData.created_at || new Date(),
                updated_at: disputeData.updated_at || new Date()
            }
        });
    }
    async updateDispute(disputeId, updateData) {
        return await this.prisma.stripeDispute.update({
            where: { id: disputeId },
            data: {
                status: updateData.status,
                evidence_due_by: updateData.evidence_due_by,
                updated_at: new Date()
            }
        });
    }
    async getDispute(disputeId) {
        return await this.prisma.stripeDispute.findUnique({
            where: { id: disputeId }
        });
    }
    async createRefund(refundData) {
        return await this.prisma.stripeRefund.create({
            data: {
                id: refundData.id,
                stripe_refund_id: refundData.stripe_refund_id,
                charge_id: refundData.charge_id,
                amount: refundData.amount,
                currency: refundData.currency,
                reason: refundData.reason,
                status: refundData.status,
                created_at: refundData.created_at || new Date(),
                updated_at: refundData.updated_at || new Date()
            }
        });
    }
    async getRefund(refundId) {
        return await this.prisma.stripeRefund.findUnique({
            where: { id: refundId }
        });
    }
    async getRefundsByCharge(chargeId) {
        return await this.prisma.stripeRefund.findMany({
            where: { charge_id: chargeId },
            orderBy: { created_at: 'desc' }
        });
    }
    async getWebhookStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [total, processed, failed, todayCount, last24Hours, last7Days, last30Days, eventTypes] = await Promise.all([
            this.prisma.stripeWebhookEvent.count(),
            this.prisma.stripeWebhookEvent.count({ where: { processed: true } }),
            this.prisma.stripeWebhookEvent.count({ where: { processed: false } }),
            this.prisma.stripeWebhookEvent.count({
                where: { created_at: { gte: today } }
            }),
            this.prisma.stripeWebhookEvent.count({
                where: { created_at: { gte: yesterday } }
            }),
            this.prisma.stripeWebhookEvent.count({
                where: { created_at: { gte: weekAgo } }
            }),
            this.prisma.stripeWebhookEvent.count({
                where: { created_at: { gte: monthAgo } }
            }),
            this.getEventTypeCounts()
        ]);
        return {
            total,
            processed,
            failed,
            todayCount,
            successRate: total > 0 ? (processed / total) * 100 : 0,
            eventTypes,
            last24Hours,
            last7Days,
            last30Days
        };
    }
    async getEventTypeCounts() {
        const events = await this.prisma.stripeWebhookEvent.groupBy({
            by: ['event_type'],
            _count: {
                event_type: true
            }
        });
        const eventTypes = {};
        events.forEach((event) => {
            eventTypes[event.event_type] = event._count.event_type;
        });
        return eventTypes;
    }
    async cleanupOldEvents(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.prisma.stripeWebhookEvent.deleteMany({
            where: {
                created_at: { lt: cutoffDate },
                processed: true
            }
        });
        return result.count;
    }
    async getUnprocessedEvents() {
        return await this.prisma.stripeWebhookEvent.findMany({
            where: {
                processed: false,
                retry_count: { lt: 3 }
            },
            orderBy: { created_at: 'asc' },
            take: 100
        });
    }
    async markEventAsProcessed(eventId, errorMessage) {
        await this.prisma.stripeWebhookEvent.update({
            where: { stripe_event_id: eventId },
            data: {
                processed: true,
                processed_at: new Date(),
                error_message: errorMessage
            }
        });
    }
    async markEventAsFailed(eventId, errorMessage) {
        await this.prisma.stripeWebhookEvent.update({
            where: { stripe_event_id: eventId },
            data: {
                retry_count: { increment: 1 },
                error_message: errorMessage
            }
        });
    }
}
exports.StripeDatabaseService = StripeDatabaseService;
//# sourceMappingURL=stripeModels.js.map