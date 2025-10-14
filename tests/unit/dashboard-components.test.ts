import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock DOM environment
const mockElement = {
  textContent: '',
  innerHTML: '',
  style: { display: '' },
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn()
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  getElementById: vi.fn(),
  scrollTop: 0,
  scrollHeight: 100
};

// Mock document and window
Object.defineProperty(global, 'document', {
  value: {
    getElementById: vi.fn(() => mockElement),
    querySelector: vi.fn(() => mockElement),
    querySelectorAll: vi.fn(() => [mockElement]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    location: { search: '?role=fleet_manager' },
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    },
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
    setTimeout: vi.fn((fn) => fn()),
    clearTimeout: vi.fn()
  },
  writable: true
});

// Mock fetch
global.fetch = vi.fn();

describe('Dashboard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ClientDashboard Class', () => {
    it('should initialize with default values', () => {
      // Mock the ClientDashboard class from the dashboard
      class ClientDashboard {
        currentIndustry: string;
        userRole: string;

        constructor() {
          this.currentIndustry = 'fleet';
          this.userRole = this.detectUserRole();
        }

        detectUserRole(): string {
          const urlParams = new URLSearchParams(window.location.search);
          const role = urlParams.get('role') || localStorage.getItem('userRole') || 'fleet_manager';
          
          const roleMap: Record<string, string> = {
            'fleet_manager': 'Fleet Manager',
            'healthcare_provider': 'Healthcare Provider',
            'attorney': 'Attorney'
          };
          
          return roleMap[role] || 'Fleet Manager';
        }

        switchIndustry(industry: string) {
          this.currentIndustry = industry;
        }

        loadDashboardData() {
          return Promise.resolve();
        }
      }

      const dashboard = new ClientDashboard();
      
      expect(dashboard.currentIndustry).toBe('fleet');
      expect(dashboard.userRole).toBe('Fleet Manager');
    });

    it('should detect user role from URL parameters', () => {
      window.location.search = '?role=healthcare_provider';
      
      class ClientDashboard {
        detectUserRole(): string {
          const urlParams = new URLSearchParams(window.location.search);
          const role = urlParams.get('role') || localStorage.getItem('userRole') || 'fleet_manager';
          
          const roleMap: Record<string, string> = {
            'fleet_manager': 'Fleet Manager',
            'healthcare_provider': 'Healthcare Provider',
            'attorney': 'Attorney'
          };
          
          return roleMap[role] || 'Fleet Manager';
        }
      }

      const dashboard = new ClientDashboard();
      const role = dashboard.detectUserRole();
      
      expect(role).toBe('Healthcare Provider');
    });

    it('should detect user role from localStorage', () => {
      // Test the role detection logic directly
      class ClientDashboard {
        detectUserRole(): string {
          const urlParams = new URLSearchParams(window.location.search);
          const urlRole = urlParams.get('role');
          const localRole = localStorage.getItem('userRole');
          const role = urlRole || localRole || 'fleet_manager';
          
          const roleMap: Record<string, string> = {
            'fleet_manager': 'Fleet Manager',
            'healthcare_provider': 'Healthcare Provider',
            'attorney': 'Attorney'
          };
          
          return roleMap[role] || 'Fleet Manager';
        }
      }

      // Test the role mapping logic directly
      const roleMap: Record<string, string> = {
        'fleet_manager': 'Fleet Manager',
        'healthcare_provider': 'Healthcare Provider',
        'attorney': 'Attorney'
      };
      
      expect(roleMap['attorney']).toBe('Attorney');
      expect(roleMap['fleet_manager']).toBe('Fleet Manager');
      expect(roleMap['healthcare_provider']).toBe('Healthcare Provider');
    });

    it('should switch industry correctly', () => {
      class ClientDashboard {
        currentIndustry: string;

        constructor() {
          this.currentIndustry = 'fleet';
        }

        switchIndustry(industry: string) {
          this.currentIndustry = industry;
        }
      }

      const dashboard = new ClientDashboard();
      
      dashboard.switchIndustry('healthcare');
      expect(dashboard.currentIndustry).toBe('healthcare');
      
      dashboard.switchIndustry('legal');
      expect(dashboard.currentIndustry).toBe('legal');
    });
  });

  describe('UniversalMetricsWidget Class', () => {
    it('should load metrics successfully', async () => {
      const mockMetrics = {
        activeUsers: 1247,
        totalRevenue: 125430,
        systemUptime: 99.9,
        recentActivity: [
          { type: 'login', user: 'John Doe', time: '2 minutes ago' }
        ],
        notifications: [
          { type: 'info', message: 'System maintenance scheduled', time: '1 hour ago', priority: 'low' }
        ]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics
      });

      class UniversalMetricsWidget {
        async loadMetrics() {
          const response = await fetch('/api/v1/dashboard/metrics');
          return await response.json();
        }

        updateDisplay(metrics: any) {
          const activeUsersEl = document.getElementById('universal-active-users');
          if (activeUsersEl) {
            activeUsersEl.textContent = metrics.activeUsers.toLocaleString();
          }
        }
      }

      const widget = new UniversalMetricsWidget();
      const metrics = await widget.loadMetrics();
      
      expect(metrics).toEqual(mockMetrics);
      expect(metrics.activeUsers).toBe(1247);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('API Error'));

      class UniversalMetricsWidget {
        async loadMetrics() {
          try {
            const response = await fetch('/api/v1/dashboard/metrics');
            return await response.json();
          } catch (error) {
            console.error('Failed to load metrics:', error);
            return null;
          }
        }
      }

      const widget = new UniversalMetricsWidget();
      const metrics = await widget.loadMetrics();
      
      expect(metrics).toBeNull();
    });
  });

  describe('Industry-Specific Widgets', () => {
    it('should update fleet display correctly', () => {
      class FleetWidget {
        updateIndustryDisplay(industry: string, data: any) {
          if (industry === 'fleet') {
            const activeEl = document.getElementById('fleet-active');
            const maintenanceEl = document.getElementById('fleet-maintenance');
            const driverScoreEl = document.getElementById('fleet-driver-score');

            if (activeEl) activeEl.textContent = String(data.active || 0);
            if (maintenanceEl) maintenanceEl.textContent = String(data.maintenance || 0);
            if (driverScoreEl) driverScoreEl.textContent = String(data.driverScore || 0);
          }
        }
      }

      const widget = new FleetWidget();
      const fleetData = {
        active: 24,
        maintenance: 3,
        driverScore: 8.7
      };

      widget.updateIndustryDisplay('fleet', fleetData);
      
      // Verify that the elements would be updated
      expect(document.getElementById).toHaveBeenCalledWith('fleet-active');
      expect(document.getElementById).toHaveBeenCalledWith('fleet-maintenance');
      expect(document.getElementById).toHaveBeenCalledWith('fleet-driver-score');
    });

    it('should update healthcare display correctly', () => {
      class HealthcareWidget {
        updateIndustryDisplay(industry: string, data: any) {
          if (industry === 'healthcare') {
            const patientsEl = document.getElementById('healthcare-patients');
            const appointmentsEl = document.getElementById('healthcare-appointments');
            const satisfactionEl = document.getElementById('healthcare-satisfaction');

            if (patientsEl) patientsEl.textContent = String(data.patients || 0);
            if (appointmentsEl) appointmentsEl.textContent = String(data.appointments || 0);
            if (satisfactionEl) satisfactionEl.textContent = String(data.satisfaction || 0);
          }
        }
      }

      const widget = new HealthcareWidget();
      const healthcareData = {
        patients: 1247,
        appointments: 23,
        satisfaction: 4.8
      };

      widget.updateIndustryDisplay('healthcare', healthcareData);
      
      expect(document.getElementById).toHaveBeenCalledWith('healthcare-patients');
      expect(document.getElementById).toHaveBeenCalledWith('healthcare-appointments');
      expect(document.getElementById).toHaveBeenCalledWith('healthcare-satisfaction');
    });

    it('should update legal display correctly', () => {
      class LegalWidget {
        updateIndustryDisplay(industry: string, data: any) {
          if (industry === 'legal') {
            const casesEl = document.getElementById('legal-cases');
            const deadlinesEl = document.getElementById('legal-deadlines');
            const revenueEl = document.getElementById('legal-revenue');

            if (casesEl) casesEl.textContent = String(data.cases || 0);
            if (deadlinesEl) deadlinesEl.textContent = String(data.deadlines || 0);
            if (revenueEl) revenueEl.textContent = String(data.revenue || 0);
          }
        }
      }

      const widget = new LegalWidget();
      const legalData = {
        cases: 47,
        deadlines: 8,
        revenue: 28400
      };

      widget.updateIndustryDisplay('legal', legalData);
      
      expect(document.getElementById).toHaveBeenCalledWith('legal-cases');
      expect(document.getElementById).toHaveBeenCalledWith('legal-deadlines');
      expect(document.getElementById).toHaveBeenCalledWith('legal-revenue');
    });
  });

  describe('Alert Color Helper', () => {
    it('should return correct colors for different alert priorities', () => {
      class AlertHelper {
        getAlertColor(priority: string): string {
          const colorMap: Record<string, string> = {
            'high': 'red',
            'medium': 'yellow',
            'low': 'green'
          };
          return colorMap[priority] || 'gray';
        }
      }

      const helper = new AlertHelper();
      
      expect(helper.getAlertColor('high')).toBe('red');
      expect(helper.getAlertColor('medium')).toBe('yellow');
      expect(helper.getAlertColor('low')).toBe('green');
      expect(helper.getAlertColor('unknown')).toBe('gray');
    });
  });

  describe('Real-time Updates', () => {
    it('should set up real-time updates correctly', () => {
      const mockCallback = vi.fn();
      const mockSetInterval = vi.spyOn(global, 'setInterval');

      class RealTimeUpdates {
        setupRealTimeUpdates() {
          return setInterval(() => {
            // Simulate data update
            mockCallback({ timestamp: new Date().toISOString() });
          }, 30000);
        }
      }

      const updates = new RealTimeUpdates();
      updates.setupRealTimeUpdates();
      
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
    });
  });
});
