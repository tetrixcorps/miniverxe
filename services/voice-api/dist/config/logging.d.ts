import winston from 'winston';
declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const createContextLogger: (context: string) => {
    error: (message: string, meta?: any) => winston.Logger;
    warn: (message: string, meta?: any) => winston.Logger;
    info: (message: string, meta?: any) => winston.Logger;
    http: (message: string, meta?: any) => winston.Logger;
    debug: (message: string, meta?: any) => winston.Logger;
};
export declare const performanceLogger: {
    startTimer: (operation: string) => {
        end: (success?: boolean, meta?: any) => number;
    };
};
export declare const securityLogger: {
    authAttempt: (ip: string, user: string, success: boolean, reason?: string) => void;
    suspiciousActivity: (ip: string, activity: string, details?: any) => void;
    rateLimitExceeded: (ip: string, endpoint: string, limit: number) => void;
};
export declare const businessLogger: {
    callStarted: (callId: string, tenantId: string, phoneNumber: string) => void;
    callEnded: (callId: string, duration: number, status: string) => void;
    tenantCreated: (tenantId: string, plan: string, industry: string) => void;
    paymentProcessed: (tenantId: string, amount: number, currency: string, status: string) => void;
};
export declare const systemLogger: {
    serviceStarted: (service: string, port: number) => void;
    serviceStopped: (service: string, reason: string) => void;
    databaseConnected: (database: string) => void;
    databaseDisconnected: (database: string, reason: string) => void;
    redisConnected: () => void;
    redisDisconnected: (reason: string) => void;
};
export declare const errorLogger: {
    logError: (error: Error, context?: any) => void;
    logValidationError: (field: string, value: any, message: string) => void;
    logExternalServiceError: (service: string, error: any, request?: any) => void;
};
export declare const requestLogger: {
    logRequest: (req: any, res: any, responseTime: number) => void;
};
export default logger;
//# sourceMappingURL=logging.d.ts.map