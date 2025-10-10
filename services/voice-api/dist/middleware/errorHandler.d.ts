import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    details?: any;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare class ExternalServiceError extends AppError {
    constructor(service: string, message?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string);
}
export declare class ConfigurationError extends AppError {
    constructor(message?: string);
}
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const unhandledRejectionHandler: (reason: any, promise: Promise<any>) => void;
export declare const uncaughtExceptionHandler: (error: Error) => never;
export declare const gracefulShutdownHandler: (signal: string) => void;
export declare const errorMonitoring: {
    trackError: (error: AppError, context?: any) => void;
    trackPerformance: (operation: string, duration: number, success: boolean) => void;
};
export declare const formatValidationError: (error: any) => ValidationError;
export declare const formatDatabaseError: (error: any) => DatabaseError;
export declare const formatExternalServiceError: (service: string, error: any) => ExternalServiceError;
//# sourceMappingURL=errorHandler.d.ts.map