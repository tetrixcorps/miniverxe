// Unit tests for Dashboard Routing Service
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'https://tetrixcorp.com',
  pathname: '/dashboards/healthcare',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock URL constructor
global.URL = class MockURL {
  public searchParams: URLSearchParams;
  public href: string;
  
  constructor(url: string, base?: string) {
    this.href = base ? `${base}${url}` : url;
    this.searchParams = new URLSearchParams();
  }
  
  toString() {
    return this.href + (this.searchParams.toString() ? '?' + this.searchParams.toString() : '');
  }
} as any;

// Import the service after mocking
import { DashboardRoutingService } from '../dashboardRoutingService';

describe('DashboardRoutingService', () => {
  let service: DashboardRoutingService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockLocation.href = '';
    
    // Create new service instance
    service = new DashboardRoutingService();
  });

  describe('Authentication Management', () => {
    it('should initialize with no auth data when localStorage is empty', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getAuthData()).toBeNull();
    });

    it('should load auth data from localStorage on initialization', () => {
      const mockAuthData = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      const newService = new DashboardRoutingService();
      
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getAuthData()).toEqual(mockAuthData);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const newService = new DashboardRoutingService();
      
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.getAuthData()).toBeNull();
    });

    it('should refresh auth data from localStorage', () => {
      const mockAuthData = {
        industry: 'construction',
        role: 'project_manager',
        organization: 'Test Construction',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();
      
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getAuthData()).toEqual(mockAuthData);
    });

    it('should logout and clear auth data', () => {
      // Set up authenticated state
      const mockAuthData = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();

      // Logout
      service.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tetrixAuth');
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getAuthData()).toBeNull();
    });
  });

  describe('Dashboard Routing', () => {
    beforeEach(() => {
      const mockAuthData = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();
    });

    it('should get correct dashboard route for healthcare industry', () => {
      const route = service.getDashboardRoute();
      
      expect(route).not.toBeNull();
      expect(route?.industry).toBe('healthcare');
      expect(route?.path).toBe('/dashboards/healthcare');
      expect(route?.title).toBe('Healthcare Dashboard');
      expect(route?.features).toContain('Patient Management');
    });

    it('should return null for unknown industry', () => {
      const mockAuthData = {
        industry: 'unknown',
        role: 'test',
        organization: 'Test',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();

      const route = service.getDashboardRoute();
      expect(route).toBeNull();
    });

    it('should validate access correctly', () => {
      expect(service.validateAccess('healthcare', 'doctor')).toBe(true);
      expect(service.validateAccess('healthcare', 'nurse')).toBe(true);
      expect(service.validateAccess('construction', 'doctor')).toBe(false);
      expect(service.validateAccess('healthcare', 'unknown_role')).toBe(false);
    });

    it('should redirect to appropriate dashboard', () => {
      service.redirectToDashboard();
      
      expect(mockLocation.href).toBe('https://tetrixcorp.com/dashboards/healthcare?token=test-token&role=doctor&org=Test+Hospital');
    });
  });

  describe('Role-Based Permissions', () => {
    it('should return correct permissions for healthcare roles', () => {
      const doctorPermissions = service.getRolePermissions('doctor');
      const nursePermissions = service.getRolePermissions('nurse');
      const adminPermissions = service.getRolePermissions('admin');

      expect(doctorPermissions).toContain('view_patients');
      expect(doctorPermissions).toContain('emergency_access');
      expect(nursePermissions).toContain('view_patients');
      expect(nursePermissions).not.toContain('emergency_access');
      expect(adminPermissions).toContain('manage_users');
      expect(adminPermissions).toContain('view_all_data');
    });

    it('should return correct permissions for construction roles', () => {
      const pmPermissions = service.getRolePermissions('project_manager');
      const supervisorPermissions = service.getRolePermissions('site_supervisor');
      const safetyPermissions = service.getRolePermissions('safety_officer');

      expect(pmPermissions).toContain('manage_projects');
      expect(pmPermissions).toContain('budget_management');
      expect(supervisorPermissions).toContain('manage_site');
      expect(supervisorPermissions).toContain('progress_tracking');
      expect(safetyPermissions).toContain('safety_monitoring');
      expect(safetyPermissions).toContain('compliance_tracking');
    });

    it('should return correct permissions for logistics roles', () => {
      const fleetManagerPermissions = service.getRolePermissions('fleet_manager');
      const dispatcherPermissions = service.getRolePermissions('dispatcher');
      const driverPermissions = service.getRolePermissions('driver');

      expect(fleetManagerPermissions).toContain('manage_fleet');
      expect(fleetManagerPermissions).toContain('route_optimization');
      expect(dispatcherPermissions).toContain('manage_routes');
      expect(dispatcherPermissions).toContain('delivery_tracking');
      expect(driverPermissions).toContain('view_assignments');
      expect(driverPermissions).toContain('delivery_confirmation');
    });

    it('should return default permissions for unknown roles', () => {
      const unknownPermissions = service.getRolePermissions('unknown_role');
      
      expect(unknownPermissions).toEqual(['view_data', 'basic_operations']);
    });

    it('should check specific permissions correctly', () => {
      const mockAuthData = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();

      expect(service.hasPermission('view_patients')).toBe(true);
      expect(service.hasPermission('emergency_access')).toBe(true);
      expect(service.hasPermission('manage_users')).toBe(false);
    });
  });

  describe('Industry-Specific Data', () => {
    it('should return correct integrations for healthcare', () => {
      const integrations = service.getIndustryIntegrations('healthcare');
      
      expect(integrations).toContain('Epic MyChart');
      expect(integrations).toContain('Cerner PowerChart');
      expect(integrations).toContain('Allscripts');
    });

    it('should return correct integrations for construction', () => {
      const integrations = service.getIndustryIntegrations('construction');
      
      expect(integrations).toContain('Procore');
      expect(integrations).toContain('Autodesk');
      expect(integrations).toContain('Safety Management');
    });

    it('should return correct integrations for logistics', () => {
      const integrations = service.getIndustryIntegrations('logistics');
      
      expect(integrations).toContain('Fleet Management');
      expect(integrations).toContain('GPS Tracking');
      expect(integrations).toContain('Route Optimization');
    });

    it('should return correct metrics for healthcare', () => {
      const metrics = service.getIndustryMetrics('healthcare');
      
      expect(metrics).toContain('patient_count');
      expect(metrics).toContain('appointments');
      expect(metrics).toContain('emergency_cases');
      expect(metrics).toContain('satisfaction_score');
    });

    it('should return correct metrics for construction', () => {
      const metrics = service.getIndustryMetrics('construction');
      
      expect(metrics).toContain('active_projects');
      expect(metrics).toContain('safety_alerts');
      expect(metrics).toContain('worker_count');
      expect(metrics).toContain('budget_utilization');
    });

    it('should return correct metrics for logistics', () => {
      const metrics = service.getIndustryMetrics('logistics');
      
      expect(metrics).toContain('vehicle_count');
      expect(metrics).toContain('deliveries');
      expect(metrics).toContain('delivery_time');
      expect(metrics).toContain('fuel_efficiency');
    });
  });

  describe('Dashboard Configuration', () => {
    beforeEach(() => {
      const mockAuthData = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();
    });

    it('should return complete dashboard configuration', () => {
      const config = service.getDashboardConfig();
      
      expect(config).not.toBeNull();
      expect(config?.industry).toBe('healthcare');
      expect(config?.role).toBe('doctor');
      expect(config?.organization).toBe('Test Hospital');
      expect(config?.permissions).toContain('view_patients');
      expect(config?.features).toContain('Patient Management');
      expect(config?.integrations).toContain('Epic MyChart');
      expect(config?.metrics).toContain('patient_count');
    });

    it('should return null when not authenticated', () => {
      // Mock localStorage to return null
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      // Create a new service instance without auth data
      const newService = new DashboardRoutingService();
      
      const config = newService.getDashboardConfig();
      expect(config).toBeNull();
    });
  });

  describe('User Information', () => {
    it('should return user info when authenticated', () => {
      const mockAuthData = {
        industry: 'construction',
        role: 'project_manager',
        organization: 'Test Construction',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();

      const userInfo = service.getUserInfo();
      
      expect(userInfo).toEqual({
        role: 'project_manager',
        organization: 'Test Construction',
        industry: 'construction'
      });
    });

    it('should return null when not authenticated', () => {
      const userInfo = service.getUserInfo();
      expect(userInfo).toBeNull();
    });
  });

  describe('Available Dashboards', () => {
    it('should return empty array when not authenticated', () => {
      const dashboards = service.getAvailableDashboards();
      expect(dashboards).toEqual([]);
    });

    it('should return user dashboard when authenticated', () => {
      const mockAuthData = {
        industry: 'logistics',
        role: 'fleet_manager',
        organization: 'Test Logistics',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();

      const dashboards = service.getAvailableDashboards();
      
      expect(dashboards).toHaveLength(1);
      expect(dashboards[0].industry).toBe('logistics');
      expect(dashboards[0].path).toBe('/dashboards/logistics');
    });
  });

  describe('Dashboard Data', () => {
    it('should return null when not authenticated', async () => {
      const data = await service.getDashboardData();
      expect(data).toBeNull();
    });

    it('should return mock data when authenticated', async () => {
      const mockAuthData = {
        industry: 'healthcare',
        role: 'doctor',
        organization: 'Test Hospital',
        phoneNumber: '+1234567890',
        verificationId: 'test-verification-id',
        authToken: 'test-token',
        authMethod: '2fa' as const,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
      service.refreshAuthData();

      const data = await service.getDashboardData();
      
      expect(data).not.toBeNull();
      expect(data?.industry).toBeDefined();
      expect(data?.universal).toBeDefined();
      expect(data?.products).toBeDefined();
      expect(data?.config).toBeDefined();
    });
  });
});
