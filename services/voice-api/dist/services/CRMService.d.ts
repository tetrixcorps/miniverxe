import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface CRMUser {
    id: string;
    userId: string;
    tollFreeNumbers: string[];
    hitlConfig: any;
    preferences: CRMUserPreferences;
    createdAt: Date;
    updatedAt: Date;
}
export interface CRMUserPreferences {
    dashboardLayout: string;
    notifications: NotificationSettings;
    reporting: ReportingSettings;
    integrations: IntegrationSettings;
}
export interface NotificationSettings {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    escalationAlerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
}
export interface ReportingSettings {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
    autoGenerate: boolean;
    recipients: string[];
}
export interface IntegrationSettings {
    webhooks: WebhookConfig[];
    apis: APIConfig[];
    exports: ExportConfig[];
}
export interface WebhookConfig {
    id: string;
    url: string;
    events: string[];
    secret: string;
    active: boolean;
}
export interface APIConfig {
    id: string;
    name: string;
    endpoint: string;
    authType: 'bearer' | 'basic' | 'api_key';
    credentials: any;
    active: boolean;
}
export interface ExportConfig {
    id: string;
    name: string;
    format: 'csv' | 'json' | 'xlsx';
    schedule: string;
    recipients: string[];
    active: boolean;
}
export interface CallInsight {
    id: string;
    callId: string;
    userId: string;
    tollFreeNumber: string;
    callerId: string;
    duration: number;
    intent: string;
    sentiment: number;
    satisfactionScore: number;
    escalationReason?: string;
    transcript: string;
    entities: any[];
    keywords: string[];
    insights: InsightData[];
    createdAt: Date;
}
export interface InsightData {
    type: 'intent' | 'sentiment' | 'escalation' | 'satisfaction' | 'keyword' | 'entity';
    value: any;
    confidence: number;
    timestamp: Date;
    metadata: any;
}
export interface CallAnalytics {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    averageDuration: number;
    escalationRate: number;
    satisfactionScore: number;
    topIntents: IntentAnalytics[];
    sentimentTrend: SentimentAnalytics[];
    hourlyDistribution: HourlyAnalytics[];
    dailyDistribution: DailyAnalytics[];
}
export interface IntentAnalytics {
    intent: string;
    count: number;
    percentage: number;
    averageDuration: number;
    escalationRate: number;
    satisfactionScore: number;
}
export interface SentimentAnalytics {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    average: number;
}
export interface HourlyAnalytics {
    hour: number;
    calls: number;
    averageDuration: number;
    escalationRate: number;
}
export interface DailyAnalytics {
    date: string;
    calls: number;
    averageDuration: number;
    escalationRate: number;
    satisfactionScore: number;
}
export interface RealTimeDashboard {
    activeCalls: number;
    todayCalls: number;
    escalationRate: number;
    averageSatisfaction: number;
    recentCalls: CallInsight[];
    alerts: DashboardAlert[];
    metrics: DashboardMetrics;
}
export interface DashboardAlert {
    id: string;
    type: 'escalation' | 'satisfaction' | 'volume' | 'error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
}
export interface DashboardMetrics {
    callsPerHour: number;
    averageWaitTime: number;
    firstCallResolution: number;
    customerSatisfaction: number;
    agentUtilization: number;
}
export declare class CRMService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    createCRMUser(userId: string, tollFreeNumbers: string[], preferences?: Partial<CRMUserPreferences>): Promise<CRMUser>;
    storeCallInsight(insight: CallInsight): Promise<void>;
    getCallAnalytics(userId: string, startDate: Date, endDate: Date, tollFreeNumber?: string): Promise<CallAnalytics>;
    getRealTimeDashboard(userId: string): Promise<RealTimeDashboard>;
    generateInsights(userId: string, callId: string): Promise<InsightData[]>;
    exportData(userId: string, format: 'csv' | 'json' | 'xlsx', startDate: Date, endDate: Date, tollFreeNumber?: string): Promise<string>;
    private storeCRMUser;
    private getCRMUser;
    private storeCallInsightInDB;
    private getCallInsightsFromDB;
    private updateRealTimeAnalytics;
    private checkAlerts;
    private createAlert;
    private getActiveCalls;
    private getActiveAlerts;
    private calculateAverageDuration;
    private calculateEscalationRate;
    private calculateAverageSatisfaction;
    private calculateTopIntents;
    private calculateSentimentTrend;
    private calculateHourlyDistribution;
    private calculateDailyDistribution;
    private calculateCallsPerHour;
    private calculateAverageWaitTime;
    private calculateFirstCallResolution;
    private calculateAgentUtilization;
    private getSentimentLabel;
    private getSatisfactionLabel;
    private exportToCSV;
    private exportToJSON;
    private exportToXLSX;
    private getCallInsight;
}
//# sourceMappingURL=CRMService.d.ts.map