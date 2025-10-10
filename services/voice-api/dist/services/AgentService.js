"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const uuid_1 = require("uuid");
class AgentService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    setDependencies(stripeService, telnyxService) {
        this.stripeService = stripeService;
        this.telnyxService = telnyxService;
    }
    async createAgentSession(callId, userId, agentType, initialContext = {}) {
        const session = {
            id: (0, uuid_1.v4)(),
            callId,
            userId,
            agentType,
            status: 'active',
            context: this.initializeContext(agentType, initialContext),
            history: [],
            startTime: new Date(),
            lastActivity: new Date()
        };
        await this.storeAgentSession(session);
        return session;
    }
    async processInteraction(sessionId, userInput, metadata = {}) {
        try {
            const session = await this.getAgentSession(sessionId);
            if (!session) {
                throw new Error('Agent session not found');
            }
            await this.addInteraction(session, 'user_input', userInput, metadata);
            let response;
            switch (session.agentType) {
                case 'sales':
                    response = await this.processSalesInteraction(session, userInput);
                    break;
                case 'support':
                    response = await this.processSupportInteraction(session, userInput);
                    break;
                case 'billing':
                    response = await this.processBillingInteraction(session, userInput);
                    break;
                default:
                    throw new Error('Unknown agent type');
            }
            await this.addInteraction(session, 'agent_response', response.message, { response });
            session.lastActivity = new Date();
            await this.storeAgentSession(session);
            return response;
        }
        catch (error) {
            console.error('Error processing agent interaction:', error);
            return this.generateErrorResponse();
        }
    }
    async processSalesInteraction(session, userInput) {
        const context = session.context;
        const lowerInput = userInput.toLowerCase();
        const intent = this.recognizeSalesIntent(userInput);
        switch (intent) {
            case 'service_inquiry':
                return await this.handleServiceInquiry(session, userInput);
            case 'pricing_inquiry':
                return await this.handlePricingInquiry(session, userInput);
            case 'objection':
                return await this.handleObjection(session, userInput);
            case 'ready_to_buy':
                return await this.handleReadyToBuy(session, userInput);
            case 'need_help':
                return await this.handleNeedHelp(session, userInput);
            default:
                return await this.handleGeneralSales(session, userInput);
        }
    }
    async processSupportInteraction(session, userInput) {
        const context = session.context;
        const lowerInput = userInput.toLowerCase();
        const intent = this.recognizeSupportIntent(userInput);
        switch (intent) {
            case 'activation_issue':
                return await this.handleActivationIssue(session, userInput);
            case 'connection_issue':
                return await this.handleConnectionIssue(session, userInput);
            case 'billing_issue':
                return await this.handleBillingIssue(session, userInput);
            case 'general_help':
                return await this.handleGeneralHelp(session, userInput);
            case 'escalation_request':
                return await this.handleEscalationRequest(session, userInput);
            default:
                return await this.handleGeneralSupport(session, userInput);
        }
    }
    async processBillingInteraction(session, userInput) {
        const context = session.context;
        const lowerInput = userInput.toLowerCase();
        const intent = this.recognizeBillingIntent(userInput);
        switch (intent) {
            case 'payment_issue':
                return await this.handlePaymentIssue(session, userInput);
            case 'subscription_question':
                return await this.handleSubscriptionQuestion(session, userInput);
            case 'refund_request':
                return await this.handleRefundRequest(session, userInput);
            case 'payment_update':
                return await this.handlePaymentUpdate(session, userInput);
            case 'invoice_question':
                return await this.handleInvoiceQuestion(session, userInput);
            default:
                return await this.handleGeneralBilling(session, userInput);
        }
    }
    async handleServiceInquiry(session, userInput) {
        const context = session.context;
        const services = this.extractServiceInterest(userInput);
        context.interestedServices = services;
        context.currentStep = 'presentation';
        const pricing = await this.getDynamicPricing(services);
        return {
            message: `Great! I can help you with ${services.join(' and ')}. Let me show you our current plans and pricing. ${pricing}`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `Great! I can help you with ${services.join(' and ')}. Let me show you our current plans and pricing. ${pricing}`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 10,
                        speechTimeout: 3
                    }
                }
            ],
            nextStep: 'presentation'
        };
    }
    async handlePricingInquiry(session, userInput) {
        const context = session.context;
        const pricing = await this.getCurrentPricing();
        return {
            message: `Here are our current pricing options: ${pricing}. Which plan interests you most?`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `Here are our current pricing options: ${pricing}. Which plan interests you most?`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 10,
                        speechTimeout: 3
                    }
                }
            ],
            nextStep: 'presentation'
        };
    }
    async handleObjection(session, userInput) {
        const context = session.context;
        context.objections.push(userInput);
        context.currentStep = 'objection_handling';
        const objectionResponse = this.handleCommonObjections(userInput);
        return {
            message: objectionResponse,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: objectionResponse,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 10,
                        speechTimeout: 3
                    }
                }
            ],
            nextStep: 'objection_handling'
        };
    }
    async handleReadyToBuy(session, userInput) {
        const context = session.context;
        context.currentStep = 'payment';
        const paymentLink = await this.createPaymentLink(session);
        return {
            message: `Perfect! I'll create a secure payment link for you. You'll receive it via SMS in just a moment.`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `Perfect! I'll create a secure payment link for you. You'll receive it via SMS in just a moment.`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'create_payment',
                    data: {
                        paymentLink,
                        amount: context.budget || 0,
                        currency: 'USD'
                    }
                },
                {
                    type: 'send_email',
                    data: {
                        to: context.email,
                        subject: 'Your TETRIX Payment Link',
                        template: 'payment_link',
                        data: { paymentLink }
                    }
                }
            ],
            nextStep: 'payment'
        };
    }
    async handleActivationIssue(session, userInput) {
        const context = session.context;
        context.issueType = 'activation';
        context.priority = 'high';
        context.currentStep = 'troubleshooting';
        return {
            message: `I'll help you activate your eSIM. Let me guide you through the process step by step. First, do you have the QR code that was sent to you?`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `I'll help you activate your eSIM. Let me guide you through the process step by step. First, do you have the QR code that was sent to you?`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 10,
                        speechTimeout: 3
                    }
                }
            ],
            nextStep: 'troubleshooting'
        };
    }
    async handleConnectionIssue(session, userInput) {
        const context = session.context;
        context.issueType = 'connection';
        context.priority = 'high';
        context.currentStep = 'troubleshooting';
        return {
            message: `I understand you're having connection issues. Let me help you troubleshoot this. Can you tell me what device you're using and what error messages you're seeing?`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `I understand you're having connection issues. Let me help you troubleshoot this. Can you tell me what device you're using and what error messages you're seeing?`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 15,
                        speechTimeout: 5
                    }
                }
            ],
            nextStep: 'troubleshooting'
        };
    }
    async handleEscalationRequest(session, userInput) {
        const context = session.context;
        context.currentStep = 'escalation';
        session.status = 'escalated';
        session.escalationReason = 'user_requested_human_agent';
        return {
            message: `I understand you'd like to speak with a human agent. Let me transfer you to our support team right away.`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `I understand you'd like to speak with a human agent. Let me transfer you to our support team right away.`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'transfer',
                    data: {
                        to: process.env.SUPPORT_PHONE_NUMBER || '+18888046762',
                        reason: 'user_requested_human_agent'
                    }
                }
            ],
            escalation: true,
            department: 'support'
        };
    }
    async handlePaymentIssue(session, userInput) {
        const context = session.context;
        context.billingIssue = 'payment_failed';
        context.currentStep = 'resolution';
        const billingInfo = await this.getBillingInformation(session.userId);
        return {
            message: `I'll help you resolve this payment issue. Let me check your account and payment method. ${billingInfo}`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `I'll help you resolve this payment issue. Let me check your account and payment method. ${billingInfo}`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 10,
                        speechTimeout: 3
                    }
                }
            ],
            nextStep: 'resolution'
        };
    }
    async handleRefundRequest(session, userInput) {
        const context = session.context;
        context.billingIssue = 'refund_request';
        context.currentStep = 'refund';
        return {
            message: `I understand you'd like to request a refund. Let me check your account and recent transactions to see what we can do for you.`,
            actions: [
                {
                    type: 'speak',
                    data: {
                        text: `I understand you'd like to request a refund. Let me check your account and recent transactions to see what we can do for you.`,
                        voice: 'alice'
                    }
                },
                {
                    type: 'gather',
                    data: {
                        input: 'speech',
                        timeout: 10,
                        speechTimeout: 3
                    }
                }
            ],
            nextStep: 'refund'
        };
    }
    initializeContext(agentType, initialContext) {
        switch (agentType) {
            case 'sales':
                return {
                    interestedServices: [],
                    budget: null,
                    urgency: 'medium',
                    objections: [],
                    currentStep: 'discovery',
                    ...initialContext
                };
            case 'support':
                return {
                    priority: 'medium',
                    customerTier: 'basic',
                    previousTickets: [],
                    resolutionAttempts: 0,
                    currentStep: 'greeting',
                    ...initialContext
                };
            case 'billing':
                return {
                    currentStep: 'greeting',
                    ...initialContext
                };
            default:
                return initialContext;
        }
    }
    recognizeSalesIntent(userInput) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('buy') || lowerInput.includes('purchase') || lowerInput.includes('order')) {
            return 'ready_to_buy';
        }
        else if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('how much')) {
            return 'pricing_inquiry';
        }
        else if (lowerInput.includes('expensive') || lowerInput.includes('too much') || lowerInput.includes('cheaper')) {
            return 'objection';
        }
        else if (lowerInput.includes('help') || lowerInput.includes('support')) {
            return 'need_help';
        }
        else if (lowerInput.includes('esim') || lowerInput.includes('data') || lowerInput.includes('plan')) {
            return 'service_inquiry';
        }
        else {
            return 'general_inquiry';
        }
    }
    recognizeSupportIntent(userInput) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('activate') || lowerInput.includes('activation')) {
            return 'activation_issue';
        }
        else if (lowerInput.includes('connect') || lowerInput.includes('connection') || lowerInput.includes('network')) {
            return 'connection_issue';
        }
        else if (lowerInput.includes('bill') || lowerInput.includes('payment') || lowerInput.includes('charge')) {
            return 'billing_issue';
        }
        else if (lowerInput.includes('human') || lowerInput.includes('agent') || lowerInput.includes('representative')) {
            return 'escalation_request';
        }
        else {
            return 'general_help';
        }
    }
    recognizeBillingIntent(userInput) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('payment') && (lowerInput.includes('failed') || lowerInput.includes('problem'))) {
            return 'payment_issue';
        }
        else if (lowerInput.includes('subscription') || lowerInput.includes('renewal')) {
            return 'subscription_question';
        }
        else if (lowerInput.includes('refund') || lowerInput.includes('return')) {
            return 'refund_request';
        }
        else if (lowerInput.includes('update') && lowerInput.includes('payment')) {
            return 'payment_update';
        }
        else if (lowerInput.includes('invoice') || lowerInput.includes('receipt')) {
            return 'invoice_question';
        }
        else {
            return 'general_billing';
        }
    }
    extractServiceInterest(userInput) {
        const services = [];
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('esim') || lowerInput.includes('data plan')) {
            services.push('eSIM');
        }
        if (lowerInput.includes('phone') || lowerInput.includes('number')) {
            services.push('Phone Numbers');
        }
        if (lowerInput.includes('sms') || lowerInput.includes('text')) {
            services.push('SMS');
        }
        if (lowerInput.includes('voice') || lowerInput.includes('calling')) {
            services.push('Voice');
        }
        return services.length > 0 ? services : ['eSIM'];
    }
    async getDynamicPricing(services) {
        try {
            return "Our eSIM plans start at $5 for 3GB with 7 days validity, $15 for 10GB with 30 days validity, and $50 for 50GB with 90 days validity.";
        }
        catch (error) {
            console.error('Error getting dynamic pricing:', error);
            return "I can provide you with our current pricing options.";
        }
    }
    async getCurrentPricing() {
        try {
            return "Our eSIM plans start at $5 for 3GB, $15 for 10GB, and $50 for 50GB. Phone numbers are $1 per month for toll-free and 50 cents for local numbers.";
        }
        catch (error) {
            console.error('Error getting current pricing:', error);
            return "I can provide you with our current pricing options.";
        }
    }
    handleCommonObjections(userInput) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('expensive') || lowerInput.includes('too much')) {
            return "I understand cost is important. Our plans are competitively priced and include 24/7 support. We also offer a 30-day money-back guarantee. Would you like to hear about our value proposition?";
        }
        else if (lowerInput.includes('not sure') || lowerInput.includes('think about it')) {
            return "That's completely understandable. We offer a 30-day trial period so you can test our services risk-free. What specific concerns do you have?";
        }
        else if (lowerInput.includes('competitor') || lowerInput.includes('other company')) {
            return "I'd be happy to explain how we differ from our competitors. We offer better coverage, faster speeds, and superior customer support. What specific features are you looking for?";
        }
        else {
            return "I understand your concern. Let me address that specifically. What would make this the right solution for you?";
        }
    }
    async createPaymentLink(session) {
        try {
            return "https://checkout.stripe.com/pay/cs_test_123456789";
        }
        catch (error) {
            console.error('Error creating payment link:', error);
            throw error;
        }
    }
    async getBillingInformation(userId) {
        try {
            return "I can see your account details and recent transactions. Let me help you resolve this issue.";
        }
        catch (error) {
            console.error('Error getting billing information:', error);
            return "Let me check your account information.";
        }
    }
    async storeAgentSession(session) {
        try {
            await this.redis.setEx(`agent:session:${session.id}`, 3600, JSON.stringify(session));
        }
        catch (error) {
            console.error('Error storing agent session:', error);
        }
    }
    async getAgentSession(sessionId) {
        try {
            const sessionData = await this.redis.get(`agent:session:${sessionId}`);
            return sessionData ? JSON.parse(sessionData) : null;
        }
        catch (error) {
            console.error('Error getting agent session:', error);
            return null;
        }
    }
    async addInteraction(session, type, content, metadata) {
        try {
            session.history = session.history || [];
            session.history.push({
                id: (0, uuid_1.v4)(),
                timestamp: new Date(),
                type: type,
                content,
                metadata
            });
            await this.storeAgentSession(session);
        }
        catch (error) {
            console.error('Error adding interaction:', error);
        }
    }
    async updateAgentSession(sessionId, updates) {
        try {
            const session = await this.getAgentSession(sessionId);
            if (session) {
                Object.assign(session, updates);
                await this.storeAgentSession(session);
            }
        }
        catch (error) {
            console.error('Error updating agent session:', error);
        }
    }
    async getAgentStats(userId, startDate, endDate) {
        try {
            return {
                totalSessions: 0,
                successfulSessions: 0,
                averageSessionDuration: 0,
                customerSatisfaction: 0,
                conversionRate: 0,
                escalationRate: 0
            };
        }
        catch (error) {
            console.error('Error getting agent stats:', error);
            return {
                totalSessions: 0,
                successfulSessions: 0,
                averageSessionDuration: 0,
                customerSatisfaction: 0,
                conversionRate: 0,
                escalationRate: 0
            };
        }
    }
    generateErrorResponse() {
        return {
            message: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support.",
            type: 'error',
            confidence: 0,
            metadata: {
                timestamp: new Date().toISOString(),
                error: true
            }
        };
    }
    async handleNeedHelp(session, userMessage) {
        return {
            message: "I'm here to help! What specific assistance do you need?",
            type: 'help',
            confidence: 0.9,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'need_help'
            }
        };
    }
    async handleGeneralSales(session, userMessage) {
        return {
            message: "I'd be happy to help you with sales information. What would you like to know about our products or services?",
            type: 'sales',
            confidence: 0.8,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'general_sales'
            }
        };
    }
    async handleBillingIssue(session, userMessage) {
        return {
            message: "I understand you have a billing concern. Let me connect you with our billing department to resolve this issue.",
            type: 'billing',
            confidence: 0.9,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'billing_issue'
            }
        };
    }
    async handleGeneralHelp(session, userMessage) {
        return {
            message: "I'm here to assist you. Could you please provide more details about what you need help with?",
            type: 'help',
            confidence: 0.7,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'general_help'
            }
        };
    }
    async handleGeneralSupport(session, userMessage) {
        return {
            message: "I'm here to provide support. What technical issue are you experiencing?",
            type: 'support',
            confidence: 0.8,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'general_support'
            }
        };
    }
    async handleSubscriptionQuestion(session, userMessage) {
        return {
            message: "I can help you with subscription questions. What would you like to know about your subscription?",
            type: 'subscription',
            confidence: 0.8,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'subscription_question'
            }
        };
    }
    async handlePaymentUpdate(session, userMessage) {
        return {
            message: "I can help you update your payment information. Let me guide you through the process.",
            type: 'payment',
            confidence: 0.9,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'payment_update'
            }
        };
    }
    async handleInvoiceQuestion(session, userMessage) {
        return {
            message: "I can help you with invoice questions. What specific information do you need about your invoice?",
            type: 'invoice',
            confidence: 0.8,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'invoice_question'
            }
        };
    }
    async handleGeneralBilling(session, userMessage) {
        return {
            message: "I can help you with billing questions. What billing information do you need?",
            type: 'billing',
            confidence: 0.7,
            metadata: {
                timestamp: new Date().toISOString(),
                intent: 'general_billing'
            }
        };
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=AgentService.js.map