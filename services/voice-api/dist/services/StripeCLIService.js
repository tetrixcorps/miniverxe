"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeCLIService = void 0;
const child_process_1 = require("child_process");
const logger_1 = __importDefault(require("../utils/logger"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class StripeCLIService {
    constructor(config) {
        this.cliProcess = null;
        this.status = {
            isRunning: false,
            errorCount: 0
        };
        this.config = config;
    }
    async startWebhookForwarding() {
        try {
            if (this.status.isRunning) {
                logger_1.default.warn('Stripe CLI is already running');
                return;
            }
            const cliPath = this.config.cliPath || 'stripe';
            const webhookUrl = this.config.webhookUrl;
            const events = this.config.events.join(',');
            logger_1.default.info('Starting Stripe CLI webhook forwarding', {
                cliPath,
                webhookUrl,
                events
            });
            const args = [
                'listen',
                '--forward-to',
                webhookUrl
            ];
            if (events) {
                args.push('--events', events);
            }
            if (this.config.forwardPort) {
                args.push('--port', this.config.forwardPort.toString());
            }
            this.cliProcess = (0, child_process_1.spawn)(cliPath, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env }
            });
            this.cliProcess.on('spawn', () => {
                logger_1.default.info('Stripe CLI process spawned successfully');
                this.status.isRunning = true;
                this.status.pid = this.cliProcess?.pid;
                this.status.webhookUrl = webhookUrl;
                this.status.events = this.config.events;
            });
            this.cliProcess.on('error', (error) => {
                logger_1.default.error('Stripe CLI process error:', error);
                this.status.errorCount++;
                this.status.isRunning = false;
            });
            this.cliProcess.on('exit', (code, signal) => {
                logger_1.default.info(`Stripe CLI process exited with code ${code}, signal ${signal}`);
                this.status.isRunning = false;
                this.cliProcess = null;
            });
            this.cliProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                logger_1.default.info('Stripe CLI output:', output);
                const secretMatch = output.match(/whsec_[a-zA-Z0-9]+/);
                if (secretMatch) {
                    logger_1.default.info('Webhook signing secret detected:', secretMatch[0]);
                    this.saveWebhookSecret(secretMatch[0]);
                }
                if (output.includes('-->')) {
                    this.status.lastEvent = new Date();
                }
            });
            this.cliProcess.stderr?.on('data', (data) => {
                const error = data.toString();
                logger_1.default.error('Stripe CLI error:', error);
                this.status.errorCount++;
            });
            await this.waitForReady();
        }
        catch (error) {
            logger_1.default.error('Error starting Stripe CLI:', error);
            throw error;
        }
    }
    async stopWebhookForwarding() {
        try {
            if (!this.status.isRunning || !this.cliProcess) {
                logger_1.default.warn('Stripe CLI is not running');
                return;
            }
            logger_1.default.info('Stopping Stripe CLI webhook forwarding');
            this.cliProcess.kill('SIGTERM');
            await new Promise((resolve) => {
                if (!this.cliProcess) {
                    resolve();
                    return;
                }
                this.cliProcess.on('exit', () => {
                    resolve();
                });
                setTimeout(() => {
                    if (this.cliProcess) {
                        this.cliProcess.kill('SIGKILL');
                        resolve();
                    }
                }, 5000);
            });
            this.status.isRunning = false;
            this.cliProcess = null;
            logger_1.default.info('Stripe CLI stopped successfully');
        }
        catch (error) {
            logger_1.default.error('Error stopping Stripe CLI:', error);
            throw error;
        }
    }
    async triggerTestEvent(eventType, data) {
        try {
            if (!this.status.isRunning) {
                throw new Error('Stripe CLI is not running');
            }
            const cliPath = this.config.cliPath || 'stripe';
            const args = ['trigger', eventType];
            if (data) {
                args.push('--add', JSON.stringify(data));
            }
            logger_1.default.info('Triggering test event', { eventType, data });
            return new Promise((resolve, reject) => {
                const triggerProcess = (0, child_process_1.spawn)(cliPath, args, {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                triggerProcess.on('error', (error) => {
                    logger_1.default.error('Error triggering test event:', error);
                    reject(error);
                });
                triggerProcess.on('exit', (code) => {
                    if (code === 0) {
                        logger_1.default.info(`Test event ${eventType} triggered successfully`);
                        resolve();
                    }
                    else {
                        reject(new Error(`Failed to trigger test event, exit code: ${code}`));
                    }
                });
                triggerProcess.stdout?.on('data', (data) => {
                    logger_1.default.info('Trigger output:', data.toString());
                });
                triggerProcess.stderr?.on('data', (data) => {
                    logger_1.default.error('Trigger error:', data.toString());
                });
            });
        }
        catch (error) {
            logger_1.default.error('Error triggering test event:', error);
            throw error;
        }
    }
    getStatus() {
        return { ...this.status };
    }
    async isInstalled() {
        try {
            const cliPath = this.config.cliPath || 'stripe';
            return new Promise((resolve) => {
                const checkProcess = (0, child_process_1.spawn)(cliPath, ['--version'], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                checkProcess.on('error', () => {
                    resolve(false);
                });
                checkProcess.on('exit', (code) => {
                    resolve(code === 0);
                });
            });
        }
        catch (error) {
            return false;
        }
    }
    async login() {
        try {
            const cliPath = this.config.cliPath || 'stripe';
            logger_1.default.info('Logging into Stripe CLI');
            return new Promise((resolve, reject) => {
                const loginProcess = (0, child_process_1.spawn)(cliPath, ['login'], {
                    stdio: ['inherit', 'inherit', 'inherit']
                });
                loginProcess.on('error', (error) => {
                    logger_1.default.error('Error logging into Stripe CLI:', error);
                    reject(error);
                });
                loginProcess.on('exit', (code) => {
                    if (code === 0) {
                        logger_1.default.info('Successfully logged into Stripe CLI');
                        resolve();
                    }
                    else {
                        reject(new Error(`Login failed with exit code: ${code}`));
                    }
                });
            });
        }
        catch (error) {
            logger_1.default.error('Error logging into Stripe CLI:', error);
            throw error;
        }
    }
    async getWebhookSecret() {
        try {
            const secretPath = path_1.default.join(process.cwd(), '.stripe-webhook-secret');
            if (fs_1.default.existsSync(secretPath)) {
                const secret = fs_1.default.readFileSync(secretPath, 'utf8').trim();
                return secret;
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Error reading webhook secret:', error);
            return null;
        }
    }
    saveWebhookSecret(secret) {
        try {
            const secretPath = path_1.default.join(process.cwd(), '.stripe-webhook-secret');
            fs_1.default.writeFileSync(secretPath, secret);
            logger_1.default.info('Webhook signing secret saved');
        }
        catch (error) {
            logger_1.default.error('Error saving webhook secret:', error);
        }
    }
    async waitForReady() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for Stripe CLI to be ready'));
            }, 30000);
            const checkReady = () => {
                if (this.status.isRunning) {
                    clearTimeout(timeout);
                    resolve();
                }
                else {
                    setTimeout(checkReady, 1000);
                }
            };
            checkReady();
        });
    }
    async restart() {
        try {
            logger_1.default.info('Restarting Stripe CLI');
            await this.stopWebhookForwarding();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await this.startWebhookForwarding();
            logger_1.default.info('Stripe CLI restarted successfully');
        }
        catch (error) {
            logger_1.default.error('Error restarting Stripe CLI:', error);
            throw error;
        }
    }
    getAvailableTestEvents() {
        return [
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'payment_intent.canceled',
            'payment_intent.requires_action',
            'checkout.session.completed',
            'checkout.session.expired',
            'invoice.payment_succeeded',
            'invoice.payment_failed',
            'invoice.created',
            'invoice.updated',
            'customer.created',
            'customer.updated',
            'customer.deleted',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'customer.subscription.trial_will_end',
            'payment_method.attached',
            'payment_method.detached',
            'payment_method.updated',
            'charge.dispute.created',
            'charge.dispute.updated',
            'charge.dispute.closed',
            'charge.refunded',
            'account.updated',
            'capability.updated'
        ];
    }
    async triggerMultipleEvents(events) {
        try {
            logger_1.default.info('Triggering multiple test events', { events });
            for (const event of events) {
                await this.triggerTestEvent(event);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            logger_1.default.info('All test events triggered successfully');
        }
        catch (error) {
            logger_1.default.error('Error triggering multiple events:', error);
            throw error;
        }
    }
    getLogs() {
        return [];
    }
    async cleanup() {
        try {
            if (this.status.isRunning) {
                await this.stopWebhookForwarding();
            }
        }
        catch (error) {
            logger_1.default.error('Error during cleanup:', error);
        }
    }
}
exports.StripeCLIService = StripeCLIService;
//# sourceMappingURL=StripeCLIService.js.map