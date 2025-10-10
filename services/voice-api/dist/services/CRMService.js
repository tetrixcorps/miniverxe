"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMService = void 0;
const uuid_1 = require("uuid");
class CRMService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createCRMUser(userId, tollFreeNumbers, preferences) {
        const crmUser = {
            id: (0, uuid_1.v4)(),
            userId,
            tollFreeNumbers,
            hitlConfig: null,
            preferences: {
                dashboardLayout: 'default',
                notifications: {
                    email: true,
                    sms: false,
                    webhook: false,
                    escalationAlerts: true,
                    dailyReports: true,
                    weeklyReports: false
                },
                reporting: {
                    timezone: 'UTC',
                    dateFormat: 'YYYY-MM-DD',
                    currency: 'USD',
                    language: 'en',
                    autoGenerate: false,
                    recipients: []
                },
                integrations: {
                    webhooks: [],
                    apis: [],
                    exports: []
                },
                ...preferences
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.storeCRMUser(crmUser);
        return crmUser;
    }
    async storeCallInsight(insight) {
        try {
            await this.redis.setEx(`call_insight:${insight.id}`, 3600, JSON.stringify(insight));
            await this.storeCallInsightInDB(insight);
            await this.updateRealTimeAnalytics(insight);
            await this.checkAlerts(insight);
        }
        catch (error) {
            console.error('Error storing call insight:', error);
            throw error;
        }
    }
    async getCallAnalytics(userId, startDate, endDate, tollFreeNumber) {
        try {
            const insights = await this.getCallInsightsFromDB(userId, startDate, endDate, tollFreeNumber);
            const analytics = {
                totalCalls: insights.length,
                answeredCalls: insights.filter(i => i.duration > 0).length,
                missedCalls: insights.filter(i => i.duration === 0).length,
                averageDuration: this.calculateAverageDuration(insights),
                escalationRate: this.calculateEscalationRate(insights),
                satisfactionScore: this.calculateAverageSatisfaction(insights),
                topIntents: this.calculateTopIntents(insights),
                sentimentTrend: this.calculateSentimentTrend(insights),
                hourlyDistribution: this.calculateHourlyDistribution(insights),
                dailyDistribution: this.calculateDailyDistribution(insights)
            };
            return analytics;
        }
        catch (error) {
            console.error('Error getting call analytics:', error);
            throw error;
        }
    }
    async getRealTimeDashboard(userId) {
        try {
            const crmUser = await this.getCRMUser(userId);
            if (!crmUser) {
                throw new Error('CRM user not found');
            }
            const activeCalls = await this.getActiveCalls(userId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todayInsights = await this.getCallInsightsFromDB(userId, today, tomorrow);
            const metrics = {
                callsPerHour: this.calculateCallsPerHour(todayInsights),
                averageWaitTime: this.calculateAverageWaitTime(todayInsights),
                firstCallResolution: this.calculateFirstCallResolution(todayInsights),
                customerSatisfaction: this.calculateAverageSatisfaction(todayInsights),
                agentUtilization: this.calculateAgentUtilization(activeCalls)
            };
            const recentCalls = todayInsights
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 10);
            const alerts = await this.getActiveAlerts(userId);
            const dashboard = {
                activeCalls: activeCalls.length,
                todayCalls: todayInsights.length,
                escalationRate: this.calculateEscalationRate(todayInsights),
                averageSatisfaction: this.calculateAverageSatisfaction(todayInsights),
                recentCalls,
                alerts,
                metrics
            };
            return dashboard;
        }
        catch (error) {
            console.error('Error getting real-time dashboard:', error);
            throw error;
        }
    }
    async generateInsights(userId, callId) {
        try {
            const insight = await this.getCallInsight(callId);
            if (!insight) {
                throw new Error('Call insight not found');
            }
            const insights = [];
            insights.push({
                type: 'intent',
                value: insight.intent,
                confidence: 0.8,
                timestamp: insight.createdAt,
                metadata: { callId, userId }
            });
            insights.push({
                type: 'sentiment',
                value: insight.sentiment,
                confidence: 0.7,
                timestamp: insight.createdAt,
                metadata: { callId, userId, sentiment_label: this.getSentimentLabel(insight.sentiment) }
            });
            if (insight.escalationReason) {
                insights.push({
                    type: 'escalation',
                    value: insight.escalationReason,
                    confidence: 1.0,
                    timestamp: insight.createdAt,
                    metadata: { callId, userId }
                });
            }
            insights.push({
                type: 'satisfaction',
                value: insight.satisfactionScore,
                confidence: 0.9,
                timestamp: insight.createdAt,
                metadata: { callId, userId, satisfaction_label: this.getSatisfactionLabel(insight.satisfactionScore) }
            });
            insight.keywords.forEach(keyword => {
                insights.push({
                    type: 'keyword',
                    value: keyword,
                    confidence: 0.6,
                    timestamp: insight.createdAt,
                    metadata: { callId, userId }
                });
            });
            insight.entities.forEach(entity => {
                insights.push({
                    type: 'entity',
                    value: entity,
                    confidence: entity.confidence || 0.8,
                    timestamp: insight.createdAt,
                    metadata: { callId, userId }
                });
            });
            return insights;
        }
        catch (error) {
            console.error('Error generating insights:', error);
            throw error;
        }
    }
    async exportData(userId, format, startDate, endDate, tollFreeNumber) {
        try {
            const insights = await this.getCallInsightsFromDB(userId, startDate, endDate, tollFreeNumber);
            switch (format) {
                case 'csv':
                    return this.exportToCSV(insights);
                case 'json':
                    return this.exportToJSON(insights);
                case 'xlsx':
                    return this.exportToXLSX(insights);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        }
        catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }
    async storeCRMUser(crmUser) {
        await this.redis.setEx(`crm_user:${crmUser.userId}`, 3600, JSON.stringify(crmUser));
    }
    async getCRMUser(userId) {
        const userData = await this.redis.get(`crm_user:${userId}`);
        return userData ? JSON.parse(userData) : null;
    }
    async storeCallInsightInDB(insight) {
        console.log('Storing call insight in database:', insight.id);
    }
    async getCallInsightsFromDB(userId, startDate, endDate, tollFreeNumber) {
        return [];
    }
    async updateRealTimeAnalytics(insight) {
        const today = new Date().toISOString().split('T')[0];
        await this.redis.incr(`analytics:calls:${insight.userId}:${today}`);
        await this.redis.incr(`analytics:calls:${insight.userId}:${today}:${insight.tollFreeNumber}`);
        if (insight.escalationReason) {
            await this.redis.incr(`analytics:escalations:${insight.userId}:${today}`);
        }
    }
    async checkAlerts(insight) {
        if (insight.satisfactionScore < 3) {
            await this.createAlert(insight.userId, {
                type: 'satisfaction',
                severity: 'high',
                message: `Low satisfaction score (${insight.satisfactionScore}) for call ${insight.callId}`
            });
        }
        if (insight.escalationReason) {
            await this.createAlert(insight.userId, {
                type: 'escalation',
                severity: 'medium',
                message: `Call escalated: ${insight.escalationReason}`
            });
        }
    }
    async createAlert(userId, alert) {
        const dashboardAlert = {
            ...alert,
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            acknowledged: false
        };
        await this.redis.lPush(`alerts:${userId}`, JSON.stringify(dashboardAlert));
    }
    async getActiveCalls(userId) {
        return [];
    }
    async getActiveAlerts(userId) {
        const alerts = await this.redis.lRange(`alerts:${userId}`, 0, 9);
        return alerts.map(alert => JSON.parse(alert));
    }
    calculateAverageDuration(insights) {
        if (insights.length === 0)
            return 0;
        const totalDuration = insights.reduce((sum, insight) => sum + insight.duration, 0);
        return totalDuration / insights.length;
    }
    calculateEscalationRate(insights) {
        if (insights.length === 0)
            return 0;
        const escalatedCalls = insights.filter(insight => insight.escalationReason).length;
        return (escalatedCalls / insights.length) * 100;
    }
    calculateAverageSatisfaction(insights) {
        if (insights.length === 0)
            return 0;
        const totalSatisfaction = insights.reduce((sum, insight) => sum + insight.satisfactionScore, 0);
        return totalSatisfaction / insights.length;
    }
    calculateTopIntents(insights) {
        const intentCounts = new Map();
        const intentDurations = new Map();
        const intentEscalations = new Map();
        const intentSatisfaction = new Map();
        insights.forEach(insight => {
            const intent = insight.intent;
            intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
            if (!intentDurations.has(intent)) {
                intentDurations.set(intent, []);
            }
            intentDurations.get(intent).push(insight.duration);
            if (insight.escalationReason) {
                intentEscalations.set(intent, (intentEscalations.get(intent) || 0) + 1);
            }
            if (!intentSatisfaction.has(intent)) {
                intentSatisfaction.set(intent, []);
            }
            intentSatisfaction.get(intent).push(insight.satisfactionScore);
        });
        return Array.from(intentCounts.entries()).map(([intent, count]) => {
            const durations = intentDurations.get(intent) || [];
            const satisfactions = intentSatisfaction.get(intent) || [];
            const escalations = intentEscalations.get(intent) || 0;
            return {
                intent,
                count,
                percentage: (count / insights.length) * 100,
                averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
                escalationRate: (escalations / count) * 100,
                satisfactionScore: satisfactions.length > 0 ? satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length : 0
            };
        }).sort((a, b) => b.count - a.count);
    }
    calculateSentimentTrend(insights) {
        const dateGroups = new Map();
        insights.forEach(insight => {
            const date = insight.createdAt.toISOString().split('T')[0];
            if (!dateGroups.has(date)) {
                dateGroups.set(date, []);
            }
            dateGroups.get(date).push(insight);
        });
        return Array.from(dateGroups.entries()).map(([date, dayInsights]) => {
            const sentiments = dayInsights.map(insight => insight.sentiment);
            const positive = sentiments.filter(s => s > 0.6).length;
            const neutral = sentiments.filter(s => s >= 0.4 && s <= 0.6).length;
            const negative = sentiments.filter(s => s < 0.4).length;
            const average = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
            return {
                date,
                positive,
                neutral,
                negative,
                average
            };
        }).sort((a, b) => a.date.localeCompare(b.date));
    }
    calculateHourlyDistribution(insights) {
        const hourlyData = new Map();
        insights.forEach(insight => {
            const hour = insight.createdAt.getHours();
            if (!hourlyData.has(hour)) {
                hourlyData.set(hour, { calls: 0, durations: [], escalations: 0 });
            }
            const data = hourlyData.get(hour);
            data.calls++;
            data.durations.push(insight.duration);
            if (insight.escalationReason) {
                data.escalations++;
            }
        });
        return Array.from(hourlyData.entries()).map(([hour, data]) => ({
            hour,
            calls: data.calls,
            averageDuration: data.durations.length > 0 ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length : 0,
            escalationRate: data.calls > 0 ? (data.escalations / data.calls) * 100 : 0
        })).sort((a, b) => a.hour - b.hour);
    }
    calculateDailyDistribution(insights) {
        const dailyData = new Map();
        insights.forEach(insight => {
            const date = insight.createdAt.toISOString().split('T')[0];
            if (!dailyData.has(date)) {
                dailyData.set(date, { calls: 0, durations: [], escalations: 0, satisfactions: [] });
            }
            const data = dailyData.get(date);
            data.calls++;
            data.durations.push(insight.duration);
            data.satisfactions.push(insight.satisfactionScore);
            if (insight.escalationReason) {
                data.escalations++;
            }
        });
        return Array.from(dailyData.entries()).map(([date, data]) => ({
            date,
            calls: data.calls,
            averageDuration: data.durations.length > 0 ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length : 0,
            escalationRate: data.calls > 0 ? (data.escalations / data.calls) * 100 : 0,
            satisfactionScore: data.satisfactions.length > 0 ? data.satisfactions.reduce((a, b) => a + b, 0) / data.satisfactions.length : 0
        })).sort((a, b) => a.date.localeCompare(b.date));
    }
    calculateCallsPerHour(insights) {
        if (insights.length === 0)
            return 0;
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const hoursElapsed = (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60);
        return insights.length / Math.max(hoursElapsed, 1);
    }
    calculateAverageWaitTime(insights) {
        return 0;
    }
    calculateFirstCallResolution(insights) {
        return 0;
    }
    calculateAgentUtilization(activeCalls) {
        return 0;
    }
    getSentimentLabel(sentiment) {
        if (sentiment > 0.6)
            return 'positive';
        if (sentiment < 0.4)
            return 'negative';
        return 'neutral';
    }
    getSatisfactionLabel(score) {
        if (score >= 4)
            return 'excellent';
        if (score >= 3)
            return 'good';
        if (score >= 2)
            return 'fair';
        return 'poor';
    }
    exportToCSV(insights) {
        return 'CSV export not implemented';
    }
    exportToJSON(insights) {
        return JSON.stringify(insights, null, 2);
    }
    exportToXLSX(insights) {
        return 'XLSX export not implemented';
    }
    async getCallInsight(callId) {
        const insightData = await this.redis.get(`call_insight:${callId}`);
        return insightData ? JSON.parse(insightData) : null;
    }
}
exports.CRMService = CRMService;
//# sourceMappingURL=CRMService.js.map