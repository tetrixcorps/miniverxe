import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
interface MemoryMetrics {
    used: number;
    free: number;
    total: number;
    percentage: number;
}
interface CPUMetrics {
    usage: number;
    loadAverage: number[];
}
interface RequestMetrics {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
}
export declare const initializeHealthChecker: (prisma: PrismaClient, redis: RedisClientType) => void;
export declare const healthCheckMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const simpleHealthCheck: (req: Request, res: Response, next: NextFunction) => void;
export declare const readinessCheck: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const metricsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const getMetrics: () => {
    requests: RequestMetrics;
    memory: MemoryMetrics;
    cpu: CPUMetrics;
    uptime: number;
    timestamp: string;
};
export {};
//# sourceMappingURL=healthCheck.d.ts.map