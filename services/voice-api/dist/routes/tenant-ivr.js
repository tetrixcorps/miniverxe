"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const TenantIVRService_1 = require("../services/TenantIVRService");
const CRMIntegrationService_1 = require("../services/CRMIntegrationService");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const tenantIVRService = new TenantIVRService_1.TenantIVRService(prisma, redis);
const crmIntegrationService = new CRMIntegrationService_1.CRMIntegrationService(prisma, redis);
const createTenantSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    companyName: joi_1.default.string().required(),
    tollFreeNumber: joi_1.default.string().required(),
    settings: joi_1.default.object().optional()
});
const addDepartmentSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    type: joi_1.default.string().valid('sales', 'support', 'billing', 'technical', 'custom').required(),
    phoneNumber: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    greeting: joi_1.default.string().required(),
    businessHours: joi_1.default.object({
        enabled: joi_1.default.boolean().required(),
        startTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
        endTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
        greeting: joi_1.default.string().required(),
        afterHoursGreeting: joi_1.default.string().required()
    }).required(),
    agents: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required(),
        phoneNumber: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        skills: joi_1.default.array().items(joi_1.default.string()).required(),
        availability: joi_1.default.string().valid('available', 'busy', 'offline').default('available'),
        maxConcurrentCalls: joi_1.default.number().min(1).default(1)
    })).default([]),
    routingRules: joi_1.default.array().items(joi_1.default.object({
        condition: joi_1.default.string().valid('intent', 'sentiment', 'customer_tier', 'time_of_day', 'keyword').required(),
        value: joi_1.default.any().required(),
        operator: joi_1.default.string().valid('equals', 'contains', 'greater_than', 'less_than', 'between').required(),
        action: joi_1.default.string().valid('route', 'transfer', 'voicemail', 'callback').required(),
        target: joi_1.default.string().required(),
        priority: joi_1.default.number().min(1).max(10).required()
    })).default([]),
    priority: joi_1.default.number().min(1).max(10).default(5),
    active: joi_1.default.boolean().default(true)
});
const processCallSchema = joi_1.default.object({
    tollFreeNumber: joi_1.default.string().required(),
    callerId: joi_1.default.string().required(),
    userInput: joi_1.default.string().optional()
});
const updateSettingsSchema = joi_1.default.object({
    timezone: joi_1.default.string().optional(),
    language: joi_1.default.string().optional(),
    businessHours: joi_1.default.object().optional(),
    branding: joi_1.default.object().optional(),
    notifications: joi_1.default.object().optional(),
    integrations: joi_1.default.object().optional()
});
router.post('/tenant', async (req, res) => {
    try {
        const { error, value } = createTenantSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, companyName, tollFreeNumber, settings } = value;
        const tenant = await tenantIVRService.createTenant(userId, companyName, tollFreeNumber, settings);
        return res.json({
            success: true,
            data: tenant
        });
    }
    catch (error) {
        console.error('Error creating tenant:', error);
        return res.status(500).json({
            error: 'Failed to create tenant',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/tenant/:tenantId/departments', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { error, value } = addDepartmentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const department = await tenantIVRService.addDepartment(tenantId, value);
        return res.json({
            success: true,
            data: department
        });
    }
    catch (error) {
        console.error('Error adding department:', error);
        return res.status(500).json({
            error: 'Failed to add department',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/call', async (req, res) => {
    try {
        const { error, value } = processCallSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { tollFreeNumber, callerId, userInput } = value;
        const result = await tenantIVRService.processTenantCall(tollFreeNumber, callerId, userInput);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error processing tenant call:', error);
        return res.status(500).json({
            error: 'Failed to process call',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/tenant/:tenantId/departments', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const departments = await tenantIVRService.getTenantDepartments(tenantId);
        return res.json({
            success: true,
            data: departments
        });
    }
    catch (error) {
        console.error('Error getting tenant departments:', error);
        return res.status(500).json({
            error: 'Failed to get departments',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/tenant/:tenantId/settings', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { error, value } = updateSettingsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        await tenantIVRService.updateTenantSettings(tenantId, value);
        return res.json({
            success: true,
            message: 'Tenant settings updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating tenant settings:', error);
        return res.status(500).json({
            error: 'Failed to update settings',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/tenant/:tenantId/analytics', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'startDate and endDate are required'
            });
        }
        const analytics = await tenantIVRService.getTenantAnalytics(tenantId, new Date(startDate), new Date(endDate));
        return res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error('Error getting tenant analytics:', error);
        return res.status(500).json({
            error: 'Failed to get analytics',
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
                service: 'tenant-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking tenant IVR health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tenant-ivr.js.map