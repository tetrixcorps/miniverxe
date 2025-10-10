"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicOnboardingService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const IndustryIVRService_1 = require("./IndustryIVRService");
class DynamicOnboardingService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.industryIVRService = new IndustryIVRService_1.IndustryIVRService(prisma, redis);
    }
    async startOnboardingSession(phoneNumber, industry) {
        try {
            const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const session = {
                sessionId,
                industry: industry || 'general',
                step: 'welcome',
                data: {},
                phoneNumber,
                preferences: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.redis.setEx(`onboarding:${sessionId}`, 3600, JSON.stringify(session));
            logger_1.default.info(`Started onboarding session: ${sessionId} for ${phoneNumber}`);
            return { success: true, sessionId };
        }
        catch (error) {
            logger_1.default.error('Error starting onboarding session:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getOnboardingSession(sessionId) {
        try {
            const sessionData = await this.redis.get(`onboarding:${sessionId}`);
            if (!sessionData) {
                return null;
            }
            return JSON.parse(sessionData);
        }
        catch (error) {
            logger_1.default.error('Error getting onboarding session:', error);
            return null;
        }
    }
    async updateOnboardingSession(sessionId, updates) {
        try {
            const session = await this.getOnboardingSession(sessionId);
            if (!session) {
                return { success: false, error: 'Session not found' };
            }
            const updatedSession = {
                ...session,
                ...updates,
                updatedAt: new Date()
            };
            await this.redis.setEx(`onboarding:${sessionId}`, 3600, JSON.stringify(updatedSession));
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error updating onboarding session:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async processOnboardingStep(sessionId, step, input) {
        try {
            const session = await this.getOnboardingSession(sessionId);
            if (!session) {
                return { success: false, error: 'Session not found' };
            }
            let response;
            let nextStep;
            switch (step) {
                case 'welcome':
                    response = this.getWelcomeMessage(session.industry);
                    nextStep = 'industry_selection';
                    break;
                case 'industry_selection':
                    if (!input.industry) {
                        response = 'Please select your industry from the available options.';
                        nextStep = 'industry_selection';
                    }
                    else {
                        session.industry = input.industry;
                        response = this.getIndustryConfirmationMessage(input.industry);
                        nextStep = 'company_info';
                    }
                    break;
                case 'company_info':
                    if (!input.companyName) {
                        response = 'Please provide your company name.';
                        nextStep = 'company_info';
                    }
                    else {
                        session.companyName = input.companyName;
                        response = this.getCompanyInfoConfirmationMessage(input.companyName);
                        nextStep = 'contact_info';
                    }
                    break;
                case 'contact_info':
                    if (!input.email) {
                        response = 'Please provide your email address.';
                        nextStep = 'contact_info';
                    }
                    else {
                        session.email = input.email;
                        response = this.getContactInfoConfirmationMessage(input.email);
                        nextStep = 'requirements';
                    }
                    break;
                case 'requirements':
                    session.preferences = input.preferences || {};
                    response = this.getRequirementsConfirmationMessage(session.industry, input.preferences);
                    nextStep = 'pricing';
                    break;
                case 'pricing':
                    const pricing = await this.industryIVRService.getIndustryPricing(session.industry);
                    response = this.getPricingMessage(pricing);
                    nextStep = 'confirmation';
                    break;
                case 'confirmation':
                    if (input.confirm) {
                        const result = await this.completeOnboarding(session);
                        if (result.success) {
                            response = this.getCompletionMessage(session.industry, result.tenantId || 'unknown');
                            nextStep = 'completed';
                        }
                        else {
                            response = 'There was an error completing your setup. Please try again or contact support.';
                            nextStep = 'error';
                        }
                    }
                    else {
                        response = 'Please confirm your information to proceed.';
                        nextStep = 'confirmation';
                    }
                    break;
                default:
                    response = 'I didn\'t understand that. Please try again.';
                    nextStep = step;
            }
            await this.updateOnboardingSession(sessionId, {
                step: nextStep,
                data: { ...session.data, ...input }
            });
            return { success: true, response, nextStep };
        }
        catch (error) {
            logger_1.default.error('Error processing onboarding step:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    getWelcomeMessage(industry) {
        return `Welcome to TETRIX White-Label IVR! I'll help you set up your ${industry} IVR system. Let's start by confirming your industry.`;
    }
    getIndustryConfirmationMessage(industry) {
        const industryNames = {
            construction: 'Construction',
            logistics: 'Logistics & Fleet Management',
            healthcare: 'Healthcare',
            government: 'Government',
            education: 'Education',
            retail: 'Retail',
            hospitality: 'Hospitality',
            wellness: 'Wellness',
            beauty: 'Beauty'
        };
        return `Great! I see you're in the ${industryNames[industry] || industry} industry. Now, please provide your company name.`;
    }
    getCompanyInfoConfirmationMessage(companyName) {
        return `Perfect! ${companyName} is a great company name. Now, please provide your email address for account setup.`;
    }
    getContactInfoConfirmationMessage(email) {
        return `Excellent! I have your email as ${email}. Now, let me ask about your specific requirements for the IVR system.`;
    }
    getRequirementsConfirmationMessage(industry, preferences) {
        return `Thank you for providing your requirements. Let me show you the pricing options for your ${industry} IVR system.`;
    }
    getPricingMessage(pricing) {
        if (!pricing) {
            return 'I\'m sorry, I couldn\'t retrieve pricing information. Please contact our sales team.';
        }
        return `Here are your pricing options:

Base Price: $${pricing.basePrice}/month
Included Minutes: ${pricing.includedMinutes}
Additional Minutes: $${pricing.perMinuteRate}/minute

Would you like to proceed with this pricing?`;
    }
    getCompletionMessage(industry, tenantId) {
        return `Congratulations! Your ${industry} IVR system has been set up successfully. Your tenant ID is ${tenantId}. You can now start using your IVR system.`;
    }
    async completeOnboarding(session) {
        try {
            const result = await this.industryIVRService.createIndustryTenant(session.industry, {
                name: session.companyName || 'Unknown Company',
                email: session.email || 'unknown@example.com',
                phoneNumber: session.phoneNumber,
                preferences: session.preferences
            });
            if (result.success) {
                await this.prisma.onboardingCompletion.create({
                    data: {
                        sessionId: session.sessionId,
                        tenantId: result.tenantId,
                        industry: session.industry,
                        companyName: session.companyName,
                        email: session.email,
                        phoneNumber: session.phoneNumber,
                        preferences: session.preferences,
                        completedAt: new Date()
                    }
                });
                await this.redis.del(`onboarding:${session.sessionId}`);
                logger_1.default.info(`Completed onboarding for tenant: ${result.tenantId}`);
                return { success: true, tenantId: result.tenantId };
            }
            else {
                return { success: false, error: result.error };
            }
        }
        catch (error) {
            logger_1.default.error('Error completing onboarding:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getOnboardingStatus(sessionId) {
        try {
            const session = await this.getOnboardingSession(sessionId);
            if (!session) {
                return { success: false, error: 'Session not found' };
            }
            return {
                success: true,
                status: {
                    sessionId: session.sessionId,
                    industry: session.industry,
                    step: session.step,
                    companyName: session.companyName,
                    email: session.email,
                    phoneNumber: session.phoneNumber,
                    progress: this.calculateProgress(session.step)
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting onboarding status:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    calculateProgress(step) {
        const steps = ['welcome', 'industry_selection', 'company_info', 'contact_info', 'requirements', 'pricing', 'confirmation', 'completed'];
        const currentIndex = steps.indexOf(step);
        return Math.round((currentIndex / (steps.length - 1)) * 100);
    }
    async handleTollFreeCall(phoneNumber) {
        try {
            const existingTenant = await this.prisma.tenant.findFirst({
                where: {
                    phoneNumbers: {
                        has: phoneNumber
                    }
                }
            });
            if (existingTenant) {
                return {
                    success: true,
                    response: `Welcome back! You have reached ${existingTenant.name}. Please hold while we connect you to our IVR system.`,
                    sessionId: undefined
                };
            }
            const result = await this.startOnboardingSession(phoneNumber);
            if (result.success) {
                return {
                    success: true,
                    response: 'Welcome to TETRIX! I\'ll help you set up your White-Label IVR system. What industry are you in?',
                    sessionId: result.sessionId
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            logger_1.default.error('Error handling toll-free call:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.DynamicOnboardingService = DynamicOnboardingService;
//# sourceMappingURL=DynamicOnboardingService.js.map