"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentConfigurationService = void 0;
const uuid_1 = require("uuid");
class DepartmentConfigurationService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.departmentTemplates = new Map();
        this.initializeTemplates();
    }
    initializeTemplates() {
        this.departmentTemplates.set('sales', {
            id: 'sales',
            name: 'Sales Department',
            type: 'sales',
            description: 'Handles sales inquiries, product information, and lead conversion',
            plan: 'basic',
            features: ['lead_routing', 'product_catalog', 'pricing_quotes', 'follow_up_scheduling'],
            defaultConfig: {
                name: 'Sales',
                type: 'sales',
                phoneNumber: '',
                email: 'sales@company.com',
                greeting: 'Thank you for calling Sales. How can I help you today?',
                businessHours: this.getDefaultBusinessHours(),
                agents: [],
                routingRules: [],
                priority: 1,
                active: true,
                customFields: {},
                integrations: []
            },
            routingRules: [
                {
                    id: 'sales_intent',
                    name: 'Sales Intent Routing',
                    condition: {
                        type: 'intent',
                        operator: 'equals',
                        value: 'sales'
                    },
                    action: {
                        type: 'route',
                        target: 'sales_team',
                        parameters: {}
                    },
                    priority: 1,
                    description: 'Route calls with sales intent to sales team'
                },
                {
                    id: 'premium_customer_sales',
                    name: 'Premium Customer Sales',
                    condition: {
                        type: 'customer_tier',
                        operator: 'equals',
                        value: 'premium'
                    },
                    action: {
                        type: 'route',
                        target: 'senior_sales_team',
                        parameters: {}
                    },
                    priority: 2,
                    description: 'Route premium customers to senior sales team'
                }
            ],
            agentTemplates: [
                {
                    id: 'sales_rep',
                    name: 'Sales Representative',
                    skills: ['sales', 'product_knowledge', 'lead_qualification'],
                    maxConcurrentCalls: 3,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'Standard sales representative'
                },
                {
                    id: 'senior_sales_rep',
                    name: 'Senior Sales Representative',
                    skills: ['sales', 'product_knowledge', 'enterprise_sales', 'negotiation'],
                    maxConcurrentCalls: 2,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'Senior sales representative for complex deals'
                }
            ]
        });
        this.departmentTemplates.set('support', {
            id: 'support',
            name: 'Customer Support',
            type: 'support',
            description: 'Provides technical support and customer assistance',
            plan: 'basic',
            features: ['ticket_creation', 'knowledge_base', 'escalation', 'satisfaction_tracking'],
            defaultConfig: {
                name: 'Support',
                type: 'support',
                phoneNumber: '',
                email: 'support@company.com',
                greeting: 'Thank you for calling Support. How can I assist you today?',
                businessHours: this.getDefaultBusinessHours(),
                agents: [],
                routingRules: [],
                priority: 2,
                active: true,
                customFields: {},
                integrations: []
            },
            routingRules: [
                {
                    id: 'support_intent',
                    name: 'Support Intent Routing',
                    condition: {
                        type: 'intent',
                        operator: 'equals',
                        value: 'support'
                    },
                    action: {
                        type: 'route',
                        target: 'support_team',
                        parameters: {}
                    },
                    priority: 1,
                    description: 'Route calls with support intent to support team'
                },
                {
                    id: 'technical_issue',
                    name: 'Technical Issue Routing',
                    condition: {
                        type: 'keyword',
                        operator: 'contains',
                        value: ['technical', 'bug', 'error', 'not working']
                    },
                    action: {
                        type: 'route',
                        target: 'technical_support',
                        parameters: {}
                    },
                    priority: 2,
                    description: 'Route technical issues to technical support'
                }
            ],
            agentTemplates: [
                {
                    id: 'support_agent',
                    name: 'Support Agent',
                    skills: ['technical_support', 'troubleshooting', 'customer_service'],
                    maxConcurrentCalls: 5,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'General support agent'
                },
                {
                    id: 'technical_specialist',
                    name: 'Technical Specialist',
                    skills: ['technical_support', 'debugging', 'integration', 'api_support'],
                    maxConcurrentCalls: 3,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'Technical specialist for complex issues'
                }
            ]
        });
        this.departmentTemplates.set('billing', {
            id: 'billing',
            name: 'Billing Department',
            type: 'billing',
            description: 'Handles billing inquiries, payments, and account management',
            plan: 'premium',
            features: ['payment_processing', 'invoice_management', 'refund_processing', 'account_updates'],
            defaultConfig: {
                name: 'Billing',
                type: 'billing',
                phoneNumber: '',
                email: 'billing@company.com',
                greeting: 'Thank you for calling Billing. How can I help you with your account?',
                businessHours: this.getDefaultBusinessHours(),
                agents: [],
                routingRules: [],
                priority: 3,
                active: true,
                customFields: {},
                integrations: []
            },
            routingRules: [
                {
                    id: 'billing_intent',
                    name: 'Billing Intent Routing',
                    condition: {
                        type: 'intent',
                        operator: 'equals',
                        value: 'billing'
                    },
                    action: {
                        type: 'route',
                        target: 'billing_team',
                        parameters: {}
                    },
                    priority: 1,
                    description: 'Route calls with billing intent to billing team'
                },
                {
                    id: 'payment_issue',
                    name: 'Payment Issue Routing',
                    condition: {
                        type: 'keyword',
                        operator: 'contains',
                        value: ['payment', 'charge', 'refund', 'invoice']
                    },
                    action: {
                        type: 'route',
                        target: 'billing_team',
                        parameters: {}
                    },
                    priority: 2,
                    description: 'Route payment-related calls to billing team'
                }
            ],
            agentTemplates: [
                {
                    id: 'billing_specialist',
                    name: 'Billing Specialist',
                    skills: ['billing', 'payment_processing', 'account_management'],
                    maxConcurrentCalls: 3,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'Billing specialist for account and payment issues'
                }
            ]
        });
        this.departmentTemplates.set('technical', {
            id: 'technical',
            name: 'Technical Department',
            type: 'technical',
            description: 'Provides advanced technical support and integration assistance',
            plan: 'enterprise',
            features: ['api_support', 'integration_assistance', 'custom_development', 'architecture_review'],
            defaultConfig: {
                name: 'Technical',
                type: 'technical',
                phoneNumber: '',
                email: 'technical@company.com',
                greeting: 'Thank you for calling Technical Support. How can I assist you today?',
                businessHours: this.getDefaultBusinessHours(),
                agents: [],
                routingRules: [],
                priority: 4,
                active: true,
                customFields: {},
                integrations: []
            },
            routingRules: [
                {
                    id: 'technical_intent',
                    name: 'Technical Intent Routing',
                    condition: {
                        type: 'intent',
                        operator: 'equals',
                        value: 'technical'
                    },
                    action: {
                        type: 'route',
                        target: 'technical_team',
                        parameters: {}
                    },
                    priority: 1,
                    description: 'Route calls with technical intent to technical team'
                },
                {
                    id: 'api_support',
                    name: 'API Support Routing',
                    condition: {
                        type: 'keyword',
                        operator: 'contains',
                        value: ['api', 'integration', 'webhook', 'sdk']
                    },
                    action: {
                        type: 'route',
                        target: 'api_support_team',
                        parameters: {}
                    },
                    priority: 2,
                    description: 'Route API-related calls to API support team'
                }
            ],
            agentTemplates: [
                {
                    id: 'technical_specialist',
                    name: 'Technical Specialist',
                    skills: ['api_support', 'integration', 'debugging', 'architecture'],
                    maxConcurrentCalls: 3,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'Technical specialist for complex technical issues'
                },
                {
                    id: 'api_specialist',
                    name: 'API Specialist',
                    skills: ['api_support', 'webhook', 'sdk', 'documentation'],
                    maxConcurrentCalls: 4,
                    schedule: this.getDefaultAgentSchedule(),
                    description: 'API specialist for integration and development support'
                }
            ]
        });
    }
    async createDepartmentFromTemplate(tenantId, templateId, customizations = {}) {
        const template = this.departmentTemplates.get(templateId);
        if (!template) {
            throw new Error(`Department template not found: ${templateId}`);
        }
        const departmentConfig = {
            ...template.defaultConfig,
            ...customizations,
            name: customizations.name || template.name,
            phoneNumber: customizations.phoneNumber || this.generatePhoneNumber(),
            email: customizations.email || `${template.type}@tenant-${tenantId}.com`,
            agents: this.createAgentsFromTemplates(template.agentTemplates, customizations.agents || []),
            routingRules: this.createRoutingRulesFromTemplates(template.routingRules, customizations.routingRules || [])
        };
        await this.storeDepartmentConfig(tenantId, departmentConfig);
        return departmentConfig;
    }
    async createCustomDepartment(tenantId, config) {
        this.validateDepartmentConfig(config);
        const departmentId = (0, uuid_1.v4)();
        config.customFields = {
            ...config.customFields,
            id: departmentId,
            tenantId,
            createdAt: new Date().toISOString()
        };
        await this.storeDepartmentConfig(tenantId, config);
        return config;
    }
    async updateDepartmentConfig(tenantId, departmentId, updates) {
        const existingConfig = await this.getDepartmentConfig(tenantId, departmentId);
        if (!existingConfig) {
            throw new Error(`Department not found: ${departmentId}`);
        }
        const updatedConfig = {
            ...existingConfig,
            ...updates,
            customFields: {
                ...existingConfig.customFields,
                ...updates.customFields,
                updatedAt: new Date().toISOString()
            }
        };
        this.validateDepartmentConfig(updatedConfig);
        await this.storeDepartmentConfig(tenantId, updatedConfig);
        return updatedConfig;
    }
    async getDepartmentConfig(tenantId, departmentId) {
        const configData = await this.redis.get(`department_config:${tenantId}:${departmentId}`);
        return configData ? JSON.parse(configData) : null;
    }
    async getTenantDepartmentConfigs(tenantId) {
        const keys = await this.redis.keys(`department_config:${tenantId}:*`);
        const configs = [];
        for (const key of keys) {
            const configData = await this.redis.get(key);
            if (configData) {
                configs.push(JSON.parse(configData));
            }
        }
        return configs;
    }
    async deleteDepartment(tenantId, departmentId) {
        await this.redis.del(`department_config:${tenantId}:${departmentId}`);
    }
    getAvailableTemplates(plan) {
        return Array.from(this.departmentTemplates.values()).filter(template => this.isTemplateAvailableForPlan(template, plan));
    }
    validateDepartmentConfig(config) {
        if (!config.name) {
            throw new Error('Department name is required');
        }
        if (!config.type) {
            throw new Error('Department type is required');
        }
        if (!config.phoneNumber) {
            throw new Error('Phone number is required');
        }
        if (!config.email) {
            throw new Error('Email is required');
        }
        if (!config.greeting) {
            throw new Error('Greeting is required');
        }
        if (!config.businessHours) {
            throw new Error('Business hours configuration is required');
        }
    }
    createAgentsFromTemplates(templates, customAgents) {
        const agents = [];
        for (const template of templates) {
            agents.push({
                id: (0, uuid_1.v4)(),
                name: template.name,
                phoneNumber: this.generatePhoneNumber(),
                email: `${template.name.toLowerCase().replace(/\s+/g, '_')}@company.com`,
                skills: template.skills,
                availability: 'available',
                maxConcurrentCalls: template.maxConcurrentCalls,
                currentCalls: 0,
                schedule: template.schedule,
                customFields: {}
            });
        }
        agents.push(...customAgents);
        return agents;
    }
    createRoutingRulesFromTemplates(templates, customRules) {
        const rules = [];
        for (const template of templates) {
            rules.push({
                id: (0, uuid_1.v4)(),
                name: template.name,
                condition: template.condition,
                action: template.action,
                priority: template.priority,
                active: true,
                description: template.description
            });
        }
        rules.push(...customRules);
        return rules;
    }
    isTemplateAvailableForPlan(template, plan) {
        const planHierarchy = ['basic', 'premium', 'enterprise'];
        const templatePlanIndex = planHierarchy.indexOf(template.plan);
        const userPlanIndex = planHierarchy.indexOf(plan);
        return userPlanIndex >= templatePlanIndex;
    }
    generatePhoneNumber() {
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `+1${areaCode}${exchange}${number}`;
    }
    getDefaultBusinessHours() {
        return {
            timezone: 'America/New_York',
            weekdays: {
                enabled: true,
                startTime: '09:00',
                endTime: '17:00',
                greeting: 'Thank you for calling. How may I help you today?',
                afterHoursGreeting: 'Thank you for calling. We are currently closed. Please leave a message.'
            },
            weekends: {
                enabled: false,
                startTime: '09:00',
                endTime: '17:00',
                greeting: 'Thank you for calling. How may I help you today?',
                afterHoursGreeting: 'Thank you for calling. We are currently closed. Please leave a message.'
            },
            holidays: []
        };
    }
    getDefaultAgentSchedule() {
        return {
            timezone: 'America/New_York',
            workDays: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00',
            breaks: [
                {
                    startTime: '12:00',
                    endTime: '13:00',
                    greeting: 'Thank you for calling. I am currently on break. Please hold or leave a message.'
                }
            ],
            timeOff: []
        };
    }
    async storeDepartmentConfig(tenantId, config) {
        const departmentId = config.customFields?.id || (0, uuid_1.v4)();
        await this.redis.setEx(`department_config:${tenantId}:${departmentId}`, 3600, JSON.stringify(config));
    }
}
exports.DepartmentConfigurationService = DepartmentConfigurationService;
//# sourceMappingURL=DepartmentConfigurationService.js.map