"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = exports.metricsMiddleware = exports.readinessCheck = exports.simpleHealthCheck = exports.healthCheckMiddleware = exports.initializeHealthChecker = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
let requestMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    averageResponseTime: 0,
};
let responseTimes = [];
class HealthChecker {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.startTime = Date.now();
    }
    async checkDatabase() {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            const responseTime = Date.now() - start;
            return {
                status: 'healthy',
                responseTime,
                lastChecked: new Date().toISOString(),
                details: {
                    connectionPool: 'active',
                    queryTime: `${responseTime}ms`
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                lastChecked: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown database error',
                details: {
                    connectionPool: 'failed',
                    error: error
                }
            };
        }
    }
    async checkRedis() {
        const start = Date.now();
        try {
            await this.redis.ping();
            const responseTime = Date.now() - start;
            return {
                status: 'healthy',
                responseTime,
                lastChecked: new Date().toISOString(),
                details: {
                    connection: 'active',
                    pingTime: `${responseTime}ms`
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                lastChecked: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown Redis error',
                details: {
                    connection: 'failed',
                    error: error
                }
            };
        }
    }
    async checkExternalService(service, url) {
        const start = Date.now();
        try {
            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
                headers: {
                    'User-Agent': 'TETRIX-HealthCheck/1.0'
                }
            });
            const responseTime = Date.now() - start;
            const isHealthy = response.ok;
            return {
                status: isHealthy ? 'healthy' : 'degraded',
                responseTime,
                lastChecked: new Date().toISOString(),
                details: {
                    statusCode: response.status,
                    statusText: response.statusText,
                    responseTime: `${responseTime}ms`
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                lastChecked: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown external service error',
                details: {
                    service,
                    url,
                    error: error
                }
            };
        }
    }
    getMemoryMetrics() {
        const memUsage = process.memoryUsage();
        const total = memUsage.heapTotal;
        const used = memUsage.heapUsed;
        const free = total - used;
        const percentage = (used / total) * 100;
        return {
            used: Math.round(used / 1024 / 1024),
            free: Math.round(free / 1024 / 1024),
            total: Math.round(total / 1024 / 1024),
            percentage: Math.round(percentage * 100) / 100
        };
    }
    getCPUMetrics() {
        const loadAvg = require('os').loadavg();
        return {
            usage: 0,
            loadAverage: loadAvg
        };
    }
    getRequestMetrics() {
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
        return {
            ...requestMetrics,
            averageResponseTime: Math.round(avgResponseTime * 100) / 100
        };
    }
    async performHealthCheck() {
        const start = Date.now();
        try {
            const [database, redis, telnyx, stripe, openai] = await Promise.all([
                this.checkDatabase(),
                this.checkRedis(),
                this.checkExternalService('telnyx', 'https://api.telnyx.com/v2/health'),
                this.checkExternalService('stripe', 'https://api.stripe.com/v1/health'),
                this.checkExternalService('openai', 'https://api.openai.com/v1/models')
            ]);
            const serviceStatuses = [database.status, redis.status, telnyx.status, stripe.status, openai.status];
            const hasUnhealthy = serviceStatuses.includes('unhealthy');
            const hasDegraded = serviceStatuses.includes('degraded');
            let overallStatus;
            if (hasUnhealthy) {
                overallStatus = 'unhealthy';
            }
            else if (hasDegraded) {
                overallStatus = 'degraded';
            }
            else {
                overallStatus = 'healthy';
            }
            const healthCheckTime = Date.now() - start;
            const result = {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime,
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                services: {
                    database,
                    redis,
                    external: {
                        telnyx,
                        stripe,
                        openai
                    }
                },
                metrics: {
                    memory: this.getMemoryMetrics(),
                    cpu: this.getCPUMetrics(),
                    requests: this.getRequestMetrics()
                }
            };
            logger_1.default.info('Health check completed', {
                status: overallStatus,
                duration: `${healthCheckTime}ms`,
                services: {
                    database: database.status,
                    redis: redis.status,
                    external: {
                        telnyx: telnyx.status,
                        stripe: stripe.status,
                        openai: openai.status
                    }
                }
            });
            return result;
        }
        catch (error) {
            logger_1.default.error('Health check failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime,
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                services: {
                    database: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Health check failed' },
                    redis: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Health check failed' },
                    external: {
                        telnyx: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Health check failed' },
                        stripe: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Health check failed' },
                        openai: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Health check failed' }
                    }
                },
                metrics: {
                    memory: this.getMemoryMetrics(),
                    cpu: this.getCPUMetrics(),
                    requests: this.getRequestMetrics()
                }
            };
        }
    }
}
let healthChecker;
const initializeHealthChecker = (prisma, redis) => {
    healthChecker = new HealthChecker(prisma, redis);
};
exports.initializeHealthChecker = initializeHealthChecker;
const healthCheckMiddleware = async (req, res, next) => {
    if (!healthChecker) {
        return res.status(503).json({
            status: 'unhealthy',
            error: 'Health checker not initialized',
            timestamp: new Date().toISOString()
        });
    }
    try {
        const healthResult = await healthChecker.performHealthCheck();
        const statusCode = healthResult.status === 'healthy' ? 200 :
            healthResult.status === 'degraded' ? 200 : 503;
        return res.status(statusCode).json(healthResult);
    }
    catch (error) {
        logger_1.default.error('Health check middleware error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return res.status(503).json({
            status: 'unhealthy',
            error: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
};
exports.healthCheckMiddleware = healthCheckMiddleware;
const simpleHealthCheck = (req, res, next) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
};
exports.simpleHealthCheck = simpleHealthCheck;
const readinessCheck = async (req, res, next) => {
    if (!healthChecker) {
        return res.status(503).json({
            status: 'not ready',
            error: 'Health checker not initialized',
            timestamp: new Date().toISOString()
        });
    }
    try {
        const [database, redis] = await Promise.all([
            healthChecker.checkDatabase(),
            healthChecker.checkRedis()
        ]);
        const isReady = database.status === 'healthy' && redis.status === 'healthy';
        return res.status(isReady ? 200 : 503).json({
            status: isReady ? 'ready' : 'not ready',
            services: {
                database: database.status,
                redis: redis.status
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(503).json({
            status: 'not ready',
            error: 'Readiness check failed',
            timestamp: new Date().toISOString()
        });
    }
};
exports.readinessCheck = readinessCheck;
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    requestMetrics.total++;
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - start;
        responseTimes.push(responseTime);
        if (responseTimes.length > 1000) {
            responseTimes = responseTimes.slice(-1000);
        }
        if (res.statusCode >= 200 && res.statusCode < 400) {
            requestMetrics.successful++;
        }
        else {
            requestMetrics.failed++;
        }
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.metricsMiddleware = metricsMiddleware;
const getMetrics = () => {
    return {
        requests: requestMetrics,
        memory: healthChecker?.getMemoryMetrics(),
        cpu: healthChecker?.getCPUMetrics(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
};
exports.getMetrics = getMetrics;
//# sourceMappingURL=healthCheck.js.map