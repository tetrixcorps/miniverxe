import { Request, Response, NextFunction } from 'express';
export declare const securityConfig: {
    helmet: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    rateLimits: {
        general: import("express-rate-limit").RateLimitRequestHandler;
        auth: import("express-rate-limit").RateLimitRequestHandler;
        webhook: import("express-rate-limit").RateLimitRequestHandler;
        voice: import("express-rate-limit").RateLimitRequestHandler;
    };
    cors: {
        origin: boolean | string[];
        credentials: boolean;
        optionsSuccessStatus: number;
        methods: string[];
        allowedHeaders: string[];
    };
    inputValidation: {
        maxRequestSize: string;
        maxFileSize: string;
        allowedFileTypes: string[];
        maxArrayLength: number;
        maxStringLength: number;
    };
    securityHeaders: {
        'X-Content-Type-Options': string;
        'X-Frame-Options': string;
        'X-XSS-Protection': string;
        'Referrer-Policy': string;
        'Permissions-Policy': string;
    };
};
export declare const securityMiddleware: {
    validateRequestSize: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    validateFileUpload: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    validateJsonPayload: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    addSecurityHeaders: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const getSecurityConfig: () => {
    isProduction: boolean;
    isDevelopment: boolean;
    enableDetailedErrors: boolean;
    enableRequestLogging: boolean;
    enableSecurityHeaders: boolean;
    enableRateLimiting: boolean;
    enableCORS: boolean;
    enableHelmet: boolean;
    maxRequestSize: string;
    rateLimitWindow: number;
    rateLimitMax: number;
};
//# sourceMappingURL=security.d.ts.map