export interface WebhookValidationResult {
    isValid: boolean;
    error?: string;
}
export declare class WebhookValidator {
    private webhookSecret;
    constructor(webhookSecret: string);
    validateWebhookSignature(payload: string | Buffer, signature: string, timestamp: string): WebhookValidationResult;
    private createEd25519Signature;
    validateWebhookPayload(payload: any): WebhookValidationResult;
    validateWebhook(payload: string | Buffer, signature: string, timestamp: string, parsedPayload: any): WebhookValidationResult;
    static extractWebhookHeaders(headers: Record<string, string | string[] | undefined>): {
        signature: string | null;
        timestamp: string | null;
    };
    static logValidationAttempt(result: WebhookValidationResult, eventType?: string, callControlId?: string): void;
}
export declare function createWebhookValidator(webhookSecret: string): WebhookValidator;
export declare function validateTelnyxWebhook(payload: string | Buffer, headers: Record<string, string | string[] | undefined>, webhookSecret: string): WebhookValidationResult;
//# sourceMappingURL=webhookValidator.d.ts.map