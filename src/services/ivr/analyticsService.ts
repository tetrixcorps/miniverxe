// IVR Analytics Service
// Provides comprehensive call analytics and reporting

import { ivrService, type IVRCallSession } from './ivrService';

export interface IVRAnalytics {
  totalCalls: number;
  completedCalls: number;
  abandonedCalls: number;
  averageCallDuration: number;
  averageWaitTime: number;
  containmentRate: number;
  transferRate: number;
  industryBreakdown: Record<string, number>;
  stepDropOffs: Record<string, number>;
  topOptions: Array<{ option: string; count: number }>;
  timeOfDayBreakdown: Record<string, number>;
}

export interface CallMetrics {
  sessionId: string;
  industry: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: string;
  stepsCompleted: string[];
  finalStep?: string;
  transferred: boolean;
  transferredTo?: string;
  collectedData: Record<string, any>;
}

class IVRAnalyticsService {
  private callMetrics: Map<string, CallMetrics> = new Map();
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
  }

  /**
   * Track call start
   */
  trackCallStart(session: IVRCallSession): void {
    const metrics: CallMetrics = {
      sessionId: session.sessionId,
      industry: session.industry,
      startTime: session.startTime,
      duration: 0,
      status: 'in_progress',
      stepsCompleted: [session.currentStep],
      transferred: false,
      collectedData: session.collectedData
    };

    this.callMetrics.set(session.sessionId, metrics);
  }

  /**
   * Track step completion
   */
  trackStepCompletion(sessionId: string, stepId: string): void {
    const metrics = this.callMetrics.get(sessionId);
    if (metrics) {
      if (!metrics.stepsCompleted.includes(stepId)) {
        metrics.stepsCompleted.push(stepId);
      }
      metrics.finalStep = stepId;
    }
  }

  /**
   * Track call transfer
   */
  trackTransfer(sessionId: string, destination: string): void {
    const metrics = this.callMetrics.get(sessionId);
    if (metrics) {
      metrics.transferred = true;
      metrics.transferredTo = destination;
    }
  }

  /**
   * Track call completion
   */
  trackCallCompletion(session: IVRCallSession, duration: number): void {
    const metrics = this.callMetrics.get(session.sessionId);
    if (metrics) {
      metrics.endTime = new Date();
      metrics.duration = duration;
      metrics.status = session.status;
      metrics.collectedData = session.collectedData;
    }
  }

  /**
   * Get analytics for time range
   */
  getAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h', industry?: string): IVRAnalytics {
    const cutoffTime = this.getCutoffTime(timeRange);
    const calls = Array.from(this.callMetrics.values())
      .filter(m => {
        const matchesTime = m.startTime >= cutoffTime;
        const matchesIndustry = !industry || m.industry === industry;
        return matchesTime && matchesIndustry;
      });

    const completedCalls = calls.filter(c => c.status === 'completed' || c.status === 'transferred');
    const abandonedCalls = calls.filter(c => c.status === 'failed' || !c.endTime);
    const transferredCalls = calls.filter(c => c.transferred);

    const durations = completedCalls.map(c => c.duration).filter(d => d > 0);
    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    // Calculate containment rate (calls completed without transfer)
    const containedCalls = completedCalls.filter(c => !c.transferred);
    const containmentRate = calls.length > 0
      ? (containedCalls.length / calls.length) * 100
      : 0;

    // Calculate transfer rate
    const transferRate = calls.length > 0
      ? (transferredCalls.length / calls.length) * 100
      : 0;

    // Industry breakdown
    const industryBreakdown: Record<string, number> = {};
    calls.forEach(call => {
      industryBreakdown[call.industry] = (industryBreakdown[call.industry] || 0) + 1;
    });

    // Step drop-off analysis
    const stepDropOffs: Record<string, number> = {};
    calls.forEach(call => {
      const lastStep = call.finalStep || call.stepsCompleted[call.stepsCompleted.length - 1];
      if (lastStep) {
        stepDropOffs[lastStep] = (stepDropOffs[lastStep] || 0) + 1;
      }
    });

    // Top options selected
    const optionCounts: Record<string, number> = {};
    calls.forEach(call => {
      Object.values(call.collectedData).forEach(value => {
        if (typeof value === 'string') {
          optionCounts[value] = (optionCounts[value] || 0) + 1;
        }
      });
    });

    const topOptions = Object.entries(optionCounts)
      .map(([option, count]) => ({ option, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Time of day breakdown
    const timeOfDayBreakdown: Record<string, number> = {};
    calls.forEach(call => {
      const hour = call.startTime.getHours();
      const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      timeOfDayBreakdown[period] = (timeOfDayBreakdown[period] || 0) + 1;
    });

    return {
      totalCalls: calls.length,
      completedCalls: completedCalls.length,
      abandonedCalls: abandonedCalls.length,
      averageCallDuration: Math.round(averageDuration),
      averageWaitTime: 0, // Would calculate from queue data
      containmentRate: Math.round(containmentRate * 100) / 100,
      transferRate: Math.round(transferRate * 100) / 100,
      industryBreakdown,
      stepDropOffs,
      topOptions,
      timeOfDayBreakdown
    };
  }

  /**
   * Get call metrics by session ID
   */
  getCallMetrics(sessionId: string): CallMetrics | undefined {
    return this.callMetrics.get(sessionId);
  }

  /**
   * Get recent calls
   */
  getRecentCalls(limit: number = 50, industry?: string): CallMetrics[] {
    const calls = Array.from(this.callMetrics.values())
      .filter(m => !industry || m.industry === industry)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);

    return calls;
  }

  /**
   * Export analytics data
   */
  exportAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h', industry?: string): string {
    const analytics = this.getAnalytics(timeRange, industry);
    
    // Generate CSV format
    const lines = [
      'Metric,Value',
      `Total Calls,${analytics.totalCalls}`,
      `Completed Calls,${analytics.completedCalls}`,
      `Abandoned Calls,${analytics.abandonedCalls}`,
      `Average Call Duration (seconds),${analytics.averageCallDuration}`,
      `Containment Rate (%),${analytics.containmentRate}`,
      `Transfer Rate (%),${analytics.transferRate}`,
      '',
      'Industry Breakdown',
      ...Object.entries(analytics.industryBreakdown).map(([industry, count]) => `${industry},${count}`),
      '',
      'Top Options Selected',
      ...analytics.topOptions.map(opt => `${opt.option},${opt.count}`)
    ];

    return lines.join('\n');
  }

  /**
   * Get cutoff time for time range
   */
  private getCutoffTime(timeRange: '1h' | '24h' | '7d' | '30d'): Date {
    const now = new Date();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    return new Date(now.getTime() - ranges[timeRange]);
  }
}

export const ivrAnalyticsService = new IVRAnalyticsService();

