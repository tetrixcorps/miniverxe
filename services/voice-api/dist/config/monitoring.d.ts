export declare const monitoringConfig: {
    metrics: {
        enabled: boolean;
        collectionInterval: number;
        retentionPeriod: number;
    };
    alerts: {
        responseTime: {
            warning: number;
            critical: number;
        };
        errorRate: {
            warning: number;
            critical: number;
        };
        memoryUsage: {
            warning: number;
            critical: number;
        };
        cpuUsage: {
            warning: number;
            critical: number;
        };
        databaseConnections: {
            warning: number;
            critical: number;
        };
        redisConnections: {
            warning: number;
            critical: number;
        };
    };
    healthChecks: {
        database: number;
        redis: number;
        external: number;
        full: number;
    };
    logLevels: {
        development: string;
        staging: string;
        production: string;
    };
};
declare class MetricsCollector {
    private metrics;
    private alerts;
    private startTime;
    constructor();
    private startCollection;
    private collectSystemMetrics;
    private collectApplicationMetrics;
    private getRequestMetrics;
    private getErrorMetrics;
    private getPerformanceMetrics;
    private checkAlerts;
    private triggerAlert;
    private sendExternalAlert;
    getMetrics(): {
        system: any;
        application: any;
        alerts: any[];
        uptime: number;
    };
    getMetricsForRange(startTime: number, endTime: number): {};
}
export declare const metricsCollector: MetricsCollector;
export declare const performanceMonitoring: (req: any, res: any, next: any) => void;
export declare const errorMonitoring: (req: any, res: any, next: any) => void;
export declare const databaseMonitoring: {
    monitorConnections: (prisma: any) => void;
    monitorQueryPerformance: (prisma: any) => void;
};
export declare const redisMonitoring: {
    monitorConnection: (redis: any) => void;
    monitorPerformance: (redis: any) => void;
};
export declare const externalServiceMonitoring: {
    monitorService: (serviceName: string, healthCheckUrl: string) => void;
};
export declare const initializeMonitoring: (prisma: any, redis: any) => void;
export {};
//# sourceMappingURL=monitoring.d.ts.map