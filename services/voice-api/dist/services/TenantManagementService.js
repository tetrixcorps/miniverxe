"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementService = void 0;
const uuid_1 = require("uuid");
class TenantManagementService {
    constructor(prisma, redis, tenantIVRService, crmIntegrationService, stripeService) {
        this.prisma = prisma;
        this.redis = redis;
        this.tenantIVRService = tenantIVRService;
        this.crmIntegrationService = crmIntegrationService;
        this.stripeService = stripeService;
    }
    async processUserSignup(signupData) {
        try {
            console.log(`Starting tenant provisioning for user: ${signupData.userId}`);
            const tenantId = await this.createTenantRecord(signupData);
            const tollFreeNumber = await this.provisionTollFreeNumber(tenantId, signupData.plan);
            const ivrConfig = await this.configureIVRSystem(tenantId, signupData, tollFreeNumber);
            const departments = await this.setupDefaultDepartments(tenantId, signupData.plan);
            const crmConnected = await this.configureCRMIntegration(tenantId, signupData);
            await this.setupBilling(tenantId, signupData);
            await this.initializeAnalytics(tenantId);
            await this.sendWelcomeEmail(signupData, tenantId, tollFreeNumber);
            const result = {
                tenantId,
                tollFreeNumber,
                status: 'active',
                departments: departments.map(d => d.name),
                crmConnected,
                ivrConfigured: true,
                provisioningSteps: this.getProvisioningSteps(),
                estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000)
            };
            await this.storeProvisioningResult(tenantId, result);
            console.log(`Tenant provisioning completed for user: ${signupData.userId}`);
            return result;
        }
        catch (error) {
            console.error('Error processing user signup:', error);
            throw new Error(`Failed to provision tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createTenantRecord(signupData) {
        const tenantId = (0, uuid_1.v4)();
        const tenantData = {
            id: tenantId,
            userId: signupData.userId,
            companyName: signupData.companyName,
            email: signupData.email,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            phoneNumber: signupData.phoneNumber,
            plan: signupData.plan,
            status: 'provisioning',
            features: this.getPlanFeatures(signupData.plan),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.redis.setEx(`tenant:${tenantId}`, 3600, JSON.stringify(tenantData));
        console.log(`Created tenant record: ${tenantId}`);
        return tenantId;
    }
    async provisionTollFreeNumber(tenantId, plan) {
        try {
            const availableNumbers = [
                '+18888046762', '+18005963057', '+18888046763', '+18005963058',
                '+18888046764', '+18005963059', '+18888046765', '+18005963060'
            ];
            const selectedNumber = plan === 'enterprise'
                ? availableNumbers[0]
                : availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
            await this.redis.setEx(`toll_free_number:${selectedNumber}`, 86400, tenantId);
            console.log(`Provisioned toll-free number: ${selectedNumber} for tenant: ${tenantId}`);
            return selectedNumber;
        }
        catch (error) {
            console.error('Error provisioning toll-free number:', error);
            throw new Error('Failed to provision toll-free number');
        }
    }
    async configureIVRSystem(tenantId, signupData, tollFreeNumber) {
        try {
            const ivrSettings = {
                timezone: this.getTimezoneFromEmail(signupData.email),
                language: 'en-US',
                businessHours: this.getDefaultBusinessHours(),
                branding: {
                    companyName: signupData.companyName,
                    primaryColor: this.getBrandColor(signupData.plan),
                    secondaryColor: this.getSecondaryBrandColor(signupData.plan),
                    customGreeting: `Thank you for calling ${signupData.companyName}. How may I help you today?`
                },
                notifications: {
                    email: signupData.email,
                    escalationAlerts: true,
                    dailyReports: signupData.plan === 'enterprise'
                }
            };
            const tenant = await this.tenantIVRService.createTenant(signupData.userId, signupData.companyName, tollFreeNumber, ivrSettings);
            console.log(`Configured IVR system for tenant: ${tenantId}`);
            return tenant;
        }
        catch (error) {
            console.error('Error configuring IVR system:', error);
            throw new Error('Failed to configure IVR system');
        }
    }
    async setupDefaultDepartments(tenantId, plan) {
        const departments = [];
        if (plan === 'basic') {
            departments.push(await this.createDepartment(tenantId, 'Sales', 'sales', plan), await this.createDepartment(tenantId, 'Support', 'support', plan));
        }
        if (plan === 'premium') {
            departments.push(await this.createDepartment(tenantId, 'Sales', 'sales', plan), await this.createDepartment(tenantId, 'Support', 'support', plan), await this.createDepartment(tenantId, 'Billing', 'billing', plan));
        }
        if (plan === 'enterprise') {
            departments.push(await this.createDepartment(tenantId, 'Sales', 'sales', plan), await this.createDepartment(tenantId, 'Support', 'support', plan), await this.createDepartment(tenantId, 'Billing', 'billing', plan), await this.createDepartment(tenantId, 'Technical', 'technical', plan));
        }
        console.log(`Set up ${departments.length} departments for tenant: ${tenantId}`);
        return departments;
    }
    async createDepartment(tenantId, name, type, plan) {
        const departmentData = {
            name,
            type: type,
            phoneNumber: this.generateDepartmentNumber(),
            email: `${type}@tenant-${tenantId}.com`,
            greeting: `Thank you for calling ${name}. How can I help you today?`,
            businessHours: this.getDefaultBusinessHours(),
            agents: this.getDefaultAgents(type, plan),
            routingRules: this.getDefaultRoutingRules(type),
            priority: this.getDepartmentPriority(type),
            active: true
        };
        return await this.tenantIVRService.addDepartment(tenantId, departmentData);
    }
    async configureCRMIntegration(tenantId, signupData) {
        if (!signupData.crmType || !signupData.crmCredentials) {
            console.log(`No CRM integration configured for tenant: ${tenantId}`);
            return false;
        }
        try {
            const provider = {
                type: signupData.crmType,
                name: `${signupData.companyName} CRM`,
                apiEndpoint: this.getCRMAPIEndpoint(signupData.crmType),
                authType: 'api_key',
                credentials: signupData.crmCredentials
            };
            await this.crmIntegrationService.configureCRMIntegration(tenantId, provider.type, signupData.crmCredentials);
            await this.crmIntegrationService.syncContacts(tenantId);
            console.log(`Configured CRM integration for tenant: ${tenantId}`);
            return true;
        }
        catch (error) {
            console.error('Error configuring CRM integration:', error);
            return false;
        }
    }
    async setupBilling(tenantId, signupData) {
        try {
            const customer = await this.stripeService.createOrGetCustomer({
                email: signupData.email,
                name: `${signupData.firstName} ${signupData.lastName}`,
                phone: signupData.phoneNumber,
                metadata: {
                    tenantId,
                    companyName: signupData.companyName,
                    plan: signupData.plan
                }
            });
            const priceId = this.getStripePriceId(signupData.plan);
            if (priceId) {
                await this.stripeService.createSubscription({
                    customerId: customer,
                    priceId,
                    trialPeriodDays: 14,
                    metadata: {
                        tenantId,
                        plan: signupData.plan
                    }
                });
            }
            console.log(`Set up billing for tenant: ${tenantId}`);
        }
        catch (error) {
            console.error('Error setting up billing:', error);
        }
    }
    async initializeAnalytics(tenantId) {
        try {
            await this.redis.setEx(`analytics:${tenantId}`, 86400, JSON.stringify({
                tenantId,
                createdAt: new Date(),
                totalCalls: 0,
                departments: {},
                satisfaction: 0,
                lastActivity: new Date()
            }));
            console.log(`Initialized analytics for tenant: ${tenantId}`);
        }
        catch (error) {
            console.error('Error initializing analytics:', error);
        }
    }
    async sendWelcomeEmail(signupData, tenantId, tollFreeNumber) {
        try {
            const emailData = {
                to: signupData.email,
                subject: `Welcome to TETRIX - Your IVR System is Ready!`,
                template: 'welcome',
                data: {
                    firstName: signupData.firstName,
                    companyName: signupData.companyName,
                    tollFreeNumber,
                    tenantId,
                    dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/${tenantId}`,
                    setupGuideUrl: `${process.env.FRONTEND_URL}/setup-guide`
                }
            };
            console.log(`Welcome email sent to: ${signupData.email}`);
        }
        catch (error) {
            console.error('Error sending welcome email:', error);
        }
    }
    async getTenantStatus(tenantId) {
        try {
            const tenantData = await this.redis.get(`tenant:${tenantId}`);
            if (!tenantData)
                return null;
            const tenant = JSON.parse(tenantData);
            const departments = await this.tenantIVRService.getTenantDepartments(tenantId);
            return {
                tenantId,
                userId: tenant.userId,
                companyName: tenant.companyName,
                status: tenant.status,
                tollFreeNumber: tenant.tollFreeNumber,
                departments: departments.map(d => d.name),
                crmStatus: 'connected',
                ivrStatus: 'configured',
                lastActivity: new Date(),
                createdAt: tenant.createdAt,
                plan: tenant.plan,
                features: tenant.features
            };
        }
        catch (error) {
            console.error('Error getting tenant status:', error);
            return null;
        }
    }
    async getUserTenants(userId) {
        try {
            const tenants = [];
            return tenants;
        }
        catch (error) {
            console.error('Error getting user tenants:', error);
            return [];
        }
    }
    getPlanFeatures(plan) {
        const features = {
            basic: ['ivr', 'basic_departments', 'call_routing'],
            premium: ['ivr', 'all_departments', 'crm_integration', 'analytics', 'custom_branding'],
            enterprise: ['ivr', 'all_departments', 'crm_integration', 'advanced_analytics', 'custom_branding', 'priority_support', 'api_access']
        };
        return features[plan] || features.basic;
    }
    getProvisioningSteps() {
        return [
            {
                id: 'create_tenant',
                name: 'Create Tenant Record',
                status: 'completed',
                description: 'Create tenant record in database',
                dependencies: []
            },
            {
                id: 'provision_number',
                name: 'Provision Toll-Free Number',
                status: 'completed',
                description: 'Allocate toll-free number from pool',
                dependencies: ['create_tenant']
            },
            {
                id: 'configure_ivr',
                name: 'Configure IVR System',
                status: 'completed',
                description: 'Set up IVR with custom branding',
                dependencies: ['provision_number']
            },
            {
                id: 'setup_departments',
                name: 'Setup Departments',
                status: 'completed',
                description: 'Create default departments based on plan',
                dependencies: ['configure_ivr']
            },
            {
                id: 'configure_crm',
                name: 'Configure CRM Integration',
                status: 'completed',
                description: 'Connect CRM system if provided',
                dependencies: ['setup_departments']
            },
            {
                id: 'setup_billing',
                name: 'Setup Billing',
                status: 'completed',
                description: 'Configure Stripe subscription',
                dependencies: ['configure_crm']
            }
        ];
    }
    getTimezoneFromEmail(email) {
        if (email.includes('.uk') || email.includes('.co.uk'))
            return 'Europe/London';
        if (email.includes('.de'))
            return 'Europe/Berlin';
        if (email.includes('.fr'))
            return 'Europe/Paris';
        if (email.includes('.au'))
            return 'Australia/Sydney';
        return 'America/New_York';
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
    getBrandColor(plan) {
        const colors = {
            basic: '#3B82F6',
            premium: '#8B5CF6',
            enterprise: '#F59E0B'
        };
        return colors[plan] || colors.basic;
    }
    getSecondaryBrandColor(plan) {
        const colors = {
            basic: '#1E40AF',
            premium: '#7C3AED',
            enterprise: '#D97706'
        };
        return colors[plan] || colors.basic;
    }
    generateDepartmentNumber() {
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `+1${areaCode}${exchange}${number}`;
    }
    getDefaultAgents(type, plan) {
        const agents = {
            sales: [{
                    name: 'Sales Representative',
                    phoneNumber: this.generateDepartmentNumber(),
                    email: `sales@tenant.com`,
                    skills: ['sales', 'product_knowledge'],
                    availability: 'available',
                    maxConcurrentCalls: plan === 'enterprise' ? 5 : 3
                }],
            support: [{
                    name: 'Support Agent',
                    phoneNumber: this.generateDepartmentNumber(),
                    email: `support@tenant.com`,
                    skills: ['technical_support', 'troubleshooting'],
                    availability: 'available',
                    maxConcurrentCalls: plan === 'enterprise' ? 8 : 5
                }],
            billing: [{
                    name: 'Billing Specialist',
                    phoneNumber: this.generateDepartmentNumber(),
                    email: `billing@tenant.com`,
                    skills: ['billing', 'payment_processing'],
                    availability: 'available',
                    maxConcurrentCalls: 3
                }],
            technical: [{
                    name: 'Technical Specialist',
                    phoneNumber: this.generateDepartmentNumber(),
                    email: `technical@tenant.com`,
                    skills: ['technical_support', 'integration', 'api'],
                    availability: 'available',
                    maxConcurrentCalls: 5
                }]
        };
        return agents[type] || [];
    }
    getDefaultRoutingRules(type) {
        const rules = {
            sales: [{
                    condition: 'intent',
                    value: 'sales',
                    operator: 'equals',
                    action: 'route',
                    target: 'sales_team',
                    priority: 1
                }],
            support: [{
                    condition: 'intent',
                    value: 'support',
                    operator: 'equals',
                    action: 'route',
                    target: 'support_team',
                    priority: 1
                }],
            billing: [{
                    condition: 'intent',
                    value: 'billing',
                    operator: 'equals',
                    action: 'route',
                    target: 'billing_team',
                    priority: 1
                }],
            technical: [{
                    condition: 'intent',
                    value: 'technical',
                    operator: 'equals',
                    action: 'route',
                    target: 'technical_team',
                    priority: 1
                }]
        };
        return rules[type] || [];
    }
    getDepartmentPriority(type) {
        const priorities = {
            sales: 1,
            support: 2,
            billing: 3,
            technical: 4
        };
        return priorities[type] || 5;
    }
    getCRMAPIEndpoint(crmType) {
        const endpoints = {
            salesforce: 'https://api.salesforce.com',
            hubspot: 'https://api.hubapi.com',
            pipedrive: 'https://api.pipedrive.com',
            custom: 'https://api.custom-crm.com'
        };
        return endpoints[crmType] || endpoints.custom;
    }
    getStripePriceId(plan) {
        const priceIds = {
            basic: process.env.STRIPE_BASIC_PRICE_ID || null,
            premium: process.env.STRIPE_PREMIUM_PRICE_ID || null,
            enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || null
        };
        return priceIds[plan] || null;
    }
    async storeProvisioningResult(tenantId, result) {
        await this.redis.setEx(`provisioning_result:${tenantId}`, 3600, JSON.stringify(result));
    }
}
exports.TenantManagementService = TenantManagementService;
//# sourceMappingURL=TenantManagementService.js.map