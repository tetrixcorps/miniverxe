import { PrismaClient } from '@prisma/client';
export interface StripeWebhookEvent {
    id: number;
    stripe_event_id: string;
    event_type: string;
    livemode: boolean;
    data: any;
    processed: boolean;
    processed_at?: Date;
    created_at: Date;
    error_message?: string;
    retry_count: number;
}
export interface StripePayment {
    id: string;
    payment_intent_id: string;
    customer_id?: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    metadata?: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}
export interface StripeCustomer {
    id: string;
    stripe_customer_id: string;
    email?: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}
export interface StripeSubscription {
    id: string;
    stripe_subscription_id: string;
    customer_id: string;
    status: string;
    current_period_start: Date;
    current_period_end: Date;
    cancel_at_period_end: boolean;
    canceled_at?: Date;
    metadata?: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}
export interface StripeInvoice {
    id: string;
    stripe_invoice_id: string;
    customer_id: string;
    subscription_id?: string;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: string;
    paid: boolean;
    due_date?: Date;
    metadata?: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}
export interface StripeDispute {
    id: string;
    stripe_dispute_id: string;
    charge_id: string;
    amount: number;
    currency: string;
    reason: string;
    status: string;
    evidence_due_by?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface StripeRefund {
    id: string;
    stripe_refund_id: string;
    charge_id: string;
    amount: number;
    currency: string;
    reason?: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}
export interface StripeWebhookStats {
    total: number;
    processed: number;
    failed: number;
    todayCount: number;
    successRate: number;
    eventTypes: Record<string, number>;
    last24Hours: number;
    last7Days: number;
    last30Days: number;
}
export declare class StripeDatabaseService {
    private prisma;
    constructor(prisma: PrismaClient);
    createWebhookEvent(eventData: Partial<StripeWebhookEvent>): Promise<StripeWebhookEvent>;
    updateWebhookEvent(eventId: string, updateData: Partial<StripeWebhookEvent>): Promise<StripeWebhookEvent>;
    getWebhookEvent(eventId: string): Promise<StripeWebhookEvent | null>;
    getWebhookEvents(page?: number, limit?: number): Promise<{
        events: StripeWebhookEvent[];
        total: number;
        pages: number;
    }>;
    getWebhookEventsByType(eventType: string, page?: number, limit?: number): Promise<{
        events: StripeWebhookEvent[];
        total: number;
        pages: number;
    }>;
    getFailedWebhookEvents(): Promise<StripeWebhookEvent[]>;
    incrementRetryCount(eventId: string): Promise<void>;
    createPayment(paymentData: Partial<StripePayment>): Promise<StripePayment>;
    updatePayment(paymentId: string, updateData: Partial<StripePayment>): Promise<StripePayment>;
    getPayment(paymentId: string): Promise<StripePayment | null>;
    getPaymentsByCustomer(customerId: string, page?: number, limit?: number): Promise<{
        payments: StripePayment[];
        total: number;
        pages: number;
    }>;
    createCustomer(customerData: Partial<StripeCustomer>): Promise<StripeCustomer>;
    updateCustomer(customerId: string, updateData: Partial<StripeCustomer>): Promise<StripeCustomer>;
    getCustomer(customerId: string): Promise<StripeCustomer | null>;
    getCustomerByStripeId(stripeCustomerId: string): Promise<StripeCustomer | null>;
    deleteCustomer(customerId: string): Promise<void>;
    createSubscription(subscriptionData: Partial<StripeSubscription>): Promise<StripeSubscription>;
    updateSubscription(subscriptionId: string, updateData: Partial<StripeSubscription>): Promise<StripeSubscription>;
    getSubscription(subscriptionId: string): Promise<StripeSubscription | null>;
    getSubscriptionsByCustomer(customerId: string): Promise<StripeSubscription[]>;
    createInvoice(invoiceData: Partial<StripeInvoice>): Promise<StripeInvoice>;
    updateInvoice(invoiceId: string, updateData: Partial<StripeInvoice>): Promise<StripeInvoice>;
    getInvoice(invoiceId: string): Promise<StripeInvoice | null>;
    getInvoicesByCustomer(customerId: string, page?: number, limit?: number): Promise<{
        invoices: StripeInvoice[];
        total: number;
        pages: number;
    }>;
    createDispute(disputeData: Partial<StripeDispute>): Promise<StripeDispute>;
    updateDispute(disputeId: string, updateData: Partial<StripeDispute>): Promise<StripeDispute>;
    getDispute(disputeId: string): Promise<StripeDispute | null>;
    createRefund(refundData: Partial<StripeRefund>): Promise<StripeRefund>;
    getRefund(refundId: string): Promise<StripeRefund | null>;
    getRefundsByCharge(chargeId: string): Promise<StripeRefund[]>;
    getWebhookStats(): Promise<StripeWebhookStats>;
    private getEventTypeCounts;
    cleanupOldEvents(daysOld?: number): Promise<number>;
    getUnprocessedEvents(): Promise<StripeWebhookEvent[]>;
    markEventAsProcessed(eventId: string, errorMessage?: string): Promise<void>;
    markEventAsFailed(eventId: string, errorMessage: string): Promise<void>;
}
//# sourceMappingURL=stripeModels.d.ts.map