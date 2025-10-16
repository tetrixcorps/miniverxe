// Open WebUI Integration Service
export interface OpenWebUIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DocumentAnalysis {
  id: string;
  filename: string;
  content: string;
  analysis: string;
  summary: string;
  keyPoints: string[];
  confidence: number;
  timestamp: Date;
}

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'insight' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  industry: string;
  timestamp: Date;
}

class OpenWebUIService {
  private config: OpenWebUIConfig;
  private isConnected: boolean = false;

  constructor(config: OpenWebUIConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.isConnected = true;
        console.log('Open WebUI connected successfully');
        return true;
      } else {
        console.error('Failed to connect to Open WebUI:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Open WebUI:', error);
      return false;
    }
  }

  async sendMessage(message: string, context?: any): Promise<ChatMessage> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        metadata: {
          model: data.model,
          usage: data.usage
        }
      };
    } catch (error) {
      console.error('Error sending message to Open WebUI:', error);
      throw error;
    }
  }

  async analyzeDocument(file: File, industry: string): Promise<DocumentAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('industry', industry);

      const response = await fetch(`${this.config.baseUrl}/api/v1/documents/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id || Date.now().toString(),
        filename: file.name,
        content: data.content,
        analysis: data.analysis,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        confidence: data.confidence || 0.8,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  async generateInsights(data: any, industry: string): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/insights/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          industry,
          model: this.config.model,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const insights = await response.json();
      
      return insights.map((insight: any) => ({
        id: insight.id || Date.now().toString(),
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence || 0.8,
        actionable: insight.actionable || false,
        industry,
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  async executeFunction(functionName: string, parameters: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/functions/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          function: functionName,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing function:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  updateConfig(newConfig: Partial<OpenWebUIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
const openWebUIConfig: OpenWebUIConfig = {
  baseUrl: process.env.NEXT_PUBLIC_OPENWEBUI_URL || 'http://localhost:3000',
  apiKey: process.env.NEXT_PUBLIC_OPENWEBUI_API_KEY || '',
  model: process.env.NEXT_PUBLIC_OPENWEBUI_MODEL || 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000
};

export const openWebUIService = new OpenWebUIService(openWebUIConfig);

// Industry-specific AI functions
export const industryAIFunctions = {
  healthcare: {
    analyzePatientData: (patientData: any) => openWebUIService.executeFunction('analyze_patient_data', patientData),
    suggestTreatment: (symptoms: string[], history: string) => openWebUIService.executeFunction('suggest_treatment', { symptoms, history }),
    generateMedicalNotes: (consultation: any) => openWebUIService.executeFunction('generate_medical_notes', consultation)
  },
  legal: {
    analyzeLegalDocument: (document: any) => openWebUIService.executeFunction('analyze_legal_document', document),
    researchCaseLaw: (query: string) => openWebUIService.executeFunction('research_case_law', { query }),
    draftLegalDocument: (requirements: any) => openWebUIService.executeFunction('draft_legal_document', requirements)
  },
  retail: {
    analyzeCustomerBehavior: (customerData: any) => openWebUIService.executeFunction('analyze_customer_behavior', customerData),
    suggestProducts: (customerProfile: any) => openWebUIService.executeFunction('suggest_products', customerProfile),
    optimizeInventory: (inventoryData: any) => openWebUIService.executeFunction('optimize_inventory', inventoryData)
  },
  construction: {
    analyzeProjectData: (projectData: any) => openWebUIService.executeFunction('analyze_project_data', projectData),
    assessSafetyRisks: (siteData: any) => openWebUIService.executeFunction('assess_safety_risks', siteData),
    optimizeResources: (resourceData: any) => openWebUIService.executeFunction('optimize_resources', resourceData)
  }
};

export default openWebUIService;
