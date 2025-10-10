"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMonitoring = exports.externalServiceMonitoring = exports.redisMonitoring = exports.databaseMonitoring = exports.errorMonitoring = exports.performanceMonitoring = exports.metricsCollector = exports.monitoringConfig = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
exports.monitoringConfig = {
    metrics: {
        enabled: true,
        collectionInterval: 30000,
        retentionPeriod: 7 * 24 * 60 * 60 * 1000,
    },
    alerts: {
        responseTime: {
            warning: 1000,
            critical: 5000,
        },
        errorRate: {
            warning: 5,
            critical: 10,
        },
        memoryUsage: {
            warning: 80,
            critical: 90,
        },
        cpuUsage: {
            warning: 80,
            critical: 90,
        },
        databaseConnections: {
            warning: 80,
            critical: 95,
        },
        redisConnections: {
            warning: 80,
            critical: 95,
        },
    },
    healthChecks: {
        database: 10000,
        redis: 10000,
        external: 30000,
        full: 60000,
    },
    logLevels: {
        development: 'debug',
        staging: 'info',
        production: 'warn',
    },
};
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.alerts = new Map();
        this.startTime = Date.now();
        this.startCollection();
    }
    startCollection() {
        if (!exports.monitoringConfig.metrics.enabled)
            return;
        setInterval(() => {
            this.collectSystemMetrics();
            this.collectApplicationMetrics();
            this.checkAlerts();
        }, exports.monitoringConfig.metrics.collectionInterval);
    }
    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const uptime = process.uptime();
        const systemMetrics = {
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external,
                arrayBuffers: memUsage.arrayBuffers,
                percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
            },
            uptime,
            timestamp: new Date().toISOString(),
        };
        this.metrics.set('system', systemMetrics);
    }
    collectApplicationMetrics() {
        const appMetrics = {
            requests: this.getRequestMetrics(),
            errors: this.getErrorMetrics(),
            performance: this.getPerformanceMetrics(),
            timestamp: new Date().toISOString(),
        };
        this.metrics.set('application', appMetrics);
    }
    getRequestMetrics() {
        return {
            total: 0,
            successful: 0,
            failed: 0,
            averageResponseTime: 0,
        };
    }
    getErrorMetrics() {
        return {
            total: 0,
            byType: {},
            byEndpoint: {},
        };
    }
    getPerformanceMetrics() {
        return {
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
        };
    }
    checkAlerts() {
        const systemMetrics = this.metrics.get('system');
        const appMetrics = this.metrics.get('application');
        if (!systemMetrics || !appMetrics)
            return;
        if (systemMetrics.memory.percentage > exports.monitoringConfig.alerts.memoryUsage.critical) {
            this.triggerAlert('CRITICAL', 'Memory usage critical', {
                usage: systemMetrics.memory.percentage,
                threshold: exports.monitoringConfig.alerts.memoryUsage.critical,
            });
        }
        else if (systemMetrics.memory.percentage > exports.monitoringConfig.alerts.memoryUsage.warning) {
            this.triggerAlert('WARNING', 'Memory usage high', {
                usage: systemMetrics.memory.percentage,
                threshold: exports.monitoringConfig.alerts.memoryUsage.warning,
            });
        }
        if (appMetrics.performance.averageResponseTime > exports.monitoringConfig.alerts.responseTime.critical) {
            this.triggerAlert('CRITICAL', 'Response time critical', {
                responseTime: appMetrics.performance.averageResponseTime,
                threshold: exports.monitoringConfig.alerts.responseTime.critical,
            });
        }
        else if (appMetrics.performance.averageResponseTime > exports.monitoringConfig.alerts.responseTime.warning) {
            this.triggerAlert('WARNING', 'Response time high', {
                responseTime: appMetrics.performance.averageResponseTime,
                threshold: exports.monitoringConfig.alerts.responseTime.warning,
            });
        }
        const errorRate = (appMetrics.requests.failed / appMetrics.requests.total) * 100;
        if (errorRate > exports.monitoringConfig.alerts.errorRate.critical) {
            this.triggerAlert('CRITICAL', 'Error rate critical', {
                errorRate,
                threshold: exports.monitoringConfig.alerts.errorRate.critical,
            });
        }
        else if (errorRate > exports.monitoringConfig.alerts.errorRate.warning) {
            this.triggerAlert('WARNING', 'Error rate high', {
                errorRate,
                threshold: exports.monitoringConfig.alerts.errorRate.warning,
            });
        }
    }
    triggerAlert(severity, message, data) {
        const alertKey = `${severity}:${message}`;
        const now = Date.now();
        if (this.alerts.has(alertKey)) {
            const lastAlert = this.alerts.get(alertKey);
            if (now - lastAlert.timestamp < 5 * 60 * 1000) {
                return;
            }
        }
        const alert = {
            severity,
            message,
            data,
            timestamp: now,
            service: 'voice-api',
            environment: process.env.NODE_ENV || 'development',
        };
        this.alerts.set(alertKey, alert);
        if (severity === 'CRITICAL') {
            logger_1.default.error('CRITICAL ALERT', alert);
        }
        else {
            logger_1.default.warn('WARNING ALERT', alert);
        }
        this.sendExternalAlert(alert);
    }
    sendExternalAlert(alert) {
        if (process.env.MONITORING_WEBHOOK_URL) {
            fetch(process.env.MONITORING_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alert),
            }).catch(error => {
                logger_1.default.error('Failed to send external alert', { error: error.message });
            });
        }
    }
    getMetrics() {
        return {
            system: this.metrics.get('system'),
            application: this.metrics.get('application'),
            alerts: Array.from(this.alerts.values()),
            uptime: Date.now() - this.startTime,
        };
    }
    getMetricsForRange(startTime, endTime) {
        return {};
    }
}
exports.metricsCollector = new MetricsCollector();
const performanceMonitoring = (req, res, next) => {
    const start = Date.now();
    const startCpu = process.cpuUsage();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const cpuUsage = process.cpuUsage(startCpu);
        const performanceData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            cpuUsage: {
                user: cpuUsage.user,
                system: cpuUsage.system,
            },
            timestamp: new Date().toISOString(),
        };
        logger_1.default.info('Request performance', performanceData);
        if (duration > exports.monitoringConfig.alerts.responseTime.warning) {
            logger_1.default.warn('Slow request detected', performanceData);
        }
    });
    next();
};
exports.performanceMonitoring = performanceMonitoring;
const errorMonitoring = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode >= 400) {
            const errorData = {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                timestamp: new Date().toISOString(),
            };
            logger_1.default.error('Request error', errorData);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.errorMonitoring = errorMonitoring;
exports.databaseMonitoring = {
    monitorConnections: (prisma) => {
        setInterval(async () => {
            try {
                const result = await prisma.$queryRaw `SELECT 1`;
                logger_1.default.debug('Database connection check passed');
            }
            catch (error) {
                logger_1.default.error('Database connection check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }, exports.monitoringConfig.healthChecks.database);
    },
    monitorQueryPerformance: (prisma) => {
        const originalQuery = prisma.$queryRaw;
        prisma.$queryRaw = function (...args) {
            const start = Date.now();
            return originalQuery.apply(this, args).then((result) => {
                const duration = Date.now() - start;
                if (duration > 1000) {
                    logger_1.default.warn('Slow database query', {
                        duration,
                        query: args[0],
                        timestamp: new Date().toISOString(),
                    });
                }
                return result;
            });
        };
    },
};
exports.redisMonitoring = {
    monitorConnection: (redis) => {
        setInterval(async () => {
            try {
                await redis.ping();
                logger_1.default.debug('Redis connection check passed');
            }
            catch (error) {
                logger_1.default.error('Redis connection check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }, exports.monitoringConfig.healthChecks.redis);
    },
    monitorPerformance: (redis) => {
        const originalCommand = redis.sendCommand;
        redis.sendCommand = function (command, ...args) {
            const start = Date.now();
            return originalCommand.call(this, command, ...args).then((result) => {
                const duration = Date.now() - start;
                if (duration > 100) {
                    logger_1.default.warn('Slow Redis operation', {
                        duration,
                        command: command.name,
                        timestamp: new Date().toISOString(),
                    });
                }
                return result;
            });
        };
    },
};
exports.externalServiceMonitoring = {
    monitorService: (serviceName, healthCheckUrl) => {
        setInterval(async () => {
            try {
                const start = Date.now();
                const response = await fetch(healthCheckUrl, {
                    signal: AbortSignal.timeout(5000)
                });
                const duration = Date.now() - start;
                if (!response.ok) {
                    logger_1.default.warn('External service unhealthy', {
                        service: serviceName,
                        status: response.status,
                        duration,
                        timestamp: new Date().toISOString(),
                    });
                }
                else {
                    logger_1.default.debug('External service health check passed', {
                        service: serviceName,
                        duration,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            catch (error) {
                logger_1.default.error('External service health check failed', {
                    service: serviceName,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString(),
                });
            }
        }, exports.monitoringConfig.healthChecks.external);
    },
};
const initializeMonitoring = (prisma, redis) => {
    exports.databaseMonitoring.monitorConnections(prisma);
    exports.databaseMonitoring.monitorQueryPerformance(prisma);
    exports.redisMonitoring.monitorConnection(redis);
    exports.redisMonitoring.monitorPerformance(redis);
    exports.externalServiceMonitoring.monitorService('Telnyx', 'https://api.telnyx.com/v2/health');
    exports.externalServiceMonitoring.monitorService('Stripe', 'https://api.stripe.com/v1/health');
    exports.externalServiceMonitoring.monitorService('OpenAI', 'https://api.openai.com/v1/models');
    logger_1.default.info('Monitoring initialized', {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
};
exports.initializeMonitoring = initializeMonitoring;
//# sourceMappingURL=monitoring.js.map