import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    id: Joi.StringSchema<string>;
    phoneNumber: Joi.StringSchema<string>;
    email: Joi.StringSchema<string>;
    pagination: Joi.ObjectSchema<any>;
    dateRange: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map