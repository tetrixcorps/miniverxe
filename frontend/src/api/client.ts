import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './models';

export class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add token to requests if available
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.post(url, data, config);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
  
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
  
  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }
  
  private handleError(error: any): void {
    if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      // Extract error message
      const message = error.response.data?.detail || error.response.data?.message || 'Server error';
      error.message = `${status}: ${message}`;
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response from server. Please check your connection.';
    }
    // Otherwise, use the original error message
  }
  
  // Media processing specific methods
  async processMedia(file: File, tasks: string[], options: any): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tasks', tasks.join(','));
    
    // Add all options to form data
    Object.keys(options).forEach(key => {
      formData.append(key, options[key].toString());
    });
    
    return this.post('/api/background/media/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  async getMediaTaskStatus(taskId: string): Promise<TaskStatus> {
    return this.get(`/api/background/media/tasks/${taskId}/status`);
  }
} 