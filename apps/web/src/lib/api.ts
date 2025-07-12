let API_BASE_URL: string;

// @ts-ignore
if (typeof globalThis !== 'undefined' && globalThis.__API_BASE_URL__) {
  // @ts-ignore
  API_BASE_URL = globalThis.__API_BASE_URL__;
} else {
  try {
    // Only import getViteEnv in browser builds
    // @ts-ignore
    API_BASE_URL = require('./getViteEnv').getViteApiBaseUrl() || 'http://localhost:4000';
  } catch {
    API_BASE_URL = 'http://localhost:4000';
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem('authToken');
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Data Labeling API methods
  async getDashboardData() {
    return this.request<{
      stats: {
        totalProjects: number;
        activeTasks: number;
        completedTasks: number;
        pendingReviews: number;
        totalEarnings: number;
        qualityScore: number;
      };
      projects: Array<{
        id: string;
        name: string;
        status: 'active' | 'paused' | 'completed';
        progress: number;
        totalTasks: number;
        completedTasks: number;
        assignedMembers: number;
        createdAt: string;
        deadline?: string;
      }>;
    }>('/api/data-labeling/dashboard');
  }

  async getProjects() {
    return this.request<{
      projects: Array<{
        id: string;
        name: string;
        description: string;
        status: 'active' | 'paused' | 'completed';
        progress: number;
        totalTasks: number;
        completedTasks: number;
        assignedMembers: number;
        createdAt: string;
        deadline?: string;
        budget?: number;
        guidelines?: string;
      }>;
    }>('/api/data-labeling/projects');
  }

  async getProject(projectId: string) {
    return this.request<{
      id: string;
      name: string;
      description: string;
      status: 'active' | 'paused' | 'completed';
      createdAt: string;
      deadline?: string;
      budget?: number;
      guidelines?: string;
    }>(`/api/data-labeling/projects/${projectId}`);
  }

  async createProject(projectData: {
    name: string;
    description: string;
    deadline?: string;
    budget?: number;
    guidelines?: string;
  }) {
    return this.request<{ project: any }>('/api/data-labeling/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async createTask(taskData: {
    projectId: string;
    datasetId: string;
    inputData: any;
    assignedToId?: string;
    estimatedHours?: number;
    payment?: number;
    priority?: string;
  }) {
    return this.request<{ task: any }>('/api/data-labeling/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async submitTask(taskId: string, data: {
    annotations: any;
    comments?: string;
  }) {
    return this.request<{ task: any }>(`/api/data-labeling/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReview(reviewId: string, data: {
    action: 'approve' | 'reject';
    comments?: string;
  }) {
    return this.request<{ review: any }>(`/api/data-labeling/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAnalytics(period: string = '30d') {
    return this.request<{
      period: string;
      metrics: {
        totalTasks: number;
        completedTasks: number;
        averageCompletionTime: number;
        qualityScore: number;
        totalEarnings: number;
        activeProjects: number;
        activeAnnotators: number;
      };
      trends: {
        dailyCompletions: number[];
        qualityScores: number[];
        earnings: number[];
      };
    }>(`/api/data-labeling/analytics?period=${period}`);
  }

  async getBilling() {
    return this.request<{
      currentBalance: number;
      pendingPayouts: number;
      totalEarned: number;
      paymentHistory: Array<{
        id: string;
        amount: number;
        status: string;
        date: string;
        method: string;
      }>;
    }>('/api/data-labeling/billing');
  }

  // Wallet management
  async createWallet() {
    return this.request<any>('/api/data-labeling/wallet/create', {
      method: 'POST',
    });
  }

  async processPayout(data: { userId: string; amount: number }) {
    return this.request<any>('/api/data-labeling/wallet/payout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contact form submission
  async submitContactForm(data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) {
    return this.request<{ message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics metrics
  async getMetrics() {
    return this.request<{ date: string; approvedRate: number }[]>('/api/data-labeling/analytics');
  }

  // Task management
  async getTasks() {
    return this.request<{
      tasks: Array<{
        id: string;
        projectId: string;
        projectName: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        assignedTo: string;
        createdAt: string;
        deadline: string;
        estimatedHours: number;
        payment: number;
      }>;
    }>('/api/data-labeling/tasks');
  }

  async deleteTask(taskId: string) {
    return this.request<any>(`/api/data-labeling/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async getTaskDetails(taskId: string) {
    return this.request<{
      id: string;
      projectId: string;
      projectName: string;
      title: string;
      description: string;
      status: string;
      priority: string;
      assignedTo: string;
      createdAt: string;
      deadline: string;
      estimatedHours: number;
      payment: number;
    }>(`/api/data-labeling/tasks/${taskId}`);
  }

  async assignTask(data: { user: string; dueDate: string }) {
    return this.request<any>('/api/data-labeling/tasks/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async claimTask(taskId: string) {
    return this.request<any>(`/api/data-labeling/tasks/${taskId}/claim`, {
      method: 'POST',
    });
  }

  // Review queue management
  async getReviewQueue() {
    return this.request<{
      reviews: Array<{
        id: string;
        taskId: string;
        projectName: string;
        submittedBy: string;
        submittedAt: string;
        status: string;
        annotations: any;
        comments?: string;
      }>;
    }>('/api/data-labeling/reviews');
  }

  async submitTaskReview(data: {
    taskId: string;
    status: 'approved' | 'rejected';
    feedback?: string;
  }) {
    return this.request<any>(`/api/data-labeling/reviews/${data.taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: data.status === 'approved' ? 'approve' : 'reject',
        comments: data.feedback
      }),
    });
  }

  // Analytics with filters
  async getAnalyticsWithFilters(filters: {
    project?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params = new URLSearchParams();
    if (filters.project) params.append('project', filters.project);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    return this.request<any>(`/api/data-labeling/analytics?${params.toString()}`);
  }

  // OAuth and Auth-specific methods
  async getOAuthProviders() {
    return this.request<{
      providers: Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
      }>;
    }>('/api/v1/auth/oauth/providers');
  }

  async getOAuthAuthorizationUrl(provider: string, redirectUri: string) {
    return this.request<{
      state: string;
      authorization_url: string;
    }>(`/api/v1/auth/oauth/authorize/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`);
  }

  async handleOAuthCallback(data: {
    code: string;
    state: string;
    provider: string;
    redirect_uri: string;
  }) {
    return this.request<{
      firebase_token: string;
      user_record: any;
    }>('/api/v1/auth/oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async setUserRole(data: {
    uid: string;
    role: string;
  }) {
    return this.request<{ message: string }>('/api/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Label Studio reviewer authentication
  async reviewAuthenticate(data: { projectId: string; taskId: string; labelId: string }) {
    return this.request<{ authenticatedUrl: string }>(
      '/api/label-studio/review-authenticate',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Label Studio dynamic label config
  async getLabelConfig(projectId: string) {
    return this.request<{ config: string }>(`/api/label-studio/label-config/${projectId}`);
  }

  // Label Studio event logging
  async logLabelStudioEvent(event: { type: string; details?: any }) {
    return this.request<{ message: string }>(
      '/api/label-studio/log-event',
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    );
  }

  // Label Studio analytics
  async getLabelStudioAnalytics(period: string = '30d') {
    return this.request<{ metrics: any; trends: any }>(`/api/label-studio/analytics?period=${period}`);
  }

  async getAnalyticsOverview() {
    return this.request('/api/analytics/overview');
  }

  async getAnalyticsTrends(params: { interval?: string; from?: string; to?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/analytics/trends${query ? `?${query}` : ''}`);
  }

  async getUserAnalytics(userId: string, params: { from?: string; to?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/analytics/user/${userId}${query ? `?${query}` : ''}`);
  }

  async getProjectAnalytics(projectId: string, params: { from?: string; to?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/analytics/project/${projectId}${query ? `?${query}` : ''}`);
  }
}

export const apiService = new ApiService();
export default apiService; 