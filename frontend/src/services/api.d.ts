declare module '../../services/api' {
  export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }

  export interface ApiOptions {
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }

  export interface Api {
    get<T = any>(url: string, options?: ApiOptions): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, options?: ApiOptions): Promise<ApiResponse<T>>;
  }

  export function useApi(): Api;
} 