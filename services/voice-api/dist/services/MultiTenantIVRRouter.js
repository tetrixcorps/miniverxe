"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiTenantIVRRouter = void 0;
const uuid_1 = require("uuid");
class MultiTenantIVRRouter {
    constructor(prisma, redis, tenantIVRService, departmentConfigService, crmIntegrationService) {
        this.prisma = prisma;
        this.redis = redis;
        this.tenantIVRService = tenantIVRService;
        this.departmentConfigService = departmentConfigService;
        this.crmIntegrationService = crmIntegrationService;
    }
    async routeCall(tollFreeNumber, callerId, userInput) {
        try {
            console.log(`Routing call from ${callerId} to ${tollFreeNumber}`);
            const tenantId = await this.identifyTenant(tollFreeNumber);
            if (!tenantId) {
                throw new Error(`Tenant not found for toll-free number: ${tollFreeNumber}`);
            }
            const callContext = await this.createCallContext(tenantId, tollFreeNumber, callerId, userInput);
            callContext.customerContext = await this.getCustomerContext(tenantId, callerId);
            const analysis = await this.analyzeCall(callContext);
            const departments = await this.getAvailableDepartments(tenantId);
            const routingDecision = await this.applyRoutingRules(callContext, analysis, departments);
            const availability = await this.checkAvailability(callContext, routingDecision);
            const result = await this.generateRoutingResult(callContext, routingDecision, availability);
            await this.updateRoutingHistory(callContext, routingDecision);
            await this.logInteraction(callContext, routingDecision, result);
            console.log(`Call routed to ${result.department} for tenant ${tenantId}`);
            return result;
        }
        catch (error) {
            console.error('Error routing call:', error);
            return this.generateErrorResult(error instanceof Error ? error.message : 'Unknown error');
        }
    }
    async identifyTenant(tollFreeNumber) {
        const tenantId = await this.redis.get(`toll_free_number:${tollFreeNumber}`);
        return tenantId;
    }
    async createCallContext(tenantId, tollFreeNumber, callerId, userInput) {
        const callId = (0, uuid_1.v4)();
        const sessionId = (0, uuid_1.v4)();
        return {
            callId,
            tenantId,
            tollFreeNumber,
            callerId,
            userInput,
            timestamp: new Date(),
            sessionId,
            routingHistory: [],
            escalationLevel: 0,
            maxEscalationLevel: 3
        };
    }
    async getCustomerContext(tenantId, callerId) {
        try {
            const contact = await this.crmIntegrationService.getContactByPhone(tenantId, callerId);
            if (contact && contact.success && contact.contact) {
                const contactData = contact.contact;
                return {
                    customerId: contactData.id,
                    name: `${contactData.firstName} ${contactData.lastName}`.trim(),
                    email: contactData.email,
                    phone: contactData.phone,
                    tier: contactData.tier || 'basic',
                    history: [],
                    preferences: {
                        language: 'en-US',
                        communicationMethod: 'call',
                        doNotCall: false,
                        doNotEmail: false
                    },
                    tags: contactData.tags || [],
                    lastInteraction: contactData.lastInteraction || new Date(),
                    isVIP: (contactData.tier || 'standard') === 'enterprise',
                    language: 'en-US',
                    timezone: 'America/New_York'
                };
            }
        }
        catch (error) {
            console.error('Error getting customer context from CRM:', error);
        }
        return {
            phone: callerId,
            tier: 'basic',
            history: [],
            preferences: {
                language: 'en-US',
                communicationMethod: 'call',
                doNotCall: false,
                doNotEmail: false
            },
            tags: [],
            isVIP: false,
            language: 'en-US',
            timezone: 'America/New_York'
        };
    }
    async analyzeCall(callContext) {
        const userInput = callContext.userInput || '';
        const lowerInput = userInput.toLowerCase();
        const intent = this.analyzeIntent(lowerInput);
        const sentiment = this.analyzeSentiment(lowerInput);
        const urgency = this.analyzeUrgency(lowerInput, callContext.customerContext);
        const language = this.detectLanguage(userInput);
        const keywords = this.extractKeywords(lowerInput);
        return {
            intent,
            sentiment,
            urgency,
            language,
            keywords,
            confidence: this.calculateConfidence(intent, sentiment, urgency, callContext.customerContext)
        };
    }
    analyzeIntent(userInput) {
        const salesKeywords = ['buy', 'purchase', 'price', 'cost', 'plan', 'subscription', 'order'];
        const supportKeywords = ['help', 'problem', 'issue', 'not working', 'broken', 'error', 'fix'];
        const billingKeywords = ['bill', 'payment', 'charge', 'refund', 'invoice', 'billing', 'money'];
        const technicalKeywords = ['technical', 'setup', 'install', 'api', 'integration', 'webhook'];
        const salesScore = this.calculateKeywordScore(userInput, salesKeywords);
        const supportScore = this.calculateKeywordScore(userInput, supportKeywords);
        const billingScore = this.calculateKeywordScore(userInput, billingKeywords);
        const technicalScore = this.calculateKeywordScore(userInput, technicalKeywords);
        if (salesScore > supportScore && salesScore > billingScore && salesScore > technicalScore) {
            return 'sales';
        }
        else if (billingScore > supportScore && billingScore > technicalScore) {
            return 'billing';
        }
        else if (technicalScore > supportScore) {
            return 'technical';
        }
        else {
            return 'support';
        }
    }
    analyzeSentiment(userInput) {
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'love', 'amazing'];
        const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'hate'];
        const positiveScore = this.calculateKeywordScore(userInput, positiveWords);
        const negativeScore = this.calculateKeywordScore(userInput, negativeWords);
        if (positiveScore > negativeScore) {
            return 0.7;
        }
        else if (negativeScore > positiveScore) {
            return 0.3;
        }
        else {
            return 0.5;
        }
    }
    analyzeUrgency(userInput, customerContext) {
        const urgentKeywords = ['urgent', 'emergency', 'critical', 'asap', 'immediately', 'now', 'broken'];
        const urgentScore = this.calculateKeywordScore(userInput, urgentKeywords);
        const vipMultiplier = customerContext?.isVIP ? 1.5 : 1.0;
        const tierMultiplier = customerContext?.tier === 'enterprise' ? 1.3 :
            customerContext?.tier === 'premium' ? 1.1 : 1.0;
        const finalScore = urgentScore * vipMultiplier * tierMultiplier;
        if (finalScore > 0.7)
            return 'critical';
        if (finalScore > 0.5)
            return 'high';
        if (finalScore > 0.3)
            return 'medium';
        return 'low';
    }
    detectLanguage(userInput) {
        const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo'];
        const frenchWords = ['le', 'la', 'de', 'et', 'à', 'un', 'il', 'que', 'ne', 'se', 'ce', 'pas', 'tout'];
        const englishScore = this.calculateKeywordScore(userInput.toLowerCase(), englishWords);
        const spanishScore = this.calculateKeywordScore(userInput.toLowerCase(), spanishWords);
        const frenchScore = this.calculateKeywordScore(userInput.toLowerCase(), frenchWords);
        if (spanishScore > englishScore && spanishScore > frenchScore)
            return 'es-ES';
        if (frenchScore > englishScore && frenchScore > spanishScore)
            return 'fr-FR';
        return 'en-US';
    }
    extractKeywords(userInput) {
        const keywords = [];
        const commonKeywords = [
            'esim', 'data', 'phone', 'number', 'sms', 'voice', 'calling',
            'activate', 'connection', 'network', 'error', 'problem', 'issue',
            'payment', 'bill', 'charge', 'refund', 'invoice', 'subscription',
            'technical', 'setup', 'install', 'api', 'integration', 'webhook'
        ];
        commonKeywords.forEach(keyword => {
            if (userInput.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        return keywords;
    }
    calculateKeywordScore(userInput, keywords) {
        let score = 0;
        keywords.forEach(keyword => {
            if (userInput.includes(keyword)) {
                score += 1;
            }
        });
        return score / keywords.length;
    }
    calculateConfidence(intent, sentiment, urgency, customerContext) {
        let confidence = 0.5;
        confidence += 0.3;
        confidence += Math.abs(sentiment - 0.5) * 0.2;
        const urgencyConfidence = urgency === 'critical' ? 0.9 :
            urgency === 'high' ? 0.7 :
                urgency === 'medium' ? 0.5 : 0.3;
        confidence += urgencyConfidence * 0.2;
        if (customerContext) {
            const tierConfidence = customerContext.tier === 'enterprise' ? 0.9 :
                customerContext.tier === 'premium' ? 0.7 : 0.5;
            confidence += tierConfidence * 0.2;
        }
        return Math.min(confidence, 1.0);
    }
    async getAvailableDepartments(tenantId) {
        return await this.departmentConfigService.getTenantDepartmentConfigs(tenantId);
    }
    async applyRoutingRules(callContext, analysis, departments) {
        let bestDepartment = null;
        let bestScore = 0;
        let bestReason = '';
        for (const department of departments) {
            if (!department.active)
                continue;
            let score = 0;
            let reason = '';
            for (const rule of department.routingRules || []) {
                if (this.evaluateRoutingRule(rule, analysis, callContext)) {
                    score += rule.priority * 10;
                    reason += rule.description + '; ';
                }
            }
            if (department.type === analysis.intent) {
                score += 50;
                reason += `Intent match (${analysis.intent}); `;
            }
            if (callContext.customerContext?.tier === 'enterprise' && department.type === 'technical') {
                score += 30;
                reason += 'Enterprise customer to technical; ';
            }
            if (callContext.customerContext?.isVIP) {
                score += 20;
                reason += 'VIP customer priority; ';
            }
            if (score > bestScore) {
                bestScore = score;
                bestDepartment = department;
                bestReason = reason;
            }
        }
        if (!bestDepartment && departments.length > 0) {
            bestDepartment = departments[0];
            bestReason = 'Default department routing';
        }
        return {
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            department: bestDepartment?.name || 'Support',
            reason: bestReason,
            confidence: bestScore / 100,
            customerTier: callContext.customerContext?.tier || 'basic',
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            businessHours: true,
            agentAvailable: true,
            escalationLevel: callContext.escalationLevel
        };
    }
    evaluateRoutingRule(rule, analysis, callContext) {
        const condition = rule.condition;
        const value = this.getConditionValue(condition, analysis, callContext);
        return this.evaluateCondition(value, condition.operator, condition.value);
    }
    getConditionValue(condition, analysis, callContext) {
        switch (condition.type) {
            case 'intent':
                return analysis.intent;
            case 'sentiment':
                return analysis.sentiment;
            case 'customer_tier':
                return callContext.customerContext?.tier || 'basic';
            case 'time_of_day':
                return new Date().getHours();
            case 'keyword':
                return analysis.keywords.join(' ');
            case 'caller_id':
                return callContext.callerId;
            default:
                return null;
        }
    }
    evaluateCondition(value, operator, ruleValue) {
        switch (operator) {
            case 'equals':
                return value === ruleValue;
            case 'contains':
                return String(value).toLowerCase().includes(String(ruleValue).toLowerCase());
            case 'greater_than':
                return Number(value) > Number(ruleValue);
            case 'less_than':
                return Number(value) < Number(ruleValue);
            case 'between':
                return Number(value) >= Number(ruleValue[0]) && Number(value) <= Number(ruleValue[1]);
            case 'in':
                return Array.isArray(ruleValue) && ruleValue.includes(value);
            case 'not_in':
                return Array.isArray(ruleValue) && !ruleValue.includes(value);
            default:
                return false;
        }
    }
    async checkAvailability(callContext, routingDecision) {
        return {
            businessHours: true,
            agentAvailable: true,
            estimatedWaitTime: 0,
            callbackRecommended: false
        };
    }
    async generateRoutingResult(callContext, routingDecision, availability) {
        if (!availability.businessHours) {
            return {
                action: 'announcement',
                department: routingDecision.department,
                message: 'Thank you for calling. We are currently closed. Please leave a message and we will call you back.',
                metadata: {
                    reason: 'after_hours',
                    callbackTime: this.getNextBusinessDay()
                }
            };
        }
        if (!availability.agentAvailable) {
            return {
                action: 'callback',
                department: routingDecision.department,
                message: 'Thank you for calling. All agents are currently busy. We will call you back shortly.',
                callbackTime: new Date(Date.now() + 15 * 60 * 1000),
                metadata: {
                    reason: 'no_agents_available',
                    estimatedWaitTime: availability.estimatedWaitTime
                }
            };
        }
        return {
            action: 'route',
            department: routingDecision.department,
            message: `Connecting you to ${routingDecision.department}. Please hold.`,
            phoneNumber: this.getDepartmentPhoneNumber(routingDecision.department),
            metadata: {
                confidence: routingDecision.confidence,
                reason: routingDecision.reason,
                customerTier: routingDecision.customerTier
            }
        };
    }
    async updateRoutingHistory(callContext, routingDecision) {
        callContext.routingHistory.push(routingDecision);
        await this.redis.setEx(`call_context:${callContext.callId}`, 3600, JSON.stringify(callContext));
    }
    async logInteraction(callContext, routingDecision, result) {
        if (callContext.customerContext?.customerId) {
            await this.crmIntegrationService.createInteraction({
                tenantId: callContext.tenantId,
                contactId: callContext.customerContext.customerId,
                type: 'call',
                content: `Call routed to ${routingDecision.department} based on ${routingDecision.reason}`,
                metadata: {
                    subject: `Call to ${routingDecision.department}`,
                    description: `Call routed to ${routingDecision.department} based on ${routingDecision.reason}`,
                    outcome: 'open',
                    department: routingDecision.department,
                    duration: 0,
                    callId: callContext.callId,
                    routingDecision,
                    result
                }
            });
        }
    }
    generateErrorResult(errorMessage) {
        return {
            action: 'announcement',
            department: 'Support',
            message: 'We apologize, but we are experiencing technical difficulties. Please try again later or contact support.',
            metadata: {
                error: errorMessage,
                timestamp: new Date().toISOString()
            }
        };
    }
    getDepartmentPhoneNumber(department) {
        return '+1234567890';
    }
    getNextBusinessDay() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
    }
}
exports.MultiTenantIVRRouter = MultiTenantIVRRouter;
//# sourceMappingURL=MultiTenantIVRRouter.js.map