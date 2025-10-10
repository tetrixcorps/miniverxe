import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { Server } from 'socket.io';
export interface StripeWebhookEvent {
    id: string;
    type: string;
    data: {
        object: any;
    };
    created: number;
    livemode: boolean;
    pending_webhooks: number;
    request?: {
        id: string;
        idempotency_key: string;
    };
}
export interface StripeWebhookConfig {
    secretKey: string;
    webhookSecret: string;
    webhookUrl: string;
    apiVersion: string;
}
export interface WebhookProcessingResult {
    success: boolean;
    eventId: string;
    eventType: string;
    processedAt: Date;
    error?: string;
}
export declare class StripeWebhookService {
    private stripe;
    private prisma;
    private redis;
    private io;
    private config;
    constructor(prisma: PrismaClient, redis: ReturnType<typeof createClient>, io: Server, config: StripeWebhookConfig);
    verifyWebhookSignature(payload: string | Buffer, signature: string): boolean;
    processWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookProcessingResult>;
    private handleWebhookEvent;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handlePaymentIntentCanceled;
    private handlePaymentIntentRequiresAction;
    private handleCheckoutSessionCompleted;
    private handleCheckoutSessionExpired;
    private handleInvoicePaymentSucceeded;
    private handleInvoicePaymentFailed;
    private handleInvoiceCreated;
    private handleInvoiceUpdated;
    private handleCustomerCreated;
    private handleCustomerUpdated;
    private handleCustomerDeleted;
    private handleSubscriptionCreated;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handleSubscriptionTrialWillEnd;
    private handlePaymentMethodAttached;
    private handlePaymentMethodDetached;
    private handlePaymentMethodUpdated;
    private handleDisputeCreated;
    private handleDisputeUpdated;
    private handleDisputeClosed;
    private handleChargeRefunded;
    private handleAccountUpdated;
    private handleCapabilityUpdated;
    private logWebhookEvent;
    private isEventProcessed;
    private markEventAsProcessed;
    private updatePaymentStatus;
    private processSuccessfulPayment;
    private processFailedPayment;
    private processCanceledPayment;
    private processPaymentRequiresAction;
    private processCompletedOrder;
    private processExpiredSession;
    private updateOrderStatus;
    private updateInvoiceStatus;
    private processInvoicePayment;
    private processInvoicePaymentFailure;
    private createInvoiceRecord;
    private updateInvoiceRecord;
    private createCustomerRecord;
    private updateCustomerRecord;
    private deleteCustomerRecord;
    private createSubscriptionRecord;
    private updateSubscriptionRecord;
    private processNewSubscription;
    private processSubscriptionUpdate;
    private processSubscriptionCancellation;
    private processTrialEndingNotification;
    private createPaymentMethodRecord;
    private deletePaymentMethodRecord;
    private updatePaymentMethodRecord;
    private createDisputeRecord;
    private updateDisputeRecord;
    private processDisputeCreated;
    private processDisputeUpdate;
    private processDisputeClosed;
    private createRefundRecord;
    private processRefund;
    private updateAccountRecord;
    private updateCapabilityRecord;
    private sendPaymentConfirmation;
    private sendPaymentFailureNotification;
    getWebhookEvents(page?: number, limit?: number): Promise<any>;
    getWebhookEventById(eventId: string): Promise<any>;
    getWebhookStats(): Promise<any>;
}
//# sourceMappingURL=StripeWebhookService.d.ts.map