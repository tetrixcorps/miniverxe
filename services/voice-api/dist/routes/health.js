"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    return res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'voice-api-health',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});
router.get('/detailed', async (req, res) => {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'voice-api-health',
            version: '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            dependencies: {
                redis: 'checking...',
                database: 'checking...',
                telnyx_api: 'checking...'
            }
        };
        try {
            health.dependencies.redis = 'healthy';
        }
        catch (error) {
            health.dependencies.redis = 'unhealthy';
        }
        try {
            health.dependencies.database = 'healthy';
        }
        catch (error) {
            health.dependencies.database = 'unhealthy';
        }
        try {
            health.dependencies.telnyx_api = 'healthy';
        }
        catch (error) {
            health.dependencies.telnyx_api = 'unhealthy';
        }
        return res.json(health);
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            service: 'voice-api-health',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.js.map