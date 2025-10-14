// Dashboard Service - Data fetching and management for client dashboards
// MVP implementation with mock data and API integration

export interface UniversalMetrics {
  activeUsers: number;
  totalRevenue: number;
  systemUptime: number;
  recentActivity: Activity[];
  notifications: Notification[];
}

export interface Activity {
  type: string;
  user: string;
  time: string;
  details?: string;
}

export interface Notification {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface FleetMetrics {
  active: number;
  maintenance: number;
  offline: number;
  driverScore: number;
  topDrivers: number;
  mpg: number;
  savings: number;
  alerts: FleetAlert[];
}

export interface FleetAlert {
  type: 'maintenance' | 'violation' | 'fuel' | 'safety' | 'compliance';
  message: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  vehicleId?: string;
  driverId?: string;
}

export interface HealthcareMetrics {
  patients: number;
  new: number;
  appointments: number;
  revenue: number;
  claims: number;
  satisfaction: number;
  readmission: number;
  alerts: HealthcareAlert[];
}

export interface HealthcareAlert {
  type: 'appointment' | 'prescription' | 'lab_result' | 'insurance' | 'compliance';
  message: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  patientId?: string;
  providerId?: string;
}

export interface LegalMetrics {
  cases: number;
  closed: number;
  deadlines: number;
  hours: number;
  revenue: number;
  invoices: number;
  rating: number;
  feedback: number;
  alerts: LegalAlert[];
}

export interface LegalAlert {
  type: 'deadline' | 'billing' | 'client' | 'court' | 'compliance';
  message: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  caseId?: string;
  clientId?: string;
}

export type IndustryType = 'fleet' | 'healthcare' | 'legal';
export type UserRole = 'fleet_manager' | 'healthcare_provider' | 'attorney';

class DashboardService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.TETRIX_API_URL || 'https://api.tetrixcorp.com';
    this.apiKey = process.env.TETRIX_API_KEY || '';
  }

  // Universal metrics for all industries
  async getUniversalMetrics(): Promise<UniversalMetrics> {
    try {
      // In production, this would call the actual API
      // For MVP, we'll use mock data
      return this.getMockUniversalMetrics();
    } catch (error) {
      console.error('Failed to fetch universal metrics:', error);
      return this.getMockUniversalMetrics();
    }
  }

  // Industry-specific metrics
  async getIndustryMetrics(industry: IndustryType, userRole: UserRole): Promise<any> {
    try {
      switch (industry) {
        case 'fleet':
          return await this.getFleetMetrics(userRole);
        case 'healthcare':
          return await this.getHealthcareMetrics(userRole);
        case 'legal':
          return await this.getLegalMetrics(userRole);
        default:
          throw new Error(`Unknown industry: ${industry}`);
      }
    } catch (error) {
      console.error(`Failed to fetch ${industry} metrics:`, error);
      return this.getMockIndustryMetrics(industry);
    }
  }

  // Fleet-specific data
  private async getFleetMetrics(userRole: UserRole): Promise<FleetMetrics> {
    // In production, this would call fleet-specific APIs
    // For MVP, we'll use mock data
    return this.getMockFleetMetrics();
  }

  // Healthcare-specific data
  private async getHealthcareMetrics(userRole: UserRole): Promise<HealthcareMetrics> {
    // In production, this would call healthcare-specific APIs
    // For MVP, we'll use mock data
    return this.getMockHealthcareMetrics();
  }

  // Legal-specific data
  private async getLegalMetrics(userRole: UserRole): Promise<LegalMetrics> {
    // In production, this would call legal-specific APIs
    // For MVP, we'll use mock data
    return this.getMockLegalMetrics();
  }

  // Mock data generators
  private getMockUniversalMetrics(): UniversalMetrics {
    return {
      activeUsers: 1247,
      totalRevenue: 125430,
      systemUptime: 99.9,
      recentActivity: [
        { type: 'login', user: 'John Doe', time: '2 minutes ago' },
        { type: 'data_export', user: 'Jane Smith', time: '5 minutes ago' },
        { type: 'alert', user: 'System', time: '10 minutes ago' },
        { type: 'update', user: 'Mike Johnson', time: '15 minutes ago' }
      ],
      notifications: [
        { type: 'info', message: 'System maintenance scheduled for tonight', time: '1 hour ago', priority: 'low' },
        { type: 'warning', message: 'High data usage detected', time: '2 hours ago', priority: 'medium' },
        { type: 'success', message: 'Backup completed successfully', time: '3 hours ago', priority: 'low' }
      ]
    };
  }

  private getMockFleetMetrics(): FleetMetrics {
    return {
      active: 24,
      maintenance: 3,
      offline: 1,
      driverScore: 8.7,
      topDrivers: 5,
      mpg: 12.4,
      savings: 2340,
      alerts: [
        { 
          type: 'maintenance', 
          message: 'Vehicle #123 needs oil change', 
          time: '2 hours ago', 
          priority: 'medium',
          vehicleId: 'VH-123'
        },
        { 
          type: 'violation', 
          message: 'Driver exceeded speed limit on Route 66', 
          time: '4 hours ago', 
          priority: 'high',
          driverId: 'DRV-456'
        },
        { 
          type: 'fuel', 
          message: 'Low fuel alert for Vehicle #789', 
          time: '6 hours ago', 
          priority: 'low',
          vehicleId: 'VH-789'
        },
        { 
          type: 'safety', 
          message: 'Hard braking detected on Vehicle #456', 
          time: '8 hours ago', 
          priority: 'medium',
          vehicleId: 'VH-456'
        }
      ]
    };
  }

  private getMockHealthcareMetrics(): HealthcareMetrics {
    return {
      patients: 1247,
      new: 89,
      appointments: 23,
      revenue: 45230,
      claims: 156,
      satisfaction: 4.8,
      readmission: 3.2,
      alerts: [
        { 
          type: 'appointment', 
          message: 'Patient John Smith missed appointment', 
          time: '1 hour ago', 
          priority: 'medium',
          patientId: 'PAT-123'
        },
        { 
          type: 'lab_result', 
          message: 'Critical lab results available for review', 
          time: '3 hours ago', 
          priority: 'high',
          patientId: 'PAT-456'
        },
        { 
          type: 'prescription', 
          message: 'Prescription refill needed for Patient #789', 
          time: '5 hours ago', 
          priority: 'low',
          patientId: 'PAT-789'
        },
        { 
          type: 'insurance', 
          message: 'Insurance claim rejected for Patient #321', 
          time: '7 hours ago', 
          priority: 'medium',
          patientId: 'PAT-321'
        }
      ]
    };
  }

  private getMockLegalMetrics(): LegalMetrics {
    return {
      cases: 47,
      closed: 12,
      deadlines: 8,
      hours: 142,
      revenue: 28400,
      invoices: 12500,
      rating: 4.9,
      feedback: 15,
      alerts: [
        { 
          type: 'deadline', 
          message: 'Court filing deadline approaching for Case #2024-001', 
          time: '2 hours ago', 
          priority: 'high',
          caseId: 'CASE-001'
        },
        { 
          type: 'billing', 
          message: 'Invoice #INV-456 overdue by 30 days', 
          time: '4 hours ago', 
          priority: 'medium',
          clientId: 'CLI-456'
        },
        { 
          type: 'client', 
          message: 'New client inquiry received', 
          time: '6 hours ago', 
          priority: 'low',
          clientId: 'CLI-789'
        },
        { 
          type: 'court', 
          message: 'Court hearing scheduled for next week', 
          time: '8 hours ago', 
          priority: 'medium',
          caseId: 'CASE-002'
        }
      ]
    };
  }

  private getMockIndustryMetrics(industry: IndustryType): any {
    switch (industry) {
      case 'fleet':
        return this.getMockFleetMetrics();
      case 'healthcare':
        return this.getMockHealthcareMetrics();
      case 'legal':
        return this.getMockLegalMetrics();
      default:
        return {};
    }
  }

  // Real-time data updates
  async subscribeToRealTimeUpdates(industry: IndustryType, callback: (data: any) => void): Promise<void> {
    // In production, this would set up WebSocket connections
    // For MVP, we'll use polling
    setInterval(async () => {
      try {
        const data = await this.getIndustryMetrics(industry, 'fleet_manager'); // Default role for MVP
        callback(data);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  // Data export functionality
  async exportDashboardData(industry: IndustryType, format: 'csv' | 'pdf' | 'excel'): Promise<Blob> {
    try {
      const data = await this.getIndustryMetrics(industry, 'fleet_manager');
      
      // In production, this would generate actual export files
      // For MVP, we'll return a simple JSON blob
      const jsonData = JSON.stringify(data, null, 2);
      return new Blob([jsonData], { type: 'application/json' });
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // User role detection
  detectUserRole(): UserRole {
    // In production, this would come from authentication context
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || localStorage.getItem('userRole') || 'fleet_manager';
    
    const validRoles: UserRole[] = ['fleet_manager', 'healthcare_provider', 'attorney'];
    return validRoles.includes(role as UserRole) ? role as UserRole : 'fleet_manager';
  }

  // Industry mapping
  getIndustryFromRole(role: UserRole): IndustryType {
    const roleMap: Record<UserRole, IndustryType> = {
      'fleet_manager': 'fleet',
      'healthcare_provider': 'healthcare',
      'attorney': 'legal'
    };
    return roleMap[role] || 'fleet';
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
