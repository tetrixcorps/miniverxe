"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantIVRService = void 0;
const uuid_1 = require("uuid");
class TenantIVRService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createTenant(userId, companyName, tollFreeNumber, settings = {}) {
        const tenant = {
            id: (0, uuid_1.v4)(),
            userId,
            companyName,
            tollFreeNumber,
            status: 'active',
            settings: {
                timezone: 'UTC',
                language: 'en-US',
                businessHours: {
                    timezone: 'UTC',
                    weekdays: {
                        enabled: true,
                        startTime: '09:00',
                        endTime: '17:00',
                        greeting: `Thank you for calling ${companyName}. How may I help you today?`,
                        afterHoursGreeting: `Thank you for calling ${companyName}. We're currently closed. Please leave a message and we'll call you back.`
                    },
                    weekends: {
                        enabled: false,
                        startTime: '09:00',
                        endTime: '17:00',
                        greeting: `Thank you for calling ${companyName}. How may I help you today?`,
                        afterHoursGreeting: `Thank you for calling ${companyName}. We're currently closed. Please leave a message and we'll call you back.`
                    },
                    holidays: []
                },
                branding: {
                    companyName,
                    primaryColor: '#3B82F6',
                    secondaryColor: '#1E40AF'
                },
                notifications: {
                    email: '',
                    escalationAlerts: true,
                    dailyReports: false
                },
                integrations: {
                    syncEnabled: false,
                    syncInterval: 60
                },
                ...settings
            },
            departments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeTenant(tenant);
        return tenant;
    }
    async addDepartment(tenantId, departmentData) {
        const department = {
            id: (0, uuid_1.v4)(),
            tenantId,
            ...departmentData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeDepartment(department);
        return department;
    }
    async processTenantCall(tollFreeNumber, callerId, userInput) {
        try {
            const tenant = await this.getTenantByTollFreeNumber(tollFreeNumber);
            if (!tenant) {
                throw new Error(`Tenant not found for toll-free number: ${tollFreeNumber}`);
            }
            const customerContext = await this.getCustomerContext(tenant.id, callerId);
            const isBusinessHours = this.isBusinessHours(tenant.settings.businessHours);
            const greeting = isBusinessHours
                ? tenant.settings.businessHours.weekdays.greeting
                : tenant.settings.businessHours.weekdays.afterHoursGreeting;
            if (!userInput) {
                return {
                    action: 'speak_and_gather',
                    message: greeting,
                    departments: tenant.departments.filter(d => d.active).map(d => ({
                        id: d.id,
                        name: d.name,
                        type: d.type,
                        greeting: d.greeting
                    }))
                };
            }
            const routingDecision = await this.routeToDepartment(tenant, userInput, customerContext);
            return {
                action: 'route',
                department: routingDecision.department,
                message: routingDecision.message,
                transferTo: routingDecision.phoneNumber
            };
        }
        catch (error) {
            console.error('Error processing tenant call:', error);
            return {
                action: 'error',
                message: 'We apologize, but we are experiencing technical difficulties. Please try again later.'
            };
        }
    }
    async routeToDepartment(tenant, userInput, customerContext) {
        const lowerInput = userInput.toLowerCase();
        for (const department of tenant.departments.filter(d => d.active)) {
            for (const rule of department.routingRules) {
                if (this.evaluateRoutingRule(rule, userInput, customerContext)) {
                    return {
                        department: department.name,
                        message: department.greeting,
                        phoneNumber: department.phoneNumber,
                        departmentId: department.id
                    };
                }
            }
        }
        const intent = this.analyzeIntent(lowerInput);
        const department = this.getDepartmentByIntent(tenant, intent);
        if (department) {
            return {
                department: department.name,
                message: department.greeting,
                phoneNumber: department.phoneNumber,
                departmentId: department.id
            };
        }
        const fallbackDepartment = tenant.departments.find(d => d.active);
        if (fallbackDepartment) {
            return {
                department: fallbackDepartment.name,
                message: fallbackDepartment.greeting,
                phoneNumber: fallbackDepartment.phoneNumber,
                departmentId: fallbackDepartment.id
            };
        }
        throw new Error('No available departments found');
    }
    evaluateRoutingRule(rule, userInput, customerContext) {
        let value;
        switch (rule.condition) {
            case 'intent':
                value = this.analyzeIntent(userInput);
                break;
            case 'sentiment':
                value = this.analyzeSentiment(userInput);
                break;
            case 'customer_tier':
                value = customerContext.tier;
                break;
            case 'time_of_day':
                value = new Date().getHours();
                break;
            case 'keyword':
                value = userInput;
                break;
            default:
                return false;
        }
        return this.evaluateCondition(value, rule.operator, rule.value);
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
            default:
                return false;
        }
    }
    analyzeIntent(userInput) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('buy') || lowerInput.includes('purchase') || lowerInput.includes('price')) {
            return 'sales';
        }
        else if (lowerInput.includes('help') || lowerInput.includes('problem') || lowerInput.includes('issue')) {
            return 'support';
        }
        else if (lowerInput.includes('bill') || lowerInput.includes('payment') || lowerInput.includes('refund')) {
            return 'billing';
        }
        else if (lowerInput.includes('technical') || lowerInput.includes('setup') || lowerInput.includes('install')) {
            return 'technical';
        }
        else {
            return 'general';
        }
    }
    analyzeSentiment(userInput) {
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied'];
        const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated'];
        const lowerInput = userInput.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerInput.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerInput.includes(word)).length;
        if (positiveCount > negativeCount)
            return 0.7;
        if (negativeCount > positiveCount)
            return 0.3;
        return 0.5;
    }
    getDepartmentByIntent(tenant, intent) {
        const departmentMap = {
            'sales': 'sales',
            'support': 'support',
            'billing': 'billing',
            'technical': 'technical',
            'general': 'support'
        };
        const departmentType = departmentMap[intent] || 'support';
        return tenant.departments.find(d => d.type === departmentType && d.active) || null;
    }
    isBusinessHours(businessHours) {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const isWeekend = day === 0 || day === 6;
        const schedule = isWeekend ? businessHours.weekends : businessHours.weekdays;
        if (!schedule.enabled)
            return false;
        const startHour = parseInt(schedule.startTime.split(':')[0]);
        const endHour = parseInt(schedule.endTime.split(':')[0]);
        return hour >= startHour && hour < endHour;
    }
    async getCustomerContext(tenantId, phoneNumber) {
        const cached = await this.redis.get(`customer_context:${tenantId}:${phoneNumber}`);
        if (cached) {
            return JSON.parse(cached);
        }
        const context = {
            tenantId,
            phoneNumber,
            tier: 'basic',
            history: [],
            preferences: {
                language: 'en-US',
                communicationMethod: 'call',
                doNotCall: false,
                doNotEmail: false
            },
            tags: []
        };
        await this.redis.setEx(`customer_context:${tenantId}:${phoneNumber}`, 3600, JSON.stringify(context));
        return context;
    }
    async storeTenant(tenant) {
        await this.redis.setEx(`tenant:${tenant.id}`, 3600, JSON.stringify(tenant));
        await this.redis.setEx(`tenant_by_number:${tenant.tollFreeNumber}`, 3600, tenant.id);
    }
    async getTenant(tenantId) {
        const tenantData = await this.redis.get(`tenant:${tenantId}`);
        return tenantData ? JSON.parse(tenantData) : null;
    }
    async getTenantByTollFreeNumber(tollFreeNumber) {
        const tenantId = await this.redis.get(`tenant_by_number:${tollFreeNumber}`);
        if (!tenantId)
            return null;
        return await this.getTenant(tenantId);
    }
    async storeDepartment(department) {
        await this.redis.setEx(`department:${department.id}`, 3600, JSON.stringify(department));
    }
    async getTenantDepartments(tenantId) {
        const tenant = await this.getTenant(tenantId);
        return tenant ? tenant.departments : [];
    }
    async updateTenantSettings(tenantId, settings) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant)
            throw new Error('Tenant not found');
        tenant.settings = { ...tenant.settings, ...settings };
        tenant.updatedAt = new Date();
        await this.storeTenant(tenant);
    }
    async getTenantAnalytics(tenantId, startDate, endDate) {
        return {
            totalCalls: 0,
            departmentDistribution: {},
            averageCallDuration: 0,
            customerSatisfaction: 0,
            peakHours: [],
            topIssues: []
        };
    }
}
exports.TenantIVRService = TenantIVRService;
//# sourceMappingURL=TenantIVRService.js.map