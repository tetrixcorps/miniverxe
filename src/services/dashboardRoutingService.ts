// Dashboard Routing Service
// Handles authentication-based routing to industry-specific dashboards

import { dashboardService, type IndustryType, type UserRole } from './dashboardService';
import { dashboardProductService } from './dashboardProductService';
import { HealthcareIntegrationService, type HealthcareConfig } from './healthcareIntegrations';

export interface AuthData {
  industry: string;
  role: string;
  organization: string;
  phoneNumber: string;
  verificationId: string;
  authToken: string;
  authMethod: '2fa';
  timestamp: number;
}

export interface DashboardConfig {
  industry: string;
  role: string;
  organization: string;
  permissions: string[];
  features: string[];
  integrations: string[];
  metrics: string[];
}

export interface DashboardRoute {
  path: string;
  industry: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requiredRole?: string[];
  features: string[];
}

// Industry dashboard configurations
export const DASHBOARD_ROUTES: Record<string, DashboardRoute> = {
  healthcare: {
    path: '/dashboards/healthcare',
    industry: 'healthcare',
    title: 'Healthcare Dashboard',
    description: 'Patient management, appointment scheduling, and emergency triage',
    icon: '🏥',
    color: 'green',
    requiredRole: ['doctor', 'nurse', 'admin', 'specialist'],
    features: [
      'Patient Management',
      'Appointment Scheduling',
      'Emergency Triage',
      'EHR Integration',
      'HIPAA Compliance',
      'Patient Communication'
    ]
  },
  construction: {
    path: '/dashboards/construction',
    industry: 'construction',
    title: 'Construction Dashboard',
    description: 'Project management, safety monitoring, and resource allocation',
    icon: '🏗️',
    color: 'orange',
    requiredRole: ['project_manager', 'site_supervisor', 'safety_officer', 'foreman'],
    features: [
      'Project Management',
      'Safety Monitoring',
      'Resource Allocation',
      'Worker Management',
      'Compliance Tracking',
      'Progress Reporting'
    ]
  },
  logistics: {
    path: '/dashboards/logistics',
    industry: 'logistics',
    title: 'Logistics & Fleet Dashboard',
    description: 'Fleet management, delivery tracking, and driver communication',
    icon: '🚛',
    color: 'blue',
    requiredRole: ['fleet_manager', 'dispatcher', 'driver', 'operations'],
    features: [
      'Fleet Tracking',
      'Delivery Management',
      'Driver Communication',
      'Route Optimization',
      'Maintenance Alerts',
      'Performance Analytics'
    ]
  },
  government: {
    path: '/dashboards/government',
    industry: 'government',
    title: 'Government Dashboard',
    description: 'Citizen services, emergency management, and administrative oversight',
    icon: '🏛️',
    color: 'purple',
    requiredRole: ['department_head', 'citizen_services', 'emergency_services', 'permit_office'],
    features: [
      'Citizen Services',
      'Emergency Management',
      'Permit Processing',
      'Public Communication',
      'Compliance Monitoring',
      'Resource Management'
    ]
  },
  education: {
    path: '/dashboards/education',
    industry: 'education',
    title: 'Education Dashboard',
    description: 'Student management, communication, and administrative oversight',
    icon: '🎓',
    color: 'indigo',
    requiredRole: ['principal', 'teacher', 'admin', 'parent'],
    features: [
      'Student Management',
      'Parent Communication',
      'Academic Tracking',
      'Resource Planning',
      'Safety Monitoring',
      'Performance Analytics'
    ]
  },
  retail: {
    path: '/dashboards/retail',
    industry: 'retail',
    title: 'Retail Dashboard',
    description: 'Store management, inventory tracking, and customer service',
    icon: '🛒',
    color: 'pink',
    requiredRole: ['store_manager', 'sales_associate', 'inventory', 'customer_service'],
    features: [
      'Store Management',
      'Inventory Tracking',
      'Customer Service',
      'Sales Analytics',
      'Staff Scheduling',
      'Performance Metrics'
    ]
  },
  hospitality: {
    path: '/dashboards/hospitality',
    industry: 'hospitality',
    title: 'Hospitality Dashboard',
    description: 'Guest management, service coordination, and operational oversight',
    icon: '🏨',
    color: 'teal',
    requiredRole: ['general_manager', 'front_desk', 'concierge', 'guest_services'],
    features: [
      'Guest Management',
      'Service Coordination',
      'Booking Management',
      'Staff Communication',
      'Quality Monitoring',
      'Revenue Tracking'
    ]
  },
  wellness: {
    path: '/dashboards/wellness',
    industry: 'wellness',
    title: 'Wellness Dashboard',
    description: 'Member management, class scheduling, and facility operations',
    icon: '💪',
    color: 'emerald',
    requiredRole: ['facility_manager', 'trainer', 'nutritionist', 'reception'],
    features: [
      'Member Management',
      'Class Scheduling',
      'Facility Operations',
      'Health Tracking',
      'Payment Processing',
      'Staff Management'
    ]
  },
  beauty: {
    path: '/dashboards/beauty',
    industry: 'beauty',
    title: 'Beauty Dashboard',
    description: 'Client management, appointment booking, and service coordination',
    icon: '💄',
    color: 'rose',
    requiredRole: ['salon_manager', 'stylist', 'esthetician', 'reception'],
    features: [
      'Client Management',
      'Appointment Booking',
      'Service Coordination',
      'Inventory Management',
      'Staff Scheduling',
      'Revenue Tracking'
    ]
  },
  legal: {
    path: '/dashboards/legal',
    industry: 'legal',
    title: 'Legal Dashboard',
    description: 'Case management, client communication, and billing oversight',
    icon: '⚖️',
    color: 'gray',
    requiredRole: ['partner', 'associate', 'paralegal', 'admin'],
    features: [
      'Case Management',
      'Client Communication',
      'Document Management',
      'Billing & Invoicing',
      'Court Scheduling',
      'Compliance Tracking'
    ]
  }
};

export class DashboardRoutingService {
  private authData: AuthData | null = null;

  constructor() {
    this.loadAuthData();
  }

  /**
   * Load authentication data from localStorage
   */
  private loadAuthData(): void {
    try {
      const stored = localStorage.getItem('tetrixAuth');
      if (stored) {
        this.authData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
      this.authData = null;
    }
  }

  /**
   * Get current authentication data
   */
  getAuthData(): AuthData | null {
    return this.authData;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authData !== null && this.authData.authToken !== undefined;
  }

  /**
   * Get dashboard configuration for current user
   */
  getDashboardConfig(): DashboardConfig | null {
    if (!this.authData) return null;

    const route = DASHBOARD_ROUTES[this.authData.industry];
    if (!route) return null;

    return {
      industry: this.authData.industry,
      role: this.authData.role,
      organization: this.authData.organization,
      permissions: this.getRolePermissions(this.authData.role),
      features: route.features,
      integrations: this.getIndustryIntegrations(this.authData.industry),
      metrics: this.getIndustryMetrics(this.authData.industry)
    };
  }

  /**
   * Get dashboard route for current user
   */
  getDashboardRoute(): DashboardRoute | null {
    if (!this.authData) return null;
    return DASHBOARD_ROUTES[this.authData.industry] || null;
  }

  /**
   * Redirect to appropriate dashboard
   */
  redirectToDashboard(): void {
    const route = this.getDashboardRoute();
    if (route) {
      const url = new URL(route.path, window.location.origin);
      url.searchParams.set('token', this.authData!.authToken);
      url.searchParams.set('role', this.authData!.role);
      url.searchParams.set('org', this.authData!.organization);
      window.location.href = url.toString();
    } else {
      console.error('No dashboard route found for industry:', this.authData?.industry);
      window.location.href = '/dashboards/client';
    }
  }

  /**
   * Validate user access to specific dashboard
   */
  validateAccess(industry: string, role?: string): boolean {
    if (!this.authData) return false;
    
    const route = DASHBOARD_ROUTES[industry];
    if (!route) return false;

    if (this.authData.industry !== industry) return false;
    
    if (role && route.requiredRole && !route.requiredRole.includes(role)) {
      return false;
    }

    return true;
  }

  /**
   * Get role-based permissions
   */
  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      // Healthcare roles
      'doctor': ['view_patients', 'edit_patients', 'schedule_appointments', 'view_medical_records', 'emergency_access'],
      'nurse': ['view_patients', 'edit_patients', 'schedule_appointments', 'view_medical_records'],
      'admin': ['manage_users', 'view_reports', 'manage_settings', 'view_all_data'],
      'specialist': ['view_patients', 'edit_patients', 'specialized_care', 'view_medical_records'],

      // Construction roles
      'project_manager': ['manage_projects', 'view_all_data', 'manage_workers', 'safety_oversight', 'budget_management'],
      'site_supervisor': ['manage_site', 'view_workers', 'safety_monitoring', 'progress_tracking'],
      'safety_officer': ['safety_monitoring', 'compliance_tracking', 'incident_reporting', 'safety_training'],
      'foreman': ['manage_crew', 'view_assignments', 'progress_reporting', 'resource_management'],

      // Logistics roles
      'fleet_manager': ['manage_fleet', 'view_all_data', 'route_optimization', 'driver_management', 'maintenance_oversight'],
      'dispatcher': ['manage_routes', 'driver_communication', 'delivery_tracking', 'schedule_management'],
      'driver': ['view_assignments', 'update_status', 'delivery_confirmation', 'maintenance_reporting'],
      'operations': ['view_analytics', 'performance_monitoring', 'process_optimization', 'report_generation'],

      // Default permissions
      'default': ['view_data', 'basic_operations']
    };

    return rolePermissions[role] || rolePermissions['default'];
  }

  /**
   * Get industry-specific integrations
   */
  private getIndustryIntegrations(industry: string): string[] {
    const integrations: Record<string, string[]> = {
      healthcare: ['Epic MyChart', 'Cerner PowerChart', 'Allscripts', 'NextGen', 'athenahealth'],
      construction: ['Procore', 'Autodesk', 'Safety Management', 'Project Tracking'],
      logistics: ['Fleet Management', 'GPS Tracking', 'Route Optimization', 'Maintenance Systems'],
      government: ['Citizen Portal', 'Emergency Services', 'Permit Systems', 'Public Records'],
      education: ['Student Information System', 'Learning Management', 'Parent Portal', 'Assessment Tools'],
      retail: ['Point of Sale', 'Inventory Management', 'Customer Relationship', 'E-commerce'],
      hospitality: ['Property Management', 'Booking Systems', 'Guest Services', 'Revenue Management'],
      wellness: ['Member Management', 'Class Scheduling', 'Payment Processing', 'Health Tracking'],
      beauty: ['Appointment Booking', 'Client Management', 'Service Tracking', 'Inventory Management'],
      legal: ['Case Management', 'Document Management', 'Billing Systems', 'Court Integration']
    };

    return integrations[industry] || [];
  }

  /**
   * Get industry-specific metrics
   */
  private getIndustryMetrics(industry: string): string[] {
    const metrics: Record<string, string[]> = {
      healthcare: ['patient_count', 'appointments', 'emergency_cases', 'satisfaction_score', 'revenue', 'readmission_rate'],
      construction: ['active_projects', 'completed_projects', 'safety_alerts', 'worker_count', 'budget_utilization', 'timeline_adherence'],
      logistics: ['vehicle_count', 'deliveries', 'delivery_time', 'fuel_efficiency', 'maintenance_alerts', 'driver_performance'],
      government: ['citizen_requests', 'service_delivery', 'emergency_response', 'compliance_rate', 'budget_utilization', 'satisfaction_score'],
      education: ['student_count', 'attendance_rate', 'academic_performance', 'parent_engagement', 'resource_utilization', 'safety_incidents'],
      retail: ['sales_volume', 'inventory_levels', 'customer_satisfaction', 'staff_performance', 'revenue_growth', 'conversion_rate'],
      hospitality: ['occupancy_rate', 'guest_satisfaction', 'revenue_per_room', 'service_quality', 'staff_efficiency', 'booking_rate'],
      wellness: ['member_count', 'class_attendance', 'revenue_per_member', 'facility_utilization', 'retention_rate', 'satisfaction_score'],
      beauty: ['client_count', 'appointment_volume', 'service_revenue', 'staff_utilization', 'retention_rate', 'satisfaction_score'],
      legal: ['case_count', 'billable_hours', 'client_satisfaction', 'case_resolution_time', 'revenue_per_case', 'compliance_rate']
    };

    return metrics[industry] || [];
  }

  /**
   * Get available dashboards for user
   */
  getAvailableDashboards(): DashboardRoute[] {
    if (!this.authData) return [];

    // For now, return only the user's industry dashboard
    // In the future, this could support multi-industry access
    const route = DASHBOARD_ROUTES[this.authData.industry];
    return route ? [route] : [];
  }

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    localStorage.removeItem('tetrixAuth');
    this.authData = null;
    window.location.href = '/';
  }

  /**
   * Refresh authentication data
   */
  refreshAuthData(): void {
    this.loadAuthData();
  }

  /**
   * Get user display information
   */
  getUserInfo(): { role: string; organization: string; industry: string } | null {
    if (!this.authData) return null;

    return {
      role: this.authData.role,
      organization: this.authData.organization,
      industry: this.authData.industry
    };
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.authData) return false;
    
    const permissions = this.getRolePermissions(this.authData.role);
    return permissions.includes(permission);
  }

  /**
   * Get dashboard-specific data
   */
  async getDashboardData(): Promise<any> {
    if (!this.authData) return null;

    try {
      const industry = this.authData.industry as IndustryType;
      const role = this.authData.role as UserRole;
      
      // Get industry-specific metrics
      const industryMetrics = await dashboardService.getIndustryMetrics(industry, role);
      
      // Get universal metrics
      const universalMetrics = await dashboardService.getUniversalMetrics();
      
      // Get products for this industry
      const products = await dashboardProductService.getProducts(industry);

      return {
        industry: industryMetrics,
        universal: universalMetrics,
        products: products,
        config: this.getDashboardConfig()
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const dashboardRoutingService = new DashboardRoutingService();
export default dashboardRoutingService;
