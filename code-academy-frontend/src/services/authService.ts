import axios from 'axios';
import { User, AuthTokens } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    if (tokens?.tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        if (tokens?.tokens?.refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: tokens.tokens.refreshToken,
          });

          const newTokens = response.data.tokens;
          
          // Update stored tokens
          const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          authData.tokens = newTokens;
          localStorage.setItem('auth-storage', JSON.stringify(authData));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginResponse {
  message: string;
  twoFAToken?: string;
  user?: User;
  tokens?: AuthTokens;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningGoals?: string[];
}

export interface RegisterResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface Verify2FAResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokensResponse {
  message: string;
  tokens: AuthTokens;
}

export interface UserResponse {
  user: User;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(token: string, code: string): Promise<Verify2FAResponse> {
    const response = await api.post('/auth/verify-2fa', { token, code });
    return response.data;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<RefreshTokensResponse> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<UserResponse> {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Delete account
   */
  async deleteAccount(): Promise<void> {
    await api.delete('/users/account');
  },
};

export default authService;
