"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const TenantManagementService_1 = require("../services/TenantManagementService");
const DepartmentConfigurationService_1 = require("../services/DepartmentConfigurationService");
const MultiTenantIVRRouter_1 = require("../services/MultiTenantIVRRouter");
const CustomerDataIsolationService_1 = require("../services/CustomerDataIsolationService");
const TenantIVRService_1 = require("../services/TenantIVRService");
const CRMIntegrationService_1 = require("../services/CRMIntegrationService");
const StripeService_1 = require("../services/StripeService");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const tenantIVRService = new TenantIVRService_1.TenantIVRService(prisma, redis);
const crmIntegrationService = new CRMIntegrationService_1.CRMIntegrationService(prisma, redis);
const stripeService = new StripeService_1.StripeService(prisma, redis);
const departmentConfigService = new DepartmentConfigurationService_1.DepartmentConfigurationService(prisma, redis);
const customerDataIsolationService = new CustomerDataIsolationService_1.CustomerDataIsolationService(prisma, redis);
const tenantManagementService = new TenantManagementService_1.TenantManagementService(prisma, redis, tenantIVRService, crmIntegrationService, stripeService);
const multiTenantIVRRouter = new MultiTenantIVRRouter_1.MultiTenantIVRRouter(prisma, redis, tenantIVRService, departmentConfigService, crmIntegrationService);
const userSignupSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    companyName: joi_1.default.string().required(),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    phoneNumber: joi_1.default.string().optional(),
    plan: joi_1.default.string().valid('basic', 'premium', 'enterprise').required(),
    crmType: joi_1.default.string().valid('salesforce', 'hubspot', 'pipedrive', 'custom').optional(),
    crmCredentials: joi_1.default.object().optional()
});
const departmentConfigSchema = joi_1.default.object({
    templateId: joi_1.default.string().required(),
    customizations: joi_1.default.object().optional()
});
const callRoutingSchema = joi_1.default.object({
    tollFreeNumber: joi_1.default.string().required(),
    callerId: joi_1.default.string().required(),
    userInput: joi_1.default.string().optional()
});
const dataIsolationSchema = joi_1.default.object({
    dataRetentionDays: joi_1.default.number().min(30).max(2555).optional(),
    encryptionEnabled: joi_1.default.boolean().optional(),
    anonymizationEnabled: joi_1.default.boolean().optional(),
    crossTenantSharing: joi_1.default.boolean().optional(),
    gdprCompliant: joi_1.default.boolean().optional(),
    ccpCompliant: joi_1.default.boolean().optional(),
    dataClassification: joi_1.default.string().valid('public', 'internal', 'confidential', 'restricted').optional(),
    auditLogging: joi_1.default.boolean().optional()
});
router.post('/tenant/signup', async (req, res) => {
    try {
        const { error, value } = userSignupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const result = await tenantManagementService.processUserSignup(value);
        return res.json({
            success: true,
            data: result,
            message: 'Tenant provisioning initiated successfully'
        });
    }
    catch (error) {
        console.error('Error processing user signup:', error);
        return res.status(500).json({
            error: 'Failed to process user signup',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/tenant/:tenantId/status', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const status = await tenantManagementService.getTenantStatus(tenantId);
        if (!status) {
            return res.status(404).json({
                success: false,
                error: 'Tenant not found'
            });
        }
        return res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        console.error('Error getting tenant status:', error);
        return res.status(500).json({
            error: 'Failed to get tenant status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/user/:userId/tenants', async (req, res) => {
    try {
        const { userId } = req.params;
        const tenants = await tenantManagementService.getUserTenants(userId);
        return res.json({
            success: true,
            data: tenants
        });
    }
    catch (error) {
        console.error('Error getting user tenants:', error);
        return res.status(500).json({
            error: 'Failed to get user tenants',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/departments/template', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { error, value } = departmentConfigSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { templateId, customizations } = value;
        const department = await departmentConfigService.createDepartmentFromTemplate(tenantId, templateId, customizations);
        return res.json({
            success: true,
            data: department,
            message: 'Department created from template successfully'
        });
    }
    catch (error) {
        console.error('Error creating department from template:', error);
        return res.status(500).json({
            error: 'Failed to create department from template',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/departments/custom', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const department = await departmentConfigService.createCustomDepartment(tenantId, req.body);
        return res.json({
            success: true,
            data: department,
            message: 'Custom department created successfully'
        });
    }
    catch (error) {
        console.error('Error creating custom department:', error);
        return res.status(500).json({
            error: 'Failed to create custom department',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/templates/:plan', async (req, res) => {
    try {
        const { plan } = req.params;
        const templates = departmentConfigService.getAvailableTemplates(plan);
        return res.json({
            success: true,
            data: templates
        });
    }
    catch (error) {
        console.error('Error getting templates:', error);
        return res.status(500).json({
            error: 'Failed to get templates',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/tenant/:tenantId/departments/:departmentId', async (req, res) => {
    try {
        const { tenantId, departmentId } = req.params;
        const department = await departmentConfigService.updateDepartmentConfig(tenantId, departmentId, req.body);
        return res.json({
            success: true,
            data: department,
            message: 'Department configuration updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating department configuration:', error);
        return res.status(500).json({
            error: 'Failed to update department configuration',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/tenant/:tenantId/departments', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const departments = await departmentConfigService.getTenantDepartmentConfigs(tenantId);
        return res.json({
            success: true,
            data: departments
        });
    }
    catch (error) {
        console.error('Error getting tenant departments:', error);
        return res.status(500).json({
            error: 'Failed to get tenant departments',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/call/route', async (req, res) => {
    try {
        const { error, value } = callRoutingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { tollFreeNumber, callerId, userInput } = value;
        const result = await multiTenantIVRRouter.routeCall(tollFreeNumber, callerId, userInput);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error routing call:', error);
        return res.status(500).json({
            error: 'Failed to route call',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/data-isolation', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { error, value } = dataIsolationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const config = await customerDataIsolationService.initializeTenantDataIsolation(tenantId, value);
        return res.json({
            success: true,
            data: config,
            message: 'Data isolation initialized successfully'
        });
    }
    catch (error) {
        console.error('Error initializing data isolation:', error);
        return res.status(500).json({
            error: 'Failed to initialize data isolation',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/customers', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const customer = await customerDataIsolationService.storeCustomerData(tenantId, req.body);
        return res.json({
            success: true,
            data: customer,
            message: 'Customer data stored successfully'
        });
    }
    catch (error) {
        console.error('Error storing customer data:', error);
        return res.status(500).json({
            error: 'Failed to store customer data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/tenant/:tenantId/customers/:customerId', async (req, res) => {
    try {
        const { tenantId, customerId } = req.params;
        const requestingUserId = req.headers['x-user-id'] || 'system';
        const customer = await customerDataIsolationService.getCustomerData(tenantId, customerId, requestingUserId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found'
            });
        }
        return res.json({
            success: true,
            data: customer
        });
    }
    catch (error) {
        console.error('Error getting customer data:', error);
        return res.status(500).json({
            error: 'Failed to get customer data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/tenant/:tenantId/customers', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const requestingUserId = req.headers['x-user-id'] || 'system';
        const query = req.query;
        const customers = await customerDataIsolationService.searchCustomers(tenantId, query, requestingUserId);
        return res.json({
            success: true,
            data: customers
        });
    }
    catch (error) {
        console.error('Error searching customers:', error);
        return res.status(500).json({
            error: 'Failed to search customers',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/customers/:customerId/anonymize', async (req, res) => {
    try {
        const { tenantId, customerId } = req.params;
        await customerDataIsolationService.anonymizeCustomerData(tenantId, customerId);
        return res.json({
            success: true,
            message: 'Customer data anonymized successfully'
        });
    }
    catch (error) {
        console.error('Error anonymizing customer data:', error);
        return res.status(500).json({
            error: 'Failed to anonymize customer data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.delete('/tenant/:tenantId/customers/:customerId', async (req, res) => {
    try {
        const { tenantId, customerId } = req.params;
        await customerDataIsolationService.deleteCustomerData(tenantId, customerId);
        return res.json({
            success: true,
            message: 'Customer data deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting customer data:', error);
        return res.status(500).json({
            error: 'Failed to delete customer data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/setup-complete', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { departments, crmConfig, dataIsolationConfig } = req.body;
        const departmentResults = [];
        for (const dept of departments) {
            if (dept.templateId) {
                const result = await departmentConfigService.createDepartmentFromTemplate(tenantId, dept.templateId, dept.customizations);
                departmentResults.push(result);
            }
            else {
                const result = await departmentConfigService.createCustomDepartment(tenantId, dept);
                departmentResults.push(result);
            }
        }
        let crmResult = null;
        if (crmConfig) {
            crmResult = await crmIntegrationService.configureCRMIntegration(tenantId, crmConfig.type, crmConfig);
        }
        const dataIsolationResult = await customerDataIsolationService.initializeTenantDataIsolation(tenantId, dataIsolationConfig);
        return res.json({
            success: true,
            data: {
                tenantId,
                departments: departmentResults,
                crm: crmResult,
                dataIsolation: dataIsolationResult
            },
            message: 'Complete tenant setup finished successfully'
        });
    }
    catch (error) {
        console.error('Error completing tenant setup:', error);
        return res.status(500).json({
            error: 'Failed to complete tenant setup',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        return res.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'integration',
                version: '1.0.0',
                integrationPoints: [
                    'tenant-management',
                    'department-configuration',
                    'multi-tenant-ivr-router',
                    'customer-data-isolation',
                    'crm-synchronization'
                ]
            }
        });
    }
    catch (error) {
        console.error('Error checking integration health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=integration.js.map