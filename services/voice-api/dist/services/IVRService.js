"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IVRService = void 0;
const uuid_1 = require("uuid");
class IVRService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    setDependencies(sttService, ttsService, hitlService) {
        this.sttService = sttService;
        this.ttsService = ttsService;
        this.hitlService = hitlService;
    }
    async createIVRMenu(userId, tollFreeNumber, name, greeting, options) {
        const menu = {
            id: (0, uuid_1.v4)(),
            userId,
            tollFreeNumber,
            name,
            greeting,
            options: options.map(option => ({
                ...option,
                id: (0, uuid_1.v4)()
            })),
            timeout: 10,
            maxRetries: 3,
            language: 'en-US',
            voice: 'alice',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeIVRMenu(menu);
        return menu;
    }
    async processIncomingCall(callId, tollFreeNumber, callerId) {
        try {
            const menu = await this.getIVRMenuByNumber(tollFreeNumber);
            if (!menu) {
                throw new Error(`No IVR menu found for toll-free number: ${tollFreeNumber}`);
            }
            const session = {
                id: (0, uuid_1.v4)(),
                callId,
                userId: menu.userId,
                tollFreeNumber,
                menuId: menu.id,
                currentMenu: menu.id,
                path: [],
                context: {
                    callerId,
                    startTime: new Date(),
                    retryCount: 0
                },
                startTime: new Date(),
                lastActivity: new Date(),
                status: 'active'
            };
            await this.storeIVRSession(session);
            await this.playGreeting(callId, menu);
            return session;
        }
        catch (error) {
            console.error('Error processing incoming call:', error);
            throw error;
        }
    }
    async processUserInput(sessionId, input, inputType = 'speech') {
        try {
            const session = await this.getIVRSession(sessionId);
            if (!session) {
                throw new Error('IVR session not found');
            }
            const menu = await this.getIVRMenu(session.menuId);
            if (!menu) {
                throw new Error('IVR menu not found');
            }
            session.lastActivity = new Date();
            session.path.push(input);
            let processedInput = input;
            if (inputType === 'speech') {
                const sttResult = await this.sttService.processSpeech(input, {
                    language: menu.language,
                    callId: session.callId
                });
                processedInput = sttResult.text;
            }
            await this.analyzeInput(session, processedInput);
            const option = this.findMatchingOption(menu, processedInput, session.context);
            if (!option) {
                return await this.handleNoMatch(session, menu);
            }
            const result = await this.executeOption(session, option, processedInput);
            await this.updateIVRSession(session);
            return result;
        }
        catch (error) {
            console.error('Error processing user input:', error);
            throw error;
        }
    }
    async playGreeting(callId, menu) {
        try {
            const audioUrl = await this.ttsService.synthesizeSpeech(menu.greeting, {
                voice: menu.voice,
                language: menu.language
            });
            console.log(`🔊 Playing greeting for call ${callId}: ${menu.greeting}`);
        }
        catch (error) {
            console.error('Error playing greeting:', error);
        }
    }
    findMatchingOption(menu, input, context) {
        const exactMatch = menu.options.find(option => option.key.toLowerCase() === input.toLowerCase());
        if (exactMatch)
            return exactMatch;
        const textMatch = menu.options.find(option => option.text.toLowerCase().includes(input.toLowerCase()) ||
            input.toLowerCase().includes(option.text.toLowerCase()));
        if (textMatch)
            return textMatch;
        const conditionMatch = menu.options.find(option => this.evaluateConditions(option.conditions || [], context));
        if (conditionMatch)
            return conditionMatch;
        return null;
    }
    evaluateConditions(conditions, context) {
        return conditions.every(condition => {
            const fieldValue = this.getFieldValue(context, condition.field);
            return this.evaluateCondition(fieldValue, condition.operator, condition.value);
        });
    }
    getFieldValue(context, field) {
        switch (field) {
            case 'intent':
                return context.intent;
            case 'sentiment':
                return context.sentiment;
            case 'duration':
                return context.duration;
            case 'caller_id':
                return context.callerId;
            case 'time_of_day':
                return new Date().getHours();
            default:
                return null;
        }
    }
    evaluateCondition(fieldValue, operator, value) {
        switch (operator) {
            case 'equals':
                return fieldValue === value;
            case 'contains':
                return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
            case 'greater_than':
                return Number(fieldValue) > Number(value);
            case 'less_than':
                return Number(fieldValue) < Number(value);
            case 'between':
                return Number(fieldValue) >= Number(value[0]) && Number(fieldValue) <= Number(value[1]);
            default:
                return false;
        }
    }
    async executeOption(session, option, input) {
        switch (option.action) {
            case 'transfer':
                return await this.handleTransfer(session, option);
            case 'speak':
                return await this.handleSpeak(session, option);
            case 'gather':
                return await this.handleGather(session, option);
            case 'submenu':
                return await this.handleSubmenu(session, option);
            case 'hangup':
                return await this.handleHangup(session, option);
            default:
                throw new Error(`Unknown option action: ${option.action}`);
        }
    }
    async handleTransfer(session, option) {
        try {
            const needsEscalation = await this.checkEscalationNeeded(session);
            if (needsEscalation) {
                const escalation = await this.hitlService.processEscalation(session.callId, session.userId, 'user_requested_transfer', session.context);
                session.status = 'transferred';
                await this.updateIVRSession(session);
                return {
                    action: 'transfer',
                    target: escalation.targetNumber,
                    reason: 'escalation'
                };
            }
            else {
                session.status = 'transferred';
                await this.updateIVRSession(session);
                return {
                    action: 'transfer',
                    target: option.target,
                    reason: 'direct_transfer'
                };
            }
        }
        catch (error) {
            console.error('Error handling transfer:', error);
            throw error;
        }
    }
    async handleSpeak(session, option) {
        try {
            const audioUrl = await this.ttsService.synthesizeSpeech(option.text, {
                voice: 'alice',
                language: 'en-US'
            });
            return {
                action: 'speak',
                text: option.text,
                audioUrl
            };
        }
        catch (error) {
            console.error('Error handling speak:', error);
            throw error;
        }
    }
    async handleGather(session, option) {
        try {
            return {
                action: 'gather',
                prompt: option.text,
                timeout: 10,
                maxDigits: 1
            };
        }
        catch (error) {
            console.error('Error handling gather:', error);
            throw error;
        }
    }
    async handleSubmenu(session, option) {
        try {
            if (!option.submenuId) {
                throw new Error('Submenu ID not specified');
            }
            const submenu = await this.getIVRMenu(option.submenuId);
            if (!submenu) {
                throw new Error('Submenu not found');
            }
            session.currentMenu = submenu.id;
            await this.updateIVRSession(session);
            return {
                action: 'submenu',
                menuId: submenu.id,
                greeting: submenu.greeting,
                options: submenu.options
            };
        }
        catch (error) {
            console.error('Error handling submenu:', error);
            throw error;
        }
    }
    async handleHangup(session, option) {
        try {
            session.status = 'completed';
            await this.updateIVRSession(session);
            return {
                action: 'hangup',
                message: option.text || 'Thank you for calling. Goodbye.'
            };
        }
        catch (error) {
            console.error('Error handling hangup:', error);
            throw error;
        }
    }
    async handleNoMatch(session, menu) {
        try {
            session.context.retryCount = (session.context.retryCount || 0) + 1;
            if (session.context.retryCount >= menu.maxRetries) {
                const escalation = await this.hitlService.processEscalation(session.callId, session.userId, 'max_retries_reached', session.context);
                session.status = 'transferred';
                await this.updateIVRSession(session);
                return {
                    action: 'transfer',
                    target: escalation.targetNumber,
                    reason: 'max_retries'
                };
            }
            else {
                return {
                    action: 'speak',
                    text: `I didn't understand that. Please try again. ${menu.greeting}`,
                    retry: true
                };
            }
        }
        catch (error) {
            console.error('Error handling no match:', error);
            throw error;
        }
    }
    async checkEscalationNeeded(session) {
        const context = session.context;
        if (context.sentiment && context.sentiment < 0.3) {
            return true;
        }
        const escalationKeywords = ['human', 'agent', 'representative', 'manager', 'supervisor'];
        const transcript = context.transcript || '';
        if (escalationKeywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
            return true;
        }
        const duration = Date.now() - session.startTime.getTime();
        if (duration > 300000) {
            return true;
        }
        return false;
    }
    async analyzeInput(session, input) {
        try {
            session.context.transcript = (session.context.transcript || '') + ' ' + input;
            session.context.lastInput = input;
            const analysis = await this.performRealTimeAnalysis(input, session.context);
            session.context.intent = analysis.intent;
            session.context.sentiment = analysis.sentiment;
            session.context.entities = analysis.entities;
            session.context.keywords = analysis.keywords;
            await this.storeRealTimeInsight(session, analysis);
        }
        catch (error) {
            console.error('Error analyzing input:', error);
        }
    }
    async performRealTimeAnalysis(input, context) {
        return {
            intent: this.extractIntent(input),
            sentiment: this.analyzeSentiment(input),
            entities: this.extractEntities(input),
            keywords: this.extractKeywords(input)
        };
    }
    extractIntent(input) {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('billing') || lowerInput.includes('payment')) {
            return 'billing_inquiry';
        }
        else if (lowerInput.includes('support') || lowerInput.includes('help')) {
            return 'technical_support';
        }
        else if (lowerInput.includes('sales') || lowerInput.includes('buy')) {
            return 'sales_inquiry';
        }
        else if (lowerInput.includes('human') || lowerInput.includes('agent')) {
            return 'human_agent';
        }
        else {
            return 'general_inquiry';
        }
    }
    analyzeSentiment(input) {
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied'];
        const negativeWords = ['bad', 'terrible', 'angry', 'frustrated', 'disappointed'];
        const lowerInput = input.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerInput.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerInput.includes(word)).length;
        if (positiveCount > negativeCount)
            return 0.7;
        if (negativeCount > positiveCount)
            return 0.3;
        return 0.5;
    }
    extractEntities(input) {
        const entities = [];
        const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
        const phoneMatches = input.match(phoneRegex);
        if (phoneMatches) {
            entities.push({
                type: 'phone_number',
                value: phoneMatches[0],
                confidence: 0.9
            });
        }
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emailMatches = input.match(emailRegex);
        if (emailMatches) {
            entities.push({
                type: 'email',
                value: emailMatches[0],
                confidence: 0.9
            });
        }
        return entities;
    }
    extractKeywords(input) {
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = input.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        return [...new Set(words)];
    }
    async storeRealTimeInsight(session, analysis) {
        const insight = {
            id: (0, uuid_1.v4)(),
            callId: session.callId,
            userId: session.userId,
            type: 'intent',
            value: analysis.intent,
            confidence: 0.8,
            timestamp: new Date(),
            metadata: analysis
        };
        await this.redis.lPush(`real_time_insights:${session.userId}`, JSON.stringify(insight));
        await this.redis.expire(`real_time_insights:${session.userId}`, 3600);
    }
    async storeIVRMenu(menu) {
        await this.redis.setEx(`ivr_menu:${menu.id}`, 3600, JSON.stringify(menu));
        await this.redis.setEx(`ivr_menu_by_number:${menu.tollFreeNumber}`, 3600, menu.id);
    }
    async getIVRMenu(menuId) {
        const menuData = await this.redis.get(`ivr_menu:${menuId}`);
        return menuData ? JSON.parse(menuData) : null;
    }
    async getIVRMenuByNumber(tollFreeNumber) {
        const menuId = await this.redis.get(`ivr_menu_by_number:${tollFreeNumber}`);
        if (!menuId)
            return null;
        return await this.getIVRMenu(menuId);
    }
    async storeIVRSession(session) {
        await this.redis.setEx(`ivr_session:${session.id}`, 3600, JSON.stringify(session));
    }
    async getIVRSession(sessionId) {
        const sessionData = await this.redis.get(`ivr_session:${sessionId}`);
        return sessionData ? JSON.parse(sessionData) : null;
    }
    async updateIVRSession(session) {
        session.lastActivity = new Date();
        await this.redis.setEx(`ivr_session:${session.id}`, 3600, JSON.stringify(session));
    }
}
exports.IVRService = IVRService;
//# sourceMappingURL=IVRService.js.map