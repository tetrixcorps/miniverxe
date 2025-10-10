"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HITLService = void 0;
const uuid_1 = require("uuid");
class HITLService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createOnCallConfig(userId, businessNumber) {
        const config = {
            id: (0, uuid_1.v4)(),
            userId,
            strategy: 'on_call',
            primaryNumber: businessNumber,
            escalationRules: [
                {
                    id: (0, uuid_1.v4)(),
                    condition: 'intent',
                    value: 'human_agent',
                    action: 'transfer',
                    target: businessNumber,
                    priority: 1
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeHITLConfig(config);
        return config;
    }
    async createRingGroupConfig(userId, primaryNumber, ringGroup, strategy = 'simultaneous') {
        const config = {
            id: (0, uuid_1.v4)(),
            userId,
            strategy: 'ring_group',
            primaryNumber,
            ringGroup,
            escalationRules: [
                {
                    id: (0, uuid_1.v4)(),
                    condition: 'intent',
                    value: 'human_agent',
                    action: 'transfer',
                    target: strategy === 'simultaneous' ? 'ring_group' : 'sequential_group',
                    priority: 1
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeHITLConfig(config);
        return config;
    }
    async createBusinessHoursConfig(userId, primaryNumber, businessHours) {
        const config = {
            id: (0, uuid_1.v4)(),
            userId,
            strategy: 'business_hours',
            primaryNumber,
            businessHours,
            escalationRules: [
                {
                    id: (0, uuid_1.v4)(),
                    condition: 'intent',
                    value: 'human_agent',
                    action: 'transfer',
                    target: 'business_hours_routing',
                    priority: 1
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeHITLConfig(config);
        return config;
    }
    async createAgentPoolConfig(userId, primaryNumber, agents) {
        const config = {
            id: (0, uuid_1.v4)(),
            userId,
            strategy: 'agent_pool',
            primaryNumber,
            agentPool: agents,
            escalationRules: [
                {
                    id: (0, uuid_1.v4)(),
                    condition: 'intent',
                    value: 'human_agent',
                    action: 'transfer',
                    target: 'skills_based_routing',
                    priority: 1
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeHITLConfig(config);
        return config;
    }
    async processEscalation(callId, userId, reason, context) {
        try {
            const config = await this.getHITLConfig(userId);
            if (!config) {
                throw new Error('No HITL configuration found for user');
            }
            const targetNumber = await this.determineEscalationTarget(config, context);
            const escalation = {
                id: (0, uuid_1.v4)(),
                callId,
                userId,
                reason,
                strategy: config.strategy,
                targetNumber,
                status: 'pending',
                attempts: 0,
                maxAttempts: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.storeCallEscalation(escalation);
            await this.executeEscalation(escalation);
            return escalation;
        }
        catch (error) {
            console.error('Error processing escalation:', error);
            throw error;
        }
    }
    async determineEscalationTarget(config, context) {
        switch (config.strategy) {
            case 'on_call':
                return config.primaryNumber;
            case 'ring_group':
                if (config.ringGroup && config.ringGroup.length > 0) {
                    return config.ringGroup[0];
                }
                return config.primaryNumber;
            case 'business_hours':
                return await this.getBusinessHoursTarget(config, context);
            case 'agent_pool':
                return await this.getAgentPoolTarget(config, context);
            default:
                return config.primaryNumber;
        }
    }
    async getBusinessHoursTarget(config, context) {
        if (!config.businessHours) {
            return config.primaryNumber;
        }
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', {
            hour12: false,
            timeZone: config.businessHours.timezone
        });
        const currentDay = now.getDay();
        const isWeekend = currentDay === 0 || currentDay === 6;
        const isHoliday = this.isHoliday(now, config.businessHours.holidays || []);
        if (isHoliday) {
            return isHoliday.forwardingNumber;
        }
        const schedule = isWeekend ? config.businessHours.weekends : config.businessHours.weekdays;
        if (schedule.enabled && this.isWithinBusinessHours(currentTime, schedule)) {
            return schedule.forwardingNumber;
        }
        return schedule.voicemailEnabled ? 'voicemail' : config.primaryNumber;
    }
    async getAgentPoolTarget(config, context) {
        if (!config.agentPool || config.agentPool.length === 0) {
            return config.primaryNumber;
        }
        const requiredSkills = this.extractRequiredSkills(context);
        const availableAgents = config.agentPool.filter(agent => agent.availability === 'available' &&
            agent.currentCalls < agent.maxConcurrentCalls &&
            requiredSkills.some(skill => agent.skills.includes(skill)));
        if (availableAgents.length === 0) {
            return config.primaryNumber;
        }
        const selectedAgent = this.selectAgent(availableAgents);
        selectedAgent.currentCalls++;
        await this.updateAgent(selectedAgent);
        return selectedAgent.phoneNumber;
    }
    isWithinBusinessHours(currentTime, schedule) {
        if (!schedule.enabled)
            return false;
        const current = this.timeToMinutes(currentTime);
        const start = this.timeToMinutes(schedule.startTime);
        const end = this.timeToMinutes(schedule.endTime);
        return current >= start && current <= end;
    }
    isHoliday(date, holidays) {
        const dateStr = date.toISOString().split('T')[0];
        return holidays.find(holiday => holiday.date === dateStr && holiday.enabled) || null;
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    extractRequiredSkills(context) {
        const skills = [];
        if (context.intent) {
            switch (context.intent) {
                case 'billing_inquiry':
                    skills.push('billing', 'account_management');
                    break;
                case 'technical_support':
                    skills.push('technical_support', 'troubleshooting');
                    break;
                case 'sales_inquiry':
                    skills.push('sales', 'product_knowledge');
                    break;
                default:
                    skills.push('general_support');
            }
        }
        if (context.sentiment && context.sentiment < 0.3) {
            skills.push('customer_service', 'conflict_resolution');
        }
        return skills.length > 0 ? skills : ['general_support'];
    }
    selectAgent(agents) {
        return agents[Math.floor(Math.random() * agents.length)];
    }
    async executeEscalation(escalation) {
        try {
            escalation.status = 'in_progress';
            escalation.attempts++;
            await this.updateCallEscalation(escalation);
            console.log(`🔄 Executing escalation for call ${escalation.callId} to ${escalation.targetNumber}`);
            escalation.status = 'completed';
            await this.updateCallEscalation(escalation);
        }
        catch (error) {
            console.error('Error executing escalation:', error);
            escalation.status = 'failed';
            await this.updateCallEscalation(escalation);
            throw error;
        }
    }
    async storeHITLConfig(config) {
        await this.redis.setEx(`hitl_config:${config.userId}`, 3600, JSON.stringify(config));
    }
    async getHITLConfig(userId) {
        const configData = await this.redis.get(`hitl_config:${userId}`);
        return configData ? JSON.parse(configData) : null;
    }
    async storeCallEscalation(escalation) {
        await this.redis.setEx(`call_escalation:${escalation.id}`, 3600, JSON.stringify(escalation));
    }
    async updateCallEscalation(escalation) {
        escalation.updatedAt = new Date();
        await this.redis.setEx(`call_escalation:${escalation.id}`, 3600, JSON.stringify(escalation));
    }
    async updateAgent(agent) {
        await this.redis.setEx(`agent:${agent.id}`, 3600, JSON.stringify(agent));
    }
    async getEscalationHistory(userId, limit = 50) {
        return [];
    }
    async getEscalationStats(userId, startDate, endDate) {
        return {
            totalEscalations: 0,
            successfulEscalations: 0,
            failedEscalations: 0,
            averageResponseTime: 0,
            topEscalationReasons: []
        };
    }
}
exports.HITLService = HITLService;
//# sourceMappingURL=HITLService.js.map