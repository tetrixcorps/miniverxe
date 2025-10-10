"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumberMigrationService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class PhoneNumberMigrationService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async initiatePortingRequest(tenantId, phoneNumber, currentProvider, targetProvider) {
        try {
            if (!this.isValidPhoneNumber(phoneNumber)) {
                return { success: false, error: 'Invalid phone number format' };
            }
            const existingRequest = await this.prisma.portingRequest.findFirst({
                where: {
                    tenantId: tenantId,
                    phoneNumber: phoneNumber,
                    portingStatus: {
                        in: ['initiated', 'in_progress']
                    }
                }
            });
            if (existingRequest) {
                return { success: false, error: 'Porting request already exists for this number' };
            }
            const portingRequest = await this.prisma.portingRequest.create({
                data: {
                    tenantId: tenantId,
                    phoneNumber: phoneNumber,
                    currentProvider: currentProvider,
                    targetProvider: targetProvider,
                    portingStatus: 'initiated',
                    estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            });
            const portingResult = await this.initiateProviderPorting(portingRequest.id, phoneNumber, currentProvider, targetProvider);
            if (portingResult.success) {
                await this.prisma.portingRequest.update({
                    where: { id: portingRequest.id },
                    data: {
                        portingId: portingResult.portingId,
                        portingStatus: 'in_progress'
                    }
                });
                logger_1.default.info(`Porting request initiated: ${portingRequest.id} for ${phoneNumber}`);
                return { success: true, portingId: portingRequest.id };
            }
            else {
                await this.prisma.portingRequest.update({
                    where: { id: portingRequest.id },
                    data: {
                        portingStatus: 'failed',
                        errorMessage: portingResult.error
                    }
                });
                return { success: false, error: portingResult.error };
            }
        }
        catch (error) {
            logger_1.default.error('Error initiating porting request:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async initiateProviderPorting(portingRequestId, phoneNumber, currentProvider, targetProvider) {
        try {
            if (targetProvider === 'telnyx') {
                return await this.initiateTelnyxPorting(portingRequestId, phoneNumber, currentProvider);
            }
            else if (targetProvider === 'twilio') {
                return await this.initiateTwilioPorting(portingRequestId, phoneNumber, currentProvider);
            }
            else {
                return { success: false, error: 'Unsupported target provider' };
            }
        }
        catch (error) {
            logger_1.default.error('Error initiating provider porting:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async initiateTelnyxPorting(portingRequestId, phoneNumber, currentProvider) {
        try {
            const telnyxApiKey = process.env.TELNYX_API_KEY;
            if (!telnyxApiKey) {
                return { success: false, error: 'Telnyx API key not configured' };
            }
            const response = await axios_1.default.post('https://api.telnyx.com/v2/porting_orders', {
                phone_numbers: [phoneNumber],
                carrier: currentProvider,
                billing_phone_number: phoneNumber,
                account_phone_number: phoneNumber
            }, {
                headers: {
                    'Authorization': `Bearer ${telnyxApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                return { success: true, portingId: response.data.data.id };
            }
            else {
                return { success: false, error: 'Failed to initiate Telnyx porting' };
            }
        }
        catch (error) {
            logger_1.default.error('Error initiating Telnyx porting:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async initiateTwilioPorting(portingRequestId, phoneNumber, currentProvider) {
        try {
            const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
            const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
            if (!twilioAccountSid || !twilioAuthToken) {
                return { success: false, error: 'Twilio credentials not configured' };
            }
            const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`, {
                PhoneNumber: phoneNumber,
                VoiceUrl: `${process.env.BASE_URL}/api/voice/webhook`,
                VoiceMethod: 'POST'
            }, {
                auth: {
                    username: twilioAccountSid,
                    password: twilioAuthToken
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (response.status === 201) {
                return { success: true, portingId: response.data.sid };
            }
            else {
                return { success: false, error: 'Failed to initiate Twilio porting' };
            }
        }
        catch (error) {
            logger_1.default.error('Error initiating Twilio porting:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async createMigrationPlan(tenantId, migrationType, currentNumbers, targetNumbers) {
        try {
            for (const number of [...currentNumbers, ...targetNumbers]) {
                if (!this.isValidPhoneNumber(number)) {
                    return { success: false, error: `Invalid phone number format: ${number}` };
                }
            }
            const migrationSteps = this.createMigrationSteps(migrationType, currentNumbers, targetNumbers);
            const migrationPlan = await this.prisma.migrationPlan.create({
                data: {
                    tenantId: tenantId,
                    migrationType: migrationType,
                    currentNumbers: currentNumbers,
                    targetNumbers: targetNumbers,
                    migrationSteps: migrationSteps,
                    status: 'planned'
                }
            });
            logger_1.default.info(`Migration plan created: ${migrationPlan.id} for tenant: ${tenantId}`);
            return { success: true, migrationPlanId: migrationPlan.id };
        }
        catch (error) {
            logger_1.default.error('Error creating migration plan:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    createMigrationSteps(migrationType, currentNumbers, targetNumbers) {
        const steps = [];
        switch (migrationType) {
            case 'gradual':
                steps.push({ stepNumber: 1, description: 'Set up parallel routing for first number', status: 'pending' }, { stepNumber: 2, description: 'Test parallel routing functionality', status: 'pending' }, { stepNumber: 3, description: 'Switch first number to new system', status: 'pending' }, { stepNumber: 4, description: 'Monitor and validate first number', status: 'pending' }, { stepNumber: 5, description: 'Repeat process for remaining numbers', status: 'pending' }, { stepNumber: 6, description: 'Decommission old system', status: 'pending' });
                break;
            case 'cutover':
                steps.push({ stepNumber: 1, description: 'Prepare new IVR system', status: 'pending' }, { stepNumber: 2, description: 'Configure all numbers in new system', status: 'pending' }, { stepNumber: 3, description: 'Schedule maintenance window', status: 'pending' }, { stepNumber: 4, description: 'Execute cutover to new system', status: 'pending' }, { stepNumber: 5, description: 'Validate all numbers working', status: 'pending' }, { stepNumber: 6, description: 'Decommission old system', status: 'pending' });
                break;
            case 'parallel':
                steps.push({ stepNumber: 1, description: 'Set up parallel routing for all numbers', status: 'pending' }, { stepNumber: 2, description: 'Test parallel routing functionality', status: 'pending' }, { stepNumber: 3, description: 'Monitor both systems in parallel', status: 'pending' }, { stepNumber: 4, description: 'Switch all numbers to new system', status: 'pending' }, { stepNumber: 5, description: 'Validate new system performance', status: 'pending' }, { stepNumber: 6, description: 'Decommission old system', status: 'pending' });
                break;
        }
        return steps;
    }
    async executeMigrationStep(migrationPlanId, stepNumber) {
        try {
            const migrationPlan = await this.prisma.migrationPlan.findUnique({
                where: { id: migrationPlanId }
            });
            if (!migrationPlan) {
                return { success: false, error: 'Migration plan not found' };
            }
            const step = migrationPlan.migrationSteps.find((s) => s.stepNumber === stepNumber);
            if (!step) {
                return { success: false, error: 'Migration step not found' };
            }
            const updatedSteps = migrationPlan.migrationSteps.map((s) => s.stepNumber === stepNumber
                ? { ...s, status: 'in_progress', startTime: new Date() }
                : s);
            await this.prisma.migrationPlan.update({
                where: { id: migrationPlanId },
                data: { migrationSteps: updatedSteps }
            });
            const stepResult = await this.executeStepLogic(migrationPlan, step);
            const finalSteps = migrationPlan.migrationSteps.map((s) => s.stepNumber === stepNumber
                ? {
                    ...s,
                    status: stepResult.success ? 'completed' : 'failed',
                    endTime: new Date(),
                    errorMessage: stepResult.success ? undefined : stepResult.error
                }
                : s);
            await this.prisma.migrationPlan.update({
                where: { id: migrationPlanId },
                data: { migrationSteps: finalSteps }
            });
            if (stepResult.success) {
                logger_1.default.info(`Migration step ${stepNumber} completed for plan: ${migrationPlanId}`);
            }
            else {
                logger_1.default.error(`Migration step ${stepNumber} failed for plan: ${migrationPlanId}: ${stepResult.error}`);
            }
            return stepResult;
        }
        catch (error) {
            logger_1.default.error('Error executing migration step:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async executeStepLogic(migrationPlan, step) {
        try {
            switch (step.stepNumber) {
                case 1:
                    return await this.setupParallelRouting(migrationPlan);
                case 2:
                    return await this.testParallelRouting(migrationPlan);
                case 3:
                    return await this.switchToNewSystem(migrationPlan);
                case 4:
                    return await this.validateSystem(migrationPlan);
                case 5:
                    return await this.monitorSystem(migrationPlan);
                case 6:
                    return await this.decommissionOldSystem(migrationPlan);
                default:
                    return { success: false, error: 'Unknown step number' };
            }
        }
        catch (error) {
            logger_1.default.error('Error executing step logic:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async setupParallelRouting(migrationPlan) {
        logger_1.default.info('Setting up parallel routing for migration plan:', migrationPlan.id);
        return { success: true };
    }
    async testParallelRouting(migrationPlan) {
        logger_1.default.info('Testing parallel routing for migration plan:', migrationPlan.id);
        return { success: true };
    }
    async switchToNewSystem(migrationPlan) {
        logger_1.default.info('Switching to new system for migration plan:', migrationPlan.id);
        return { success: true };
    }
    async validateSystem(migrationPlan) {
        logger_1.default.info('Validating system for migration plan:', migrationPlan.id);
        return { success: true };
    }
    async monitorSystem(migrationPlan) {
        logger_1.default.info('Monitoring system for migration plan:', migrationPlan.id);
        return { success: true };
    }
    async decommissionOldSystem(migrationPlan) {
        logger_1.default.info('Decommissioning old system for migration plan:', migrationPlan.id);
        return { success: true };
    }
    async getPortingStatus(portingId) {
        try {
            const portingRequest = await this.prisma.portingRequest.findUnique({
                where: { id: portingId }
            });
            if (!portingRequest) {
                return { success: false, error: 'Porting request not found' };
            }
            return { success: true, status: portingRequest };
        }
        catch (error) {
            logger_1.default.error('Error getting porting status:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getMigrationPlan(migrationPlanId) {
        try {
            const migrationPlan = await this.prisma.migrationPlan.findUnique({
                where: { id: migrationPlanId }
            });
            if (!migrationPlan) {
                return { success: false, error: 'Migration plan not found' };
            }
            return { success: true, plan: migrationPlan };
        }
        catch (error) {
            logger_1.default.error('Error getting migration plan:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    isValidPhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
    }
    async handlePortingWebhook(provider, webhookData) {
        try {
            if (provider === 'telnyx') {
                return await this.handleTelnyxPortingWebhook(webhookData);
            }
            else if (provider === 'twilio') {
                return await this.handleTwilioPortingWebhook(webhookData);
            }
            else {
                return { success: false, error: 'Unsupported provider' };
            }
        }
        catch (error) {
            logger_1.default.error('Error handling porting webhook:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async handleTelnyxPortingWebhook(webhookData) {
        logger_1.default.info('Handling Telnyx porting webhook:', webhookData);
        return { success: true };
    }
    async handleTwilioPortingWebhook(webhookData) {
        logger_1.default.info('Handling Twilio porting webhook:', webhookData);
        return { success: true };
    }
}
exports.PhoneNumberMigrationService = PhoneNumberMigrationService;
//# sourceMappingURL=PhoneNumberMigrationService.js.map