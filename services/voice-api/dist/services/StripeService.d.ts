import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface StripeConfig {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    apiVersion: string;
}
export interface PaymentLinkData {
    amount: number;
    currency: string;
    productName: string;
    customerEmail?: string;
    metadata?: any;
}
export interface CustomerData {
    email: string;
    name?: string;
    phone?: string;
    metadata?: any;
}
export interface SubscriptionData {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
    metadata?: any;
}
export interface BillingInfo {
    customerId: string;
    subscriptionId?: string;
    paymentMethod?: any;
    invoices: any[];
    upcomingInvoice?: any;
    balance: number;
    currency: string;
}
export declare class StripeService {
    private prisma;
    private redis;
    private stripe;
    private config;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    private createPrice;
    createPaymentLink(data: PaymentLinkData): Promise<string>;
    createOrGetCustomer(data: CustomerData): Promise<string>;
    createSubscription(data: SubscriptionData): Promise<string>;
    getBillingInformation(customerId: string): Promise<BillingInfo>;
    processRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<string>;
    updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
    cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<void>;
    getSubscription(subscriptionId: string): Promise<any>;
    createInvoice(customerId: string, items: any[], metadata?: any): Promise<string>;
    processWebhook(payload: string, signature: string): Promise<any>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handleSubscriptionCreated;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handleInvoicePaymentSucceeded;
    private handleInvoicePaymentFailed;
    createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string>;
    getPaymentMethods(customerId: string): Promise<any[]>;
    createSetupIntent(customerId: string): Promise<string>;
    getAccountBalance(): Promise<any>;
    listCustomers(limit?: number, startingAfter?: string): Promise<any[]>;
    searchCustomers(query: string): Promise<any[]>;
}
//# sourceMappingURL=StripeService.d.ts.map