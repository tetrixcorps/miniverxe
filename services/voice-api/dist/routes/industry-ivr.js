"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const IndustryIVRService_1 = require("../services/IndustryIVRService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const industryIVRService = new IndustryIVRService_1.IndustryIVRService(prisma, redis);
router.get('/industries', async (req, res) => {
    try {
        const industries = await industryIVRService.getAllIndustries();
        return res.json({
            success: true,
            data: industries,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting industries:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get industries',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
router.get('/industries/:industry', async (req, res) => {
    try {
        const { industry } = req.params;
        const config = await industryIVRService.getIndustryConfig(industry);
        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Industry not found',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: config,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting industry configuration:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get industry configuration',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
router.get('/industries/:industry/pricing', async (req, res) => {
    try {
        const { industry } = req.params;
        const pricing = await industryIVRService.getIndustryPricing(industry);
        if (!pricing) {
            return res.status(404).json({
                success: false,
                error: 'Industry pricing not found',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: pricing,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting industry pricing:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get industry pricing',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
router.post('/industries/:industry/calculate-cost', async (req, res) => {
    try {
        const { industry } = req.params;
        const { minutes, features } = req.body;
        if (!minutes || !Array.isArray(features)) {
            return res.status(400).json({
                success: false,
                error: 'Minutes and features are required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        const cost = await industryIVRService.calculateIndustryCost(industry, minutes, features);
        if (!cost) {
            return res.status(404).json({
                success: false,
                error: 'Industry not found',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: cost,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error calculating industry cost:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to calculate industry cost',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
router.post('/industries/:industry/tenant', async (req, res) => {
    try {
        const { industry } = req.params;
        const tenantData = req.body;
        if (!tenantData.name) {
            return res.status(400).json({
                success: false,
                error: 'Tenant name is required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        const result = await industryIVRService.createIndustryTenant(industry, tenantData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                tenantId: result.tenantId,
                industry: industry,
                status: 'created'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating industry tenant:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create industry tenant',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
router.put('/industries/:industry/tenant/:tenantId', async (req, res) => {
    try {
        const { industry, tenantId } = req.params;
        const updates = req.body;
        const result = await industryIVRService.updateIndustryConfiguration(tenantId, industry, updates);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                tenantId: tenantId,
                industry: industry,
                status: 'updated'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating industry configuration:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update industry configuration',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
router.get('/industries/:industry/demo', async (req, res) => {
    try {
        const { industry } = req.params;
        const config = await industryIVRService.getIndustryConfig(industry);
        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Industry not found',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'industry-ivr',
                    version: '1.0.0'
                }
            });
        }
        const demoScenarios = generateDemoScenarios(industry, config);
        return res.json({
            success: true,
            data: demoScenarios,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting industry demo scenarios:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get industry demo scenarios',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'industry-ivr',
                version: '1.0.0'
            }
        });
    }
});
function generateDemoScenarios(industry, config) {
    const scenarios = [];
    switch (industry) {
        case 'construction':
            scenarios.push({
                title: 'Project Status Inquiry',
                description: 'Client calls to check project progress',
                steps: [
                    'Caller dials toll-free number',
                    'IVR greets: "Thank you for calling. For project updates, press 1"',
                    'Caller presses 1',
                    'IVR: "Please enter your project number"',
                    'Caller enters project number',
                    'IVR provides project status and next steps',
                    'Call routed to Project Management if needed'
                ]
            }, {
                title: 'Safety Emergency',
                description: 'Emergency safety concern reported',
                steps: [
                    'Caller dials toll-free number',
                    'IVR greets with emergency option',
                    'Caller presses 2 for safety concerns',
                    'IVR: "This is an emergency line. Please state your emergency and location"',
                    'Call immediately routed to Emergency Response',
                    'High priority escalation activated'
                ]
            });
            break;
        case 'logistics':
            scenarios.push({
                title: 'Shipment Tracking',
                description: 'Customer calls to track delivery',
                steps: [
                    'Caller dials toll-free number',
                    'IVR: "Thank you for calling. For shipment tracking, press 1"',
                    'Caller presses 1',
                    'IVR: "Please enter your tracking number"',
                    'Caller enters tracking number',
                    'IVR provides real-time shipment status',
                    'Call routed to Customer Service if needed'
                ]
            }, {
                title: 'Driver Support',
                description: 'Driver needs assistance',
                steps: [
                    'Driver dials toll-free number',
                    'IVR: "For driver support, press 2"',
                    'Driver presses 2',
                    'IVR: "Please state your driver ID and issue"',
                    'Driver provides information',
                    'Call routed to Driver Support with high priority'
                ]
            });
            break;
        default:
            scenarios.push({
                title: 'General Inquiry',
                description: 'Customer calls with general question',
                steps: [
                    'Caller dials toll-free number',
                    'IVR greets with menu options',
                    'Caller selects appropriate option',
                    'IVR processes request',
                    'Call routed to appropriate department'
                ]
            });
    }
    return scenarios;
}
exports.default = router;
//# sourceMappingURL=industry-ivr.js.map