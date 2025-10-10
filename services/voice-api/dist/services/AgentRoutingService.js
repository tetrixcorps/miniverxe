"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRoutingService = void 0;
const uuid_1 = require("uuid");
class AgentRoutingService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async routeCall(callId, userInput, context) {
        try {
            const analysis = await this.analyzeUserInput(userInput, context);
            const agentType = this.determineAgentType(analysis, context);
            const confidence = this.calculateConfidence(analysis, context);
            const priority = this.determinePriority(analysis, context);
            const department = this.getDepartmentInfo(agentType);
            const decision = {
                agentType,
                confidence,
                reason: analysis.reason,
                department: department.name,
                priority
            };
            await this.logRoutingDecision(callId, decision, analysis);
            return decision;
        }
        catch (error) {
            console.error('Error routing call:', error);
            return {
                agentType: 'support',
                confidence: 0.5,
                reason: 'error_fallback',
                department: 'Customer Support',
                priority: 'medium'
            };
        }
    }
    async analyzeUserInput(userInput, context) {
        const lowerInput = userInput.toLowerCase();
        const intent = this.analyzeIntent(lowerInput);
        const sentiment = this.analyzeSentiment(lowerInput);
        const keywords = this.extractKeywords(lowerInput);
        const urgency = this.analyzeUrgency(lowerInput, context);
        const customerTier = context.customerTier || 'basic';
        return {
            intent,
            sentiment,
            keywords,
            urgency,
            customerTier,
            reason: this.generateReason(intent, sentiment, urgency, customerTier)
        };
    }
    analyzeIntent(userInput) {
        const salesPatterns = [
            'buy', 'purchase', 'order', 'price', 'cost', 'plan', 'subscription',
            'esim', 'data plan', 'phone number', 'toll free', 'service'
        ];
        const supportPatterns = [
            'help', 'problem', 'issue', 'not working', 'broken', 'activate',
            'connection', 'network', 'troubleshoot', 'error', 'fix'
        ];
        const billingPatterns = [
            'bill', 'payment', 'charge', 'refund', 'invoice', 'subscription',
            'credit card', 'billing', 'money', 'cost', 'expensive'
        ];
        const salesScore = this.calculatePatternScore(userInput, salesPatterns);
        const supportScore = this.calculatePatternScore(userInput, supportPatterns);
        const billingScore = this.calculatePatternScore(userInput, billingPatterns);
        if (salesScore > supportScore && salesScore > billingScore) {
            return 'sales';
        }
        else if (billingScore > supportScore) {
            return 'billing';
        }
        else {
            return 'support';
        }
    }
    analyzeSentiment(userInput) {
        const positiveWords = [
            'good', 'great', 'excellent', 'happy', 'satisfied', 'love', 'amazing',
            'perfect', 'wonderful', 'fantastic', 'awesome', 'brilliant'
        ];
        const negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'angry', 'frustrated', 'disappointed',
            'upset', 'annoyed', 'irritated', 'mad', 'furious', 'hate'
        ];
        const positiveCount = this.calculatePatternScore(userInput, positiveWords);
        const negativeCount = this.calculatePatternScore(userInput, negativeWords);
        if (positiveCount > negativeCount) {
            return 0.7;
        }
        else if (negativeCount > positiveCount) {
            return 0.3;
        }
        else {
            return 0.5;
        }
    }
    extractKeywords(userInput) {
        const keywords = [];
        const serviceKeywords = ['esim', 'data', 'phone', 'number', 'sms', 'voice', 'calling'];
        serviceKeywords.forEach(keyword => {
            if (userInput.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        const problemKeywords = ['activate', 'connection', 'network', 'error', 'problem', 'issue'];
        problemKeywords.forEach(keyword => {
            if (userInput.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        const billingKeywords = ['payment', 'bill', 'charge', 'refund', 'invoice', 'subscription'];
        billingKeywords.forEach(keyword => {
            if (userInput.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        return keywords;
    }
    analyzeUrgency(userInput, context) {
        const urgentWords = [
            'urgent', 'emergency', 'critical', 'asap', 'immediately', 'now',
            'broken', 'down', 'not working', 'failed', 'error'
        ];
        const urgentScore = this.calculatePatternScore(userInput, urgentWords);
        const hour = new Date().getHours();
        const isAfterHours = hour < 9 || hour > 17;
        const tierMultiplier = context.customerTier === 'enterprise' ? 1.5 :
            context.customerTier === 'premium' ? 1.2 : 1.0;
        const urgencyScore = urgentScore * tierMultiplier + (isAfterHours ? 0.3 : 0);
        if (urgencyScore > 0.7) {
            return 'critical';
        }
        else if (urgencyScore > 0.5) {
            return 'high';
        }
        else if (urgencyScore > 0.3) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    calculatePatternScore(userInput, patterns) {
        let score = 0;
        patterns.forEach(pattern => {
            if (userInput.includes(pattern)) {
                score += 1;
            }
        });
        return score / patterns.length;
    }
    determineAgentType(analysis, context) {
        const { intent, sentiment, urgency, customerTier } = analysis;
        if (intent === 'billing' && urgency === 'critical') {
            return 'billing';
        }
        if (intent === 'sales' && sentiment > 0.6) {
            return 'sales';
        }
        if (customerTier === 'enterprise' && intent === 'support') {
            return 'support';
        }
        switch (intent) {
            case 'sales':
                return 'sales';
            case 'billing':
                return 'billing';
            default:
                return 'support';
        }
    }
    calculateConfidence(analysis, context) {
        let confidence = 0.5;
        const intentConfidence = this.calculateIntentConfidence(analysis.intent, analysis.keywords);
        confidence += intentConfidence * 0.4;
        const sentimentConfidence = Math.abs(analysis.sentiment - 0.5) * 2;
        confidence += sentimentConfidence * 0.2;
        const urgencyConfidence = analysis.urgency === 'critical' ? 0.9 :
            analysis.urgency === 'high' ? 0.7 :
                analysis.urgency === 'medium' ? 0.5 : 0.3;
        confidence += urgencyConfidence * 0.2;
        const tierConfidence = context.customerTier === 'enterprise' ? 0.9 :
            context.customerTier === 'premium' ? 0.7 : 0.5;
        confidence += tierConfidence * 0.2;
        return Math.min(confidence, 1.0);
    }
    calculateIntentConfidence(intent, keywords) {
        const intentKeywords = {
            'sales': ['buy', 'purchase', 'price', 'plan', 'esim', 'service'],
            'support': ['help', 'problem', 'issue', 'activate', 'connection', 'error'],
            'billing': ['bill', 'payment', 'charge', 'refund', 'invoice', 'subscription']
        };
        const relevantKeywords = intentKeywords[intent] || [];
        const matchingKeywords = keywords.filter(keyword => relevantKeywords.some((relevant) => keyword.includes(relevant)));
        return matchingKeywords.length / relevantKeywords.length;
    }
    determinePriority(analysis, context) {
        const { urgency, sentiment, customerTier } = analysis;
        if (urgency === 'critical' ||
            (customerTier === 'enterprise' && sentiment < 0.3) ||
            (urgency === 'high' && sentiment < 0.3)) {
            return 'critical';
        }
        if (urgency === 'high' ||
            (customerTier === 'premium' && sentiment < 0.4) ||
            (customerTier === 'enterprise')) {
            return 'high';
        }
        if (urgency === 'medium' ||
            (customerTier === 'premium') ||
            (sentiment < 0.5)) {
            return 'medium';
        }
        return 'low';
    }
    getDepartmentInfo(agentType) {
        const departments = {
            'sales': {
                name: 'Sales',
                description: 'Product information and sales assistance',
                phoneNumber: process.env.SALES_PHONE_NUMBER || '+18888046762',
                email: 'sales@tetrixcorp.com'
            },
            'support': {
                name: 'Customer Support',
                description: 'Technical support and troubleshooting',
                phoneNumber: process.env.SUPPORT_PHONE_NUMBER || '+18888046762',
                email: 'support@tetrixcorp.com'
            },
            'billing': {
                name: 'Billing',
                description: 'Payment and billing assistance',
                phoneNumber: process.env.BILLING_PHONE_NUMBER || '+18005963057',
                email: 'billing@tetrixcorp.com'
            }
        };
        return departments[agentType] || departments['support'];
    }
    generateReason(intent, sentiment, urgency, customerTier) {
        const reasons = [];
        if (intent === 'sales') {
            reasons.push('sales inquiry detected');
        }
        else if (intent === 'billing') {
            reasons.push('billing inquiry detected');
        }
        else {
            reasons.push('support inquiry detected');
        }
        if (sentiment < 0.4) {
            reasons.push('negative sentiment');
        }
        if (urgency === 'critical' || urgency === 'high') {
            reasons.push('high urgency');
        }
        if (customerTier === 'enterprise') {
            reasons.push('enterprise customer');
        }
        return reasons.join(', ');
    }
    async logRoutingDecision(callId, decision, analysis) {
        const logEntry = {
            id: (0, uuid_1.v4)(),
            callId,
            timestamp: new Date(),
            decision,
            analysis,
            userId: analysis.userId
        };
        await this.redis.lPush(`routing_logs:${new Date().toISOString().split('T')[0]}`, JSON.stringify(logEntry));
        await this.redis.expire(`routing_logs:${new Date().toISOString().split('T')[0]}`, 86400);
    }
    async getRoutingStats(startDate, endDate) {
        try {
            const stats = {
                totalCalls: 0,
                salesCalls: 0,
                supportCalls: 0,
                billingCalls: 0,
                averageConfidence: 0,
                escalationRate: 0,
                priorityDistribution: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    critical: 0
                }
            };
            return stats;
        }
        catch (error) {
            console.error('Error getting routing stats:', error);
            throw error;
        }
    }
    async getRoutingLogs(startDate, endDate, limit = 100) {
        try {
            const logs = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const dayLogs = await this.redis.lRange(`routing_logs:${dateStr}`, 0, limit - 1);
                logs.push(...dayLogs.map(log => JSON.parse(log)));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return logs.slice(0, limit);
        }
        catch (error) {
            console.error('Error getting routing logs:', error);
            return [];
        }
    }
}
exports.AgentRoutingService = AgentRoutingService;
//# sourceMappingURL=AgentRoutingService.js.map