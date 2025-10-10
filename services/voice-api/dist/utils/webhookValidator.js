"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookValidator = void 0;
exports.createWebhookValidator = createWebhookValidator;
exports.validateTelnyxWebhook = validateTelnyxWebhook;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("./logger"));
class WebhookValidator {
    constructor(webhookSecret) {
        this.webhookSecret = webhookSecret;
    }
    validateWebhookSignature(payload, signature, timestamp) {
        try {
            if (!signature || !timestamp) {
                return {
                    isValid: false,
                    error: 'Missing required headers: Telnyx-Signature-Ed25519 or Telnyx-Timestamp'
                };
            }
            const currentTime = Math.floor(Date.now() / 1000);
            const webhookTime = parseInt(timestamp, 10);
            if (isNaN(webhookTime)) {
                return {
                    isValid: false,
                    error: 'Invalid timestamp format'
                };
            }
            const timeDifference = Math.abs(currentTime - webhookTime);
            if (timeDifference > 300) {
                return {
                    isValid: false,
                    error: `Timestamp too old: ${timeDifference} seconds ago`
                };
            }
            const signaturePayload = `${timestamp}.${payload}`;
            const expectedSignature = this.createEd25519Signature(signaturePayload);
            const isValid = crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
            if (!isValid) {
                logger_1.default.warn('Webhook signature validation failed', {
                    expected: expectedSignature,
                    received: signature,
                    payload: signaturePayload.substring(0, 100) + '...'
                });
            }
            return {
                isValid,
                error: isValid ? undefined : 'Invalid signature'
            };
        }
        catch (error) {
            logger_1.default.error('Webhook signature validation error:', error);
            return {
                isValid: false,
                error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    createEd25519Signature(payload) {
        try {
            const hmac = crypto_1.default.createHmac('sha256', this.webhookSecret);
            hmac.update(payload);
            return hmac.digest('hex');
        }
        catch (error) {
            logger_1.default.error('Error creating signature:', error);
            throw new Error('Failed to create signature');
        }
    }
    validateWebhookPayload(payload) {
        try {
            if (!payload || typeof payload !== 'object') {
                return {
                    isValid: false,
                    error: 'Invalid payload: must be an object'
                };
            }
            if (!payload.data || typeof payload.data !== 'object') {
                return {
                    isValid: false,
                    error: 'Invalid payload: missing or invalid data field'
                };
            }
            const { data } = payload;
            const requiredFields = ['id', 'event_type', 'occurred_at'];
            for (const field of requiredFields) {
                if (!data[field]) {
                    return {
                        isValid: false,
                        error: `Invalid payload: missing required field '${field}' in data`
                    };
                }
            }
            if (typeof data.event_type !== 'string' || data.event_type.length === 0) {
                return {
                    isValid: false,
                    error: 'Invalid payload: event_type must be a non-empty string'
                };
            }
            const occurredAt = new Date(data.occurred_at);
            if (isNaN(occurredAt.getTime())) {
                return {
                    isValid: false,
                    error: 'Invalid payload: occurred_at must be a valid ISO timestamp'
                };
            }
            const now = new Date();
            const age = now.getTime() - occurredAt.getTime();
            if (age > 3600000) {
                return {
                    isValid: false,
                    error: 'Payload too old: more than 1 hour old'
                };
            }
            return { isValid: true };
        }
        catch (error) {
            logger_1.default.error('Webhook payload validation error:', error);
            return {
                isValid: false,
                error: `Payload validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateWebhook(payload, signature, timestamp, parsedPayload) {
        const signatureValidation = this.validateWebhookSignature(payload, signature, timestamp);
        if (!signatureValidation.isValid) {
            return signatureValidation;
        }
        const payloadValidation = this.validateWebhookPayload(parsedPayload);
        if (!payloadValidation.isValid) {
            return payloadValidation;
        }
        return { isValid: true };
    }
    static extractWebhookHeaders(headers) {
        const getHeader = (name) => {
            const value = headers[name] || headers[name.toLowerCase()];
            return Array.isArray(value) ? value[0] : value || null;
        };
        return {
            signature: getHeader('telnyx-signature-ed25519'),
            timestamp: getHeader('telnyx-timestamp')
        };
    }
    static logValidationAttempt(result, eventType, callControlId) {
        const logData = {
            isValid: result.isValid,
            error: result.error,
            eventType,
            callControlId,
            timestamp: new Date().toISOString()
        };
        if (result.isValid) {
            logger_1.default.info('Webhook validation successful', logData);
        }
        else {
            logger_1.default.warn('Webhook validation failed', logData);
        }
    }
}
exports.WebhookValidator = WebhookValidator;
function createWebhookValidator(webhookSecret) {
    return new WebhookValidator(webhookSecret);
}
function validateTelnyxWebhook(payload, headers, webhookSecret) {
    const validator = createWebhookValidator(webhookSecret);
    const { signature, timestamp } = WebhookValidator.extractWebhookHeaders(headers);
    if (!signature || !timestamp) {
        return {
            isValid: false,
            error: 'Missing required webhook headers'
        };
    }
    let parsedPayload;
    try {
        parsedPayload = JSON.parse(payload.toString());
    }
    catch (error) {
        return {
            isValid: false,
            error: 'Invalid JSON payload'
        };
    }
    const result = validator.validateWebhook(payload, signature, timestamp, parsedPayload);
    WebhookValidator.logValidationAttempt(result, parsedPayload?.data?.event_type, parsedPayload?.data?.payload?.call_control_id);
    return result;
}
//# sourceMappingURL=webhookValidator.js.map