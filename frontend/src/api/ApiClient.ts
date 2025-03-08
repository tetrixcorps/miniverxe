import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

/**
 * API Client for the AI-Enhanced Microservices Platform
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string | null = null;
  private authToken: string | null = null;

  /**
   * Create a new API client instance
   * @param baseUrl - Base URL for the API (e.g., "https://api.example.com/v1")
   * @param options - Configuration options
   */
  constructor(baseUrl: string, options: { apiKey?: string; authToken?: string } = {}) {
    this.baseUrl = baseUrl;
    if (options.apiKey) this.apiKey = options.apiKey;
    if (options.authToken) this.authToken = options.authToken;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds default timeout
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        // Transform error for better client-side handling
        if (error.response) {
          const enhancedError = new Error(
            error.response.data.detail || error.response.data.message || 'API request failed'
          );
          (enhancedError as any).status = error.response.status;
          (enhancedError as any).data = error.response.data;
          return Promise.reject(enhancedError);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token for subsequent requests
   * @param token JWT token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set API key for subsequent requests
   * @param apiKey API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client.defaults.headers.common['X-API-Key'] = apiKey;
  }

  // ===== Authentication =====

  /**
   * Authenticate user with username and password
   * @param username User's username or email
   * @param password User's password
   * @returns Authentication response including token
   */
  async login(username: string, password: string): Promise<any> {
    const response = await this.client.post('/auth/login', { username, password });
    if (response.data.access_token) {
      this.setAuthToken(response.data.access_token);
    }
    return response.data;
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Registration response
   */
  async register(userData: any): Promise<any> {
    return (await this.client.post('/auth/register', userData)).data;
  }

  /**
   * Get current user information
   * @returns User profile data
   */
  async getCurrentUser(): Promise<any> {
    return (await this.client.get('/api/me')).data;
  }

  // ===== Speech Recognition Services =====

  /**
   * Transcribe audio file
   * @param audioFile File object or blob
   * @param options Transcription options
   * @returns Transcription result
   */
  async transcribeAudio(audioFile: File | Blob, options: any = {}): Promise<any> {
    const formData = new FormData();
    formData.append('file', audioFile);
    
    if (options.language) formData.append('language', options.language);
    if (options.model) formData.append('model', options.model);
    if (options.punctuate !== undefined) formData.append('punctuate', options.punctuate.toString());
    
    return (await this.client.post('/api/asr/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  }

  /**
   * Create a streaming transcription session
   * @param options Streaming options
   * @returns Session information with WebSocket URL
   */
  async createStreamingSession(options: any = {}): Promise<any> {
    return (await this.client.post('/api/asr/streaming/create', options)).data;
  }

  // ===== Vision Services =====

  /**
   * Enhance media (image super-resolution)
   * @param imageFile Image file to enhance
   * @param options Enhancement options
   * @returns Task information for background processing
   */
  async enhanceMedia(imageFile: File | Blob, options: any = {}): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    if (options.scale) formData.append('scale', options.scale.toString());
    if (options.denoise) formData.append('denoise', options.denoise.toString());
    if (options.quality) formData.append('quality', options.quality.toString());
    
    return (await this.client.post('/api/vision/enhance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  }

  /**
   * Analyze image for objects, persons, etc.
   * @param imageFile Image file to analyze
   * @param options Analysis options
   * @returns Analysis results
   */
  async analyzeImage(imageFile: File | Blob, options: any = {}): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    if (options.features) formData.append('features', JSON.stringify(options.features));
    if (options.minConfidence) formData.append('min_confidence', options.minConfidence.toString());
    
    return (await this.client.post('/api/vision/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  }

  // ===== Background Tasks =====

  /**
   * Get status of a background task
   * @param taskId ID of the task to check
   * @returns Task status and results if completed
   */
  async getTaskStatus(taskId: string): Promise<any> {
    return (await this.client.get(`/api/background/tasks/${taskId}`)).data;
  }

  /**
   * List background tasks 
   * @param options Filtering options
   * @returns List of tasks
   */
  async listTasks(options: any = {}): Promise<any> {
    return (await this.client.get('/api/background/tasks', { params: options })).data;
  }

  // ===== Marketing Services =====

  /**
   * Analyze marketing campaign
   * @param campaignData Campaign data to analyze
   * @returns Analysis results or background task
   */
  async analyzeCampaign(campaignData: any): Promise<any> {
    return (await this.client.post('/api/marketing/campaigns/analyze', campaignData)).data;
  }

  /**
   * Score a lead based on their profile and activities
   * @param leadData Lead data to score
   * @returns Lead score and recommendations
   */
  async scoreLead(leadData: any): Promise<any> {
    return (await this.client.post('/api/marketing/leads/score', leadData)).data;
  }

  /**
   * Register marketing webhook for integration
   * @param webhookData Webhook configuration
   * @returns Webhook registration confirmation
   */
  async registerMarketingWebhook(webhookData: any): Promise<any> {
    return (await this.client.post('/api/marketing/webhook', webhookData)).data;
  }

  // ===== Sales Services =====

  /**
   * Analyze sales call recording
   * @param callData Call data including recording URL
   * @returns Analysis results or background task
   */
  async analyzeSalesCall(callData: any): Promise<any> {
    return (await this.client.post('/api/sales/calls/analyze', callData)).data;
  }

  /**
   * Sync opportunity with CRM
   * @param opportunityData Opportunity data to sync
   * @returns Sync confirmation
   */
  async syncOpportunity(opportunityData: any): Promise<any> {
    return (await this.client.post('/api/sales/crm/sync', opportunityData)).data;
  }

  /**
   * Get opportunity recommendations
   * @param opportunityId ID of the opportunity
   * @returns AI-driven recommendations
   */
  async getOpportunityRecommendations(opportunityId: string): Promise<any> {
    return (await this.client.get(`/api/sales/opportunities/${opportunityId}/recommendations`)).data;
  }

  // ===== VOIP Services =====

  /**
   * Create a new VOIP call
   * @param callRequest Call creation request
   * @returns Call session details
   */
  async createCall(callRequest: any): Promise<any> {
    return (await this.client.post('/api/voip/calls', callRequest)).data;
  }

  /**
   * End an active VOIP call
   * @param callId ID of the call to end
   * @returns Call end confirmation
   */
  async endCall(callId: string): Promise<any> {
    return (await this.client.delete(`/api/voip/calls/${callId}`)).data;
  }

  /**
   * Get call analytics
   * @param callId ID of the call to analyze
   * @returns Call analytics
   */
  async getCallAnalytics(callId: string): Promise<any> {
    return (await this.client.get(`/api/voip/calls/${callId}/analytics`)).data;
  }

  /**
   * Get VOIP WebSocket connection URL 
   * @param callId ID of the call
   * @returns WebSocket connection details
   */
  getVoipWebSocketUrl(callId: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = this.baseUrl.replace(/^https?:\/\//, '');
    return `${protocol}//${host}/api/voip/ws/${callId}`;
  }

  // ===== General API Methods =====

  /**
   * Make a GET request to any endpoint
   * @param path API path
   * @param params URL parameters
   * @param config Axios request config
   * @returns Response data
   */
  async get(path: string, params: any = {}, config: AxiosRequestConfig = {}): Promise<any> {
    return (await this.client.get(path, { ...config, params })).data;
  }

  /**
   * Make a POST request to any endpoint
   * @param path API path
   * @param data Request body
   * @param config Axios request config
   * @returns Response data
   */
  async post(path: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<any> {
    return (await this.client.post(path, data, config)).data;
  }

  /**
   * Make a PUT request to any endpoint
   * @param path API path
   * @param data Request body
   * @param config Axios request config
   * @returns Response data
   */
  async put(path: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<any> {
    return (await this.client.put(path, data, config)).data;
  }

  /**
   * Make a DELETE request to any endpoint
   * @param path API path
   * @param config Axios request config
   * @returns Response data
   */
  async delete(path: string, config: AxiosRequestConfig = {}): Promise<any> {
    return (await this.client.delete(path, config)).data;
  }
} 