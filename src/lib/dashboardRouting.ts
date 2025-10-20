// Dashboard Routing Service for TETRIX Authentication System
// Handles automatic redirect after successful 2FA with URL parameters

export interface AuthData {
  industry: string;
  role: string;
  organization: string;
  phoneNumber: string;
  verificationId: string;
  authToken: string;
  authMethod: string;
  timestamp: number;
}

export interface DashboardRoute {
  path: string;
  name: string;
  description: string;
  roles: string[];
  requiresAuth: boolean;
}

// Industry-specific dashboard routes
export const DASHBOARD_ROUTES: Record<string, DashboardRoute> = {
  healthcare: {
    path: '/dashboards/healthcare',
    name: 'Healthcare Dashboard',
    description: 'Medical professionals and healthcare management',
    roles: ['doctor', 'nurse', 'admin', 'manager', 'specialist'],
    requiresAuth: true
  },
  construction: {
    path: '/dashboards/construction',
    name: 'Construction Dashboard',
    description: 'Construction project management and safety',
    roles: ['project_manager', 'supervisor', 'engineer', 'safety_officer', 'admin'],
    requiresAuth: true
  },
  logistics: {
    path: '/dashboards/logistics',
    name: 'Logistics & Fleet Dashboard',
    description: 'Fleet management and logistics operations',
    roles: ['fleet_manager', 'dispatcher', 'driver', 'admin', 'coordinator'],
    requiresAuth: true
  },
  government: {
    path: '/dashboards/government',
    name: 'Government Dashboard',
    description: 'Public sector management and services',
    roles: ['official', 'administrator', 'manager', 'coordinator', 'director'],
    requiresAuth: true
  },
  education: {
    path: '/dashboards/education',
    name: 'Education Dashboard',
    description: 'Educational institution management',
    roles: ['teacher', 'principal', 'admin', 'coordinator', 'director'],
    requiresAuth: true
  },
  retail: {
    path: '/dashboards/retail',
    name: 'Retail Dashboard',
    description: 'Retail operations and sales management',
    roles: ['manager', 'supervisor', 'sales_rep', 'admin', 'coordinator'],
    requiresAuth: true
  },
  hospitality: {
    path: '/dashboards/hospitality',
    name: 'Hospitality Dashboard',
    description: 'Hotel and hospitality management',
    roles: ['manager', 'supervisor', 'staff', 'admin', 'coordinator'],
    requiresAuth: true
  },
  wellness: {
    path: '/dashboards/wellness',
    name: 'Wellness Dashboard',
    description: 'Health and wellness services',
    roles: ['therapist', 'trainer', 'manager', 'admin', 'coordinator'],
    requiresAuth: true
  },
  beauty: {
    path: '/dashboards/beauty',
    name: 'Beauty Dashboard',
    description: 'Beauty and cosmetic services',
    roles: ['stylist', 'therapist', 'manager', 'admin', 'coordinator'],
    requiresAuth: true
  },
  legal: {
    path: '/dashboards/legal',
    name: 'Legal Dashboard',
    description: 'Legal practice management',
    roles: ['lawyer', 'paralegal', 'admin', 'manager', 'coordinator'],
    requiresAuth: true
  }
};

// Default fallback dashboard
export const DEFAULT_DASHBOARD: DashboardRoute = {
  path: '/dashboards/client',
  name: 'Client Dashboard',
  description: 'General client dashboard',
  roles: ['client', 'user', 'admin'],
  requiresAuth: true
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
   * Set authentication data after successful 2FA
   */
  setAuthData(authData: AuthData): void {
    this.authData = authData;
    localStorage.setItem('tetrixAuth', JSON.stringify(authData));
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
    return this.authData !== null && this.authData.authToken !== '';
  }

  /**
   * Get dashboard route for current industry
   */
  getDashboardRoute(): DashboardRoute | null {
    if (!this.authData) return null;
    return DASHBOARD_ROUTES[this.authData.industry] || null;
  }

  /**
   * Redirect to appropriate dashboard with URL parameters
   */
  redirectToDashboard(): void {
    const route = this.getDashboardRoute();
    if (!route) {
      console.error('No dashboard route found for industry:', this.authData?.industry);
      this.redirectToDefault();
      return;
    }

    if (!this.authData) {
      console.error('No authentication data available');
      this.redirectToDefault();
      return;
    }

    // Build URL with parameters
    const url = new URL(route.path, window.location.origin);
    url.searchParams.set('token', this.authData.authToken);
    url.searchParams.set('role', this.authData.role);
    url.searchParams.set('org', this.authData.organization);
    url.searchParams.set('phone', this.authData.phoneNumber);
    url.searchParams.set('industry', this.authData.industry);
    url.searchParams.set('timestamp', this.authData.timestamp.toString());

    console.log('Redirecting to dashboard:', url.toString());
    window.location.href = url.toString();
  }

  /**
   * Redirect to default dashboard
   */
  private redirectToDefault(): void {
    if (!this.authData) {
      window.location.href = '/dashboards/client';
      return;
    }

    const url = new URL(DEFAULT_DASHBOARD.path, window.location.origin);
    url.searchParams.set('token', this.authData.authToken);
    url.searchParams.set('role', this.authData.role);
    url.searchParams.set('org', this.authData.organization);
    url.searchParams.set('phone', this.authData.phoneNumber);
    url.searchParams.set('industry', this.authData.industry);
    url.searchParams.set('timestamp', this.authData.timestamp.toString());

    console.log('Redirecting to default dashboard:', url.toString());
    window.location.href = url.toString();
  }

  /**
   * Validate user access to specific dashboard
   */
  validateAccess(industry: string, role?: string): boolean {
    if (!this.authData) return false;
    
    // Check industry match
    if (this.authData.industry !== industry) return false;
    
    // Check role if specified
    if (role) {
      const route = DASHBOARD_ROUTES[industry];
      if (route && !route.roles.includes(role)) return false;
    }
    
    return true;
  }

  /**
   * Get URL parameters for current session
   */
  getUrlParameters(): Record<string, string> {
    if (!this.authData) return {};
    
    return {
      token: this.authData.authToken,
      role: this.authData.role,
      org: this.authData.organization,
      phone: this.authData.phoneNumber,
      industry: this.authData.industry,
      timestamp: this.authData.timestamp.toString()
    };
  }

  /**
   * Clear authentication data (logout)
   */
  logout(): void {
    this.authData = null;
    localStorage.removeItem('tetrixAuth');
    window.location.href = '/';
  }

  /**
   * Handle successful 2FA authentication
   */
  handleSuccessful2FA(phoneNumber: string, verificationId: string, token: string, industry: string, role: string, organization: string): void {
    const authData: AuthData = {
      industry,
      role,
      organization,
      phoneNumber,
      verificationId,
      authToken: token,
      authMethod: '2fa',
      timestamp: Date.now()
    };

    this.setAuthData(authData);
    this.redirectToDashboard();
  }
}

// Export singleton instance
export const dashboardRoutingService = new DashboardRoutingService();

// Global function for easy access
declare global {
  interface Window {
    dashboardRoutingService: DashboardRoutingService;
  }
}

// Make service available globally
if (typeof window !== 'undefined') {
  window.dashboardRoutingService = dashboardRoutingService;
}
