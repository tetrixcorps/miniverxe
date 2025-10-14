// SinchChatLive AI Service for Code Academy
// Integrates with the TETRIX SinchChatLive system as primary with Ollama fallback

import { realSHANGOAIService } from '../../../src/services/realSinchChatService';

export interface CodeAnalysis {
  score: number;
  suggestions: CodeSuggestion[];
  errors: CodeError[];
  complexity: 'low' | 'medium' | 'high';
  readability: 'poor' | 'fair' | 'good' | 'excellent';
  performance: PerformanceAnalysis;
  bestPractices: BestPractice[];
}

export interface CodeSuggestion {
  id: string;
  type: 'improvement' | 'optimization' | 'style' | 'security';
  message: string;
  code: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  impact: 'low' | 'medium' | 'high';
}

export interface CodeError {
  id: string;
  type: 'syntax' | 'logic' | 'runtime' | 'type';
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  fix: string;
  explanation: string;
}

export interface PerformanceAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  bottlenecks: string[];
  optimizations: string[];
}

export interface BestPractice {
  id: string;
  category: 'naming' | 'structure' | 'documentation' | 'testing' | 'security';
  message: string;
  example: string;
  explanation: string;
}

export interface LearningInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextTopics: string[];
  studyPlan: StudyPlanItem[];
  progressScore: number;
  estimatedTimeToComplete: number;
}

export interface StudyPlanItem {
  id: string;
  title: string;
  type: 'lesson' | 'exercise' | 'project' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  prerequisites: string[];
  description: string;
}

export interface AICodingAssistance {
  response: string;
  code?: string;
  explanation: string;
  suggestions: CodeSuggestion[];
  relatedTopics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CodeSubmission {
  id: string;
  studentId: string;
  code: string;
  language: string;
  exerciseId: string;
  submittedAt: Date;
  analysis: CodeAnalysis;
  score: number;
}

export class SinchAIService {
  private ollamaUrl: string;
  private shangoService: typeof realSHANGOAIService;
  private currentSession: any = null;

  constructor(ollamaUrl: string = 'http://localhost:11434') {
    this.ollamaUrl = ollamaUrl;
    this.shangoService = realSHANGOAIService;
  }

  /**
   * Initialize the AI service with SinchChatLive as primary
   */
  async initialize(): Promise<void> {
    try {
      await this.shangoService.initialize();
      console.log('SinchAIService: Initialized with SinchChatLive primary');
    } catch (error) {
      console.log('SinchAIService: SinchChatLive initialization failed, using Ollama fallback:', error);
    }
  }

  /**
   * Get AI assistance for coding questions using SinchChatLive primary + Ollama fallback
   */
  async getCodingAssistance(
    question: string, 
    context: {
      language?: string;
      code?: string;
      userId?: string;
      exerciseId?: string;
    } = {}
  ): Promise<AICodingAssistance> {
    try {
      // Try SinchChatLive first
      if (this.currentSession) {
        try {
          const aiMessage = await this.shangoService.sendSHANGOMessage(
            this.currentSession.id, 
            this.formatCodingQuestion(question, context), 
            'shango-technical'
          );
          
          return this.parseAIResponse(aiMessage.content, context);
        } catch (sinchError) {
          console.log('SinchChatLive failed, falling back to Ollama:', sinchError);
        }
      }

      // Fallback to Ollama
      return await this.getOllamaCodingAssistance(question, context);
    } catch (error) {
      console.error('Error getting coding assistance:', error);
      throw error;
    }
  }

  /**
   * Analyze code using SinchChatLive primary + Ollama fallback
   */
  async analyzeCode(code: string, language: string = 'javascript'): Promise<CodeAnalysis> {
    try {
      const prompt = this.formatCodeAnalysisPrompt(code, language);
      
      // Try SinchChatLive first
      if (this.currentSession) {
        try {
          const aiMessage = await this.shangoService.sendSHANGOMessage(
            this.currentSession.id, 
            prompt, 
            'shango-technical'
          );
          
          return this.parseCodeAnalysis(aiMessage.content, code, language);
        } catch (sinchError) {
          console.log('SinchChatLive failed, falling back to Ollama:', sinchError);
        }
      }

      // Fallback to Ollama
      return await this.analyzeCodeWithOllama(code, language);
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw error;
    }
  }

  /**
   * Get learning insights using SinchChatLive primary + Ollama fallback
   */
  async getLearningInsights(
    studentId: string,
    completedCourses: string[],
    currentSkills: string[],
    performanceData: any
  ): Promise<LearningInsights> {
    try {
      const prompt = this.formatLearningInsightsPrompt(studentId, completedCourses, currentSkills, performanceData);
      
      // Try SinchChatLive first
      if (this.currentSession) {
        try {
          const aiMessage = await this.shangoService.sendSHANGOMessage(
            this.currentSession.id, 
            prompt, 
            'shango-general'
          );
          
          return this.parseLearningInsights(aiMessage.content);
        } catch (sinchError) {
          console.log('SinchChatLive failed, falling back to Ollama:', sinchError);
        }
      }

      // Fallback to Ollama
      return await this.getLearningInsightsWithOllama(prompt);
    } catch (error) {
      console.error('Error getting learning insights:', error);
      throw error;
    }
  }

  /**
   * Start a learning session with SinchChatLive
   */
  async startLearningSession(userId: string, courseId?: string): Promise<void> {
    try {
      this.currentSession = await this.shangoService.startSHANGOChat(userId, 'shango-technical');
      console.log('SinchAIService: Learning session started:', this.currentSession.id);
    } catch (error) {
      console.log('SinchAIService: Failed to start learning session, using Ollama only:', error);
    }
  }

  /**
   * End the current learning session
   */
  async endLearningSession(): Promise<void> {
    if (this.currentSession) {
      try {
        await this.shangoService.endSHANGOChat(this.currentSession.id);
        this.currentSession = null;
        console.log('SinchAIService: Learning session ended');
      } catch (error) {
        console.error('Error ending learning session:', error);
      }
    }
  }

  // Private helper methods

  private formatCodingQuestion(question: string, context: any): string {
    let prompt = `You are SHANGO Tech, an AI coding assistant for the Code Academy platform. Help the student with their coding question.

Question: ${question}`;

    if (context.language) {
      prompt += `\nProgramming Language: ${context.language}`;
    }

    if (context.code) {
      prompt += `\nStudent's Code:\n\`\`\`${context.language || 'javascript'}\n${context.code}\n\`\`\``;
    }

    if (context.exerciseId) {
      prompt += `\nExercise ID: ${context.exerciseId}`;
    }

    prompt += `\n\nPlease provide:
1. A clear explanation of the solution
2. Code examples if applicable
3. Best practices and tips
4. Related concepts to study

Be encouraging and educational in your response.`;

    return prompt;
  }

  private formatCodeAnalysisPrompt(code: string, language: string): string {
    return `You are SHANGO Tech, an AI code reviewer for the Code Academy platform. Analyze this ${language} code and provide detailed feedback.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Code quality score (1-10)
2. Specific suggestions for improvement
3. Any errors or issues found
4. Performance analysis
5. Best practices recommendations
6. Complexity assessment

Format your response as a structured analysis.`;
  }

  private formatLearningInsightsPrompt(
    studentId: string,
    completedCourses: string[],
    currentSkills: string[],
    performanceData: any
  ): string {
    return `You are SHANGO, an AI learning advisor for the Code Academy platform. Analyze this student's learning progress and provide personalized insights.

Student ID: ${studentId}
Completed Courses: ${completedCourses.join(', ')}
Current Skills: ${currentSkills.join(', ')}
Performance Data: ${JSON.stringify(performanceData, null, 2)}

Please provide:
1. Learning strengths and weaknesses
2. Personalized recommendations
3. Next topics to study
4. Study plan with specific activities
5. Progress score and estimated completion time

Be encouraging and specific in your recommendations.`;
  }

  private async getOllamaCodingAssistance(question: string, context: any): Promise<AICodingAssistance> {
    const prompt = this.formatCodingQuestion(question, context);
    
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.response, context);
  }

  private async analyzeCodeWithOllama(code: string, language: string): Promise<CodeAnalysis> {
    const prompt = this.formatCodeAnalysisPrompt(code, language);
    
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseCodeAnalysis(data.response, code, language);
  }

  private async getLearningInsightsWithOllama(prompt: string): Promise<LearningInsights> {
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseLearningInsights(data.response);
  }

  private parseAIResponse(response: string, context: any): AICodingAssistance {
    // Parse the AI response and extract structured information
    const lines = response.split('\n');
    let explanation = '';
    let code = '';
    const suggestions: CodeSuggestion[] = [];
    const relatedTopics: string[] = [];

    let currentSection = 'explanation';
    for (const line of lines) {
      if (line.includes('Code:') || line.includes('```')) {
        currentSection = 'code';
        continue;
      } else if (line.includes('Suggestions:') || line.includes('Tips:')) {
        currentSection = 'suggestions';
        continue;
      } else if (line.includes('Related:') || line.includes('Topics:')) {
        currentSection = 'topics';
        continue;
      }

      if (currentSection === 'explanation') {
        explanation += line + '\n';
      } else if (currentSection === 'code' && line.trim()) {
        code += line + '\n';
      } else if (currentSection === 'suggestions' && line.includes('-')) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'improvement',
          message: line.replace('-', '').trim(),
          code: '',
          explanation: '',
          difficulty: 'intermediate',
          impact: 'medium'
        });
      } else if (currentSection === 'topics' && line.includes('-')) {
        relatedTopics.push(line.replace('-', '').trim());
      }
    }

    return {
      response: explanation.trim(),
      code: code.trim() || undefined,
      explanation: explanation.trim(),
      suggestions,
      relatedTopics,
      difficulty: this.assessDifficulty(response)
    };
  }

  private parseCodeAnalysis(response: string, code: string, language: string): CodeAnalysis {
    // Parse the AI response and extract code analysis
    const lines = code.split('\n');
    const suggestions: CodeSuggestion[] = [];
    const errors: CodeError[] = [];
    const bestPractices: BestPractice[] = [];

    // Extract score from response
    const scoreMatch = response.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 7;

    // Extract suggestions
    const suggestionLines = response.split('\n').filter(line => 
      line.includes('suggestion') || line.includes('improvement') || line.includes('tip')
    );

    suggestionLines.forEach((line, index) => {
      suggestions.push({
        id: `suggestion-${Date.now()}-${index}`,
        type: 'improvement',
        message: line.replace(/^\d+\.\s*/, '').trim(),
        code: '',
        explanation: '',
        difficulty: 'intermediate',
        impact: 'medium'
      });
    });

    // Extract errors
    const errorLines = response.split('\n').filter(line => 
      line.includes('error') || line.includes('issue') || line.includes('problem')
    );

    errorLines.forEach((line, index) => {
      errors.push({
        id: `error-${Date.now()}-${index}`,
        type: 'logic',
        message: line.replace(/^\d+\.\s*/, '').trim(),
        line: 1,
        column: 1,
        severity: 'warning',
        fix: '',
        explanation: ''
      });
    });

    return {
      score: Math.max(1, Math.min(10, score)),
      suggestions,
      errors,
      complexity: this.assessComplexity(response),
      readability: this.assessReadability(response),
      performance: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        bottlenecks: [],
        optimizations: []
      },
      bestPractices
    };
  }

  private parseLearningInsights(response: string): LearningInsights {
    // Parse the AI response and extract learning insights
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    const nextTopics: string[] = [];
    const studyPlan: StudyPlanItem[] = [];

    const lines = response.split('\n');
    let currentSection = 'general';

    for (const line of lines) {
      if (line.includes('Strengths:') || line.includes('Strong points:')) {
        currentSection = 'strengths';
        continue;
      } else if (line.includes('Weaknesses:') || line.includes('Areas to improve:')) {
        currentSection = 'weaknesses';
        continue;
      } else if (line.includes('Recommendations:') || line.includes('Suggestions:')) {
        currentSection = 'recommendations';
        continue;
      } else if (line.includes('Next topics:') || line.includes('Study next:')) {
        currentSection = 'topics';
        continue;
      }

      if (currentSection === 'strengths' && line.includes('-')) {
        strengths.push(line.replace('-', '').trim());
      } else if (currentSection === 'weaknesses' && line.includes('-')) {
        weaknesses.push(line.replace('-', '').trim());
      } else if (currentSection === 'recommendations' && line.includes('-')) {
        recommendations.push(line.replace('-', '').trim());
      } else if (currentSection === 'topics' && line.includes('-')) {
        nextTopics.push(line.replace('-', '').trim());
      }
    }

    return {
      strengths: strengths.length > 0 ? strengths : ['Good progress in coding'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Continue practicing'],
      recommendations: recommendations.length > 0 ? recommendations : ['Keep learning'],
      nextTopics: nextTopics.length > 0 ? nextTopics : ['Advanced concepts'],
      studyPlan: studyPlan,
      progressScore: 75,
      estimatedTimeToComplete: 30
    };
  }

  private assessDifficulty(response: string): 'beginner' | 'intermediate' | 'advanced' {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('advanced') || lowerResponse.includes('complex') || lowerResponse.includes('expert')) {
      return 'advanced';
    } else if (lowerResponse.includes('intermediate') || lowerResponse.includes('moderate')) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  private assessComplexity(response: string): 'low' | 'medium' | 'high' {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('high') || lowerResponse.includes('complex') || lowerResponse.includes('advanced')) {
      return 'high';
    } else if (lowerResponse.includes('medium') || lowerResponse.includes('moderate')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private assessReadability(response: string): 'poor' | 'fair' | 'good' | 'excellent' {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('excellent') || lowerResponse.includes('very good')) {
      return 'excellent';
    } else if (lowerResponse.includes('good') || lowerResponse.includes('clear')) {
      return 'good';
    } else if (lowerResponse.includes('fair') || lowerResponse.includes('okay')) {
      return 'fair';
    } else {
      return 'poor';
    }
  }
}

// Export singleton instance
export const sinchAIService = new SinchAIService();
