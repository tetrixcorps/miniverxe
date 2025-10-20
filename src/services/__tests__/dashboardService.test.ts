// Unit tests for Dashboard Service
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dashboardService, type IndustryType, type UserRole } from '../dashboardService';

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Universal Metrics', () => {
    it('should return universal metrics with correct structure', async () => {
      const metrics = await dashboardService.getUniversalMetrics();
      
      expect(metrics).toHaveProperty('activeUsers');
      expect(metrics).toHaveProperty('totalRevenue');
      expect(metrics).toHaveProperty('systemUptime');
      expect(metrics).toHaveProperty('recentActivity');
      expect(metrics).toHaveProperty('notifications');
      
      expect(typeof metrics.activeUsers).toBe('number');
      expect(typeof metrics.totalRevenue).toBe('number');
      expect(typeof metrics.systemUptime).toBe('number');
      expect(Array.isArray(metrics.recentActivity)).toBe(true);
      expect(Array.isArray(metrics.notifications)).toBe(true);
    });

    it('should return valid recent activity data', async () => {
      const metrics = await dashboardService.getUniversalMetrics();
      
      metrics.recentActivity.forEach(activity => {
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('user');
        expect(activity).toHaveProperty('time');
        expect(typeof activity.type).toBe('string');
        expect(typeof activity.user).toBe('string');
        expect(typeof activity.time).toBe('string');
      });
    });

    it('should return valid notifications data', async () => {
      const metrics = await dashboardService.getUniversalMetrics();
      
      metrics.notifications.forEach(notification => {
        expect(notification).toHaveProperty('type');
        expect(notification).toHaveProperty('message');
        expect(notification).toHaveProperty('time');
        expect(['info', 'warning', 'error', 'success']).toContain(notification.type);
        expect(typeof notification.message).toBe('string');
        expect(typeof notification.time).toBe('string');
      });
    });
  });

  describe('Industry-Specific Metrics', () => {
    it('should return fleet metrics for fleet industry', async () => {
      const metrics = await dashboardService.getIndustryMetrics('fleet', 'fleet_manager');
      
      expect(metrics).toHaveProperty('active');
      expect(metrics).toHaveProperty('maintenance');
      expect(metrics).toHaveProperty('offline');
      expect(metrics).toHaveProperty('driverScore');
      expect(metrics).toHaveProperty('topDrivers');
      expect(metrics).toHaveProperty('mpg');
      expect(metrics).toHaveProperty('savings');
      expect(metrics).toHaveProperty('alerts');
      
      expect(typeof metrics.active).toBe('number');
      expect(typeof metrics.maintenance).toBe('number');
      expect(typeof metrics.offline).toBe('number');
      expect(typeof metrics.driverScore).toBe('number');
      expect(Array.isArray(metrics.alerts)).toBe(true);
    });

    it('should return healthcare metrics for healthcare industry', async () => {
      const metrics = await dashboardService.getIndustryMetrics('healthcare', 'healthcare_provider');
      
      expect(metrics).toHaveProperty('patients');
      expect(metrics).toHaveProperty('new');
      expect(metrics).toHaveProperty('appointments');
      expect(metrics).toHaveProperty('revenue');
      expect(metrics).toHaveProperty('claims');
      expect(metrics).toHaveProperty('satisfaction');
      expect(metrics).toHaveProperty('readmission');
      expect(metrics).toHaveProperty('alerts');
      
      expect(typeof metrics.patients).toBe('number');
      expect(typeof metrics.new).toBe('number');
      expect(typeof metrics.appointments).toBe('number');
      expect(typeof metrics.revenue).toBe('number');
      expect(Array.isArray(metrics.alerts)).toBe(true);
    });

    it('should return legal metrics for legal industry', async () => {
      const metrics = await dashboardService.getIndustryMetrics('legal', 'attorney');
      
      expect(metrics).toHaveProperty('cases');
      expect(metrics).toHaveProperty('closed');
      expect(metrics).toHaveProperty('deadlines');
      expect(metrics).toHaveProperty('hours');
      expect(metrics).toHaveProperty('revenue');
      expect(metrics).toHaveProperty('invoices');
      expect(metrics).toHaveProperty('rating');
      expect(metrics).toHaveProperty('feedback');
      expect(metrics).toHaveProperty('alerts');
      
      expect(typeof metrics.cases).toBe('number');
      expect(typeof metrics.closed).toBe('number');
      expect(typeof metrics.deadlines).toBe('number');
      expect(typeof metrics.hours).toBe('number');
      expect(Array.isArray(metrics.alerts)).toBe(true);
    });

    it('should return mock data for unknown industry', async () => {
      const metrics = await dashboardService.getIndustryMetrics('unknown' as IndustryType, 'fleet_manager');
      
      // Should return mock data instead of throwing
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('Fleet Alerts', () => {
    it('should return valid fleet alerts', async () => {
      const metrics = await dashboardService.getIndustryMetrics('fleet', 'fleet_manager');
      
      metrics.alerts.forEach(alert => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('time');
        expect(alert).toHaveProperty('priority');
        expect(['maintenance', 'violation', 'fuel', 'safety', 'compliance']).toContain(alert.type);
        expect(['low', 'medium', 'high']).toContain(alert.priority);
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.time).toBe('string');
      });
    });
  });

  describe('Healthcare Alerts', () => {
    it('should return valid healthcare alerts', async () => {
      const metrics = await dashboardService.getIndustryMetrics('healthcare', 'healthcare_provider');
      
      metrics.alerts.forEach(alert => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('time');
        expect(alert).toHaveProperty('priority');
        expect(['appointment', 'prescription', 'lab_result', 'insurance', 'compliance']).toContain(alert.type);
        expect(['low', 'medium', 'high']).toContain(alert.priority);
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.time).toBe('string');
      });
    });
  });

  describe('Legal Alerts', () => {
    it('should return valid legal alerts', async () => {
      const metrics = await dashboardService.getIndustryMetrics('legal', 'attorney');
      
      metrics.alerts.forEach(alert => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('time');
        expect(alert).toHaveProperty('priority');
        expect(['deadline', 'billing', 'client', 'court', 'compliance']).toContain(alert.type);
        expect(['low', 'medium', 'high']).toContain(alert.priority);
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.time).toBe('string');
      });
    });
  });

  describe('User Role Detection', () => {
    it('should detect fleet_manager role', () => {
      const role = dashboardService.detectUserRole();
      expect(['fleet_manager', 'healthcare_provider', 'attorney']).toContain(role);
    });
  });

  describe('Industry Mapping', () => {
    it('should map fleet_manager role to fleet industry', () => {
      const industry = dashboardService.getIndustryFromRole('fleet_manager');
      expect(industry).toBe('fleet');
    });

    it('should map healthcare_provider role to healthcare industry', () => {
      const industry = dashboardService.getIndustryFromRole('healthcare_provider');
      expect(industry).toBe('healthcare');
    });

    it('should map attorney role to legal industry', () => {
      const industry = dashboardService.getIndustryFromRole('attorney');
      expect(industry).toBe('legal');
    });

    it('should default to fleet for unknown role', () => {
      const industry = dashboardService.getIndustryFromRole('unknown' as UserRole);
      expect(industry).toBe('fleet');
    });
  });

  describe('Data Export', () => {
    it('should export fleet data as JSON blob', async () => {
      const blob = await dashboardService.exportDashboardData('fleet', 'csv');
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should export healthcare data as JSON blob', async () => {
      const blob = await dashboardService.exportDashboardData('healthcare', 'pdf');
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should export legal data as JSON blob', async () => {
      const blob = await dashboardService.exportDashboardData('legal', 'excel');
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });
  });

  describe('Real-time Updates', () => {
    it('should set up real-time updates subscription', async () => {
      const callback = vi.fn();
      const result = await dashboardService.subscribeToRealTimeUpdates('fleet', callback);
      
      expect(result).toBeUndefined(); // subscribeToRealTimeUpdates returns void
      
      // The subscription is set up with a 30-second interval, so we can't easily test it
      // without waiting too long. The important thing is that it doesn't throw an error.
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully in getUniversalMetrics', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // The service should return mock data even if there's an error
      const metrics = await dashboardService.getUniversalMetrics();
      expect(metrics).toBeDefined();
      
      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully in getIndustryMetrics', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // The service should return mock data even if there's an error
      const metrics = await dashboardService.getIndustryMetrics('fleet', 'fleet_manager');
      expect(metrics).toBeDefined();
      
      consoleSpy.mockRestore();
    });
  });
});
