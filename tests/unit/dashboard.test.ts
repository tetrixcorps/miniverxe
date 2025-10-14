import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { dashboardService } from '../../src/services/dashboardService';
import type { 
  UniversalMetrics, 
  FleetMetrics, 
  HealthcareMetrics, 
  LegalMetrics,
  IndustryType,
  UserRole 
} from '../../src/services/dashboardService';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Universal Metrics', () => {
    it('should fetch universal metrics successfully', async () => {
      const result = await dashboardService.getUniversalMetrics();
      
      expect(result).toBeDefined();
      expect(result.activeUsers).toBe(1247);
      expect(result.totalRevenue).toBe(125430);
      expect(result.systemUptime).toBe(99.9);
      expect(result.recentActivity).toHaveLength(4);
      expect(result.notifications).toHaveLength(3);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('API Error'));

      const result = await dashboardService.getUniversalMetrics();
      
      // Should return mock data on error
      expect(result).toBeDefined();
      expect(result.activeUsers).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
    });
  });

  describe('Industry-Specific Metrics', () => {
    it('should fetch fleet metrics correctly', async () => {
      const result = await dashboardService.getIndustryMetrics('fleet', 'fleet_manager');
      
      expect(result).toBeDefined();
      expect(result.active).toBe(24);
      expect(result.driverScore).toBe(8.7);
      expect(result.alerts).toHaveLength(4);
      expect(result.alerts[0].type).toBe('maintenance');
    });

    it('should fetch healthcare metrics correctly', async () => {
      const result = await dashboardService.getIndustryMetrics('healthcare', 'healthcare_provider');
      
      expect(result).toBeDefined();
      expect(result.patients).toBeDefined();
      expect(result.appointments).toBeDefined();
      expect(result.satisfaction).toBeDefined();
      expect(result.alerts).toBeDefined();
    });

    it('should fetch legal metrics correctly', async () => {
      const result = await dashboardService.getIndustryMetrics('legal', 'attorney');
      
      expect(result).toBeDefined();
      expect(result.cases).toBeDefined();
      expect(result.deadlines).toBeDefined();
      expect(result.revenue).toBeDefined();
      expect(result.alerts).toBeDefined();
    });

    it('should handle unknown industry gracefully', async () => {
      const result = await dashboardService.getIndustryMetrics('unknown' as IndustryType, 'fleet_manager');
      
      expect(result).toEqual({});
    });
  });

  describe('User Role Detection', () => {
    it('should detect fleet manager role', () => {
      // Mock window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          search: '?role=fleet_manager'
        },
        writable: true
      });

      const role = dashboardService.detectUserRole();
      expect(role).toBe('fleet_manager');
    });

    it('should detect healthcare provider role', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?role=healthcare_provider'
        },
        writable: true
      });

      const role = dashboardService.detectUserRole();
      expect(role).toBe('healthcare_provider');
    });

    it('should detect attorney role', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?role=attorney'
        },
        writable: true
      });

      const role = dashboardService.detectUserRole();
      expect(role).toBe('attorney');
    });

    it('should default to fleet_manager for invalid roles', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?role=invalid_role'
        },
        writable: true
      });

      const role = dashboardService.detectUserRole();
      expect(role).toBe('fleet_manager');
    });
  });

  describe('Industry Mapping', () => {
    it('should map fleet_manager to fleet industry', () => {
      const industry = dashboardService.getIndustryFromRole('fleet_manager');
      expect(industry).toBe('fleet');
    });

    it('should map healthcare_provider to healthcare industry', () => {
      const industry = dashboardService.getIndustryFromRole('healthcare_provider');
      expect(industry).toBe('healthcare');
    });

    it('should map attorney to legal industry', () => {
      const industry = dashboardService.getIndustryFromRole('attorney');
      expect(industry).toBe('legal');
    });

    it('should default to fleet for unknown roles', () => {
      const industry = dashboardService.getIndustryFromRole('unknown' as UserRole);
      expect(industry).toBe('fleet');
    });
  });

  describe('Data Export', () => {
    it('should export dashboard data as JSON', async () => {
      const blob = await dashboardService.exportDashboardData('fleet', 'json');
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
      
      // Test that the blob contains data
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle export errors gracefully', async () => {
      // Mock an error in getIndustryMetrics
      vi.spyOn(dashboardService, 'getIndustryMetrics').mockRejectedValueOnce(new Error('Export error'));

      await expect(dashboardService.exportDashboardData('fleet', 'json')).rejects.toThrow('Export error');
    });
  });

  describe('Real-time Updates', () => {
    it('should set up real-time updates subscription', async () => {
      const callback = vi.fn();
      const setInterval = vi.spyOn(global, 'setInterval');
      const clearInterval = vi.spyOn(global, 'clearInterval');
      
      await dashboardService.subscribeToRealTimeUpdates('fleet', callback);
      
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
      
      // Clean up
      setInterval.mockRestore();
      clearInterval.mockRestore();
    });
  });
});
