export interface StripeCLIConfig {
    cliPath?: string;
    webhookUrl: string;
    events: string[];
    forwardPort?: number;
}
export interface StripeCLIStatus {
    isRunning: boolean;
    pid?: number;
    webhookUrl?: string;
    events?: string[];
    lastEvent?: Date;
    errorCount: number;
}
export declare class StripeCLIService {
    private config;
    private cliProcess;
    private status;
    constructor(config: StripeCLIConfig);
    startWebhookForwarding(): Promise<void>;
    stopWebhookForwarding(): Promise<void>;
    triggerTestEvent(eventType: string, data?: any): Promise<void>;
    getStatus(): StripeCLIStatus;
    isInstalled(): Promise<boolean>;
    login(): Promise<void>;
    getWebhookSecret(): Promise<string | null>;
    private saveWebhookSecret;
    private waitForReady;
    restart(): Promise<void>;
    getAvailableTestEvents(): string[];
    triggerMultipleEvents(events: string[]): Promise<void>;
    getLogs(): string[];
    cleanup(): Promise<void>;
}
//# sourceMappingURL=StripeCLIService.d.ts.map