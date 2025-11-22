import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    githubUsername?: string;
    linkedinUsername?: string;
    twitterUsername?: string;
    skills: string[];
    experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    learningGoals: string[];
    timezone: string;
    language: string;
  };
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  verify2FA: (token: string, code: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningGoals?: string[];
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(email, password);
          
          if (response.twoFAToken) {
            // Store 2FA token temporarily
            sessionStorage.setItem('2faToken', response.twoFAToken);
            toast.success('Please check your phone for the 2FA code');
            set({ isLoading: false });
            return;
          }

          // If no 2FA required, complete login
          if (response.tokens) {
            set({
              user: response.user,
              tokens: response.tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            toast.success('Welcome back!');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
        }
      },

      verify2FA: async (token: string, code: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.verify2FA(token, code);
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Clear 2FA token
          sessionStorage.removeItem('2faToken');
          toast.success('2FA verification successful!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '2FA verification failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          toast.success('Account created successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
        }
      },

      logout: () => {
        // Call logout API
        authService.logout().catch(console.error);
        
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear 2FA token
        sessionStorage.removeItem('2faToken');
        toast.success('Logged out successfully');
      },

      refreshTokens: async () => {
        try {
          const { tokens } = get();
          if (!tokens?.refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authService.refreshTokens(tokens.refreshToken);
          
          set({
            tokens: response.tokens,
            error: null,
          });
        } catch (error: any) {
          // If refresh fails, logout user
          get().logout();
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auto-refresh tokens
let refreshInterval: NodeJS.Timeout | null = null;

export const startTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    const { isAuthenticated, refreshTokens } = useAuthStore.getState();
    if (isAuthenticated) {
      refreshTokens();
    }
  }, 5 * 60 * 1000); // Refresh every 5 minutes
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
