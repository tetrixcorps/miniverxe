import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface AgentSession {
    id: string;
    callId: string;
    userId: string;
    agentType: 'sales' | 'support' | 'billing';
    status: 'active' | 'completed' | 'escalated' | 'failed';
    context: any;
    history: AgentInteraction[];
    startTime: Date;
    lastActivity: Date;
    escalationReason?: string;
}
export interface AgentInteraction {
    id: string;
    timestamp: Date;
    type: 'user_input' | 'agent_response' | 'action_taken' | 'escalation';
    content: string;
    metadata: any;
}
export interface AgentResponse {
    message: string;
    actions: AgentAction[];
    nextStep?: string;
    escalation?: boolean;
    department?: string;
}
export interface AgentAction {
    type: 'speak' | 'gather' | 'transfer' | 'create_payment' | 'send_email' | 'schedule_callback';
    data: any;
}
export interface SalesContext {
    customerName?: string;
    email?: string;
    phone?: string;
    interestedServices: string[];
    budget?: number;
    urgency: 'low' | 'medium' | 'high';
    objections: string[];
    currentStep: 'discovery' | 'presentation' | 'objection_handling' | 'closing' | 'payment' | 'follow_up';
}
export interface SupportContext {
    issueType?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    customerTier: 'basic' | 'premium' | 'enterprise';
    previousTickets: string[];
    resolutionAttempts: number;
    currentStep: 'greeting' | 'issue_identification' | 'troubleshooting' | 'resolution' | 'escalation' | 'follow_up';
}
export interface BillingContext {
    customerId?: string;
    subscriptionId?: string;
    paymentMethod?: string;
    billingIssue?: string;
    amount?: number;
    currency?: string;
    currentStep: 'greeting' | 'issue_identification' | 'resolution' | 'payment_update' | 'refund' | 'escalation';
}
export declare class AgentService {
    private prisma;
    private redis;
    private stripeService;
    private telnyxService;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    setDependencies(stripeService: any, telnyxService: any): void;
    createAgentSession(callId: string, userId: string, agentType: 'sales' | 'support' | 'billing', initialContext?: any): Promise<AgentSession>;
    processInteraction(sessionId: string, userInput: string, metadata?: any): Promise<AgentResponse>;
    private processSalesInteraction;
    private processSupportInteraction;
    private processBillingInteraction;
    private handleServiceInquiry;
    private handlePricingInquiry;
    private handleObjection;
    private handleReadyToBuy;
    private handleActivationIssue;
    private handleConnectionIssue;
    private handleEscalationRequest;
    private handlePaymentIssue;
    private handleRefundRequest;
    private initializeContext;
    private recognizeSalesIntent;
    private recognizeSupportIntent;
    private recognizeBillingIntent;
    private extractServiceInterest;
    private getDynamicPricing;
    private getCurrentPricing;
    private handleCommonObjections;
    private createPaymentLink;
    private getBillingInformation;
    storeAgentSession(session: AgentSession): Promise<void>;
    getAgentSession(sessionId: string): Promise<AgentSession | null>;
    addInteraction(session: AgentSession, type: string, content: string, metadata?: any): Promise<void>;
    updateAgentSession(sessionId: string, updates: Partial<AgentSession>): Promise<void>;
    getAgentStats(userId: string, startDate: Date, endDate: Date): Promise<any>;
    private generateErrorResponse;
    private handleNeedHelp;
    private handleGeneralSales;
    private handleBillingIssue;
    private handleGeneralHelp;
    private handleGeneralSupport;
    private handleSubscriptionQuestion;
    private handlePaymentUpdate;
    private handleInvoiceQuestion;
    private handleGeneralBilling;
}
//# sourceMappingURL=AgentService.d.ts.map